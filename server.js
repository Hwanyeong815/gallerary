/**
 * 내 PC에서 사이트 미리보기: `node server.js` → http://localhost:3000
 * - /api/folder : 드라이브 사진 목록 (live=1 이면 저장된 목록 대신 드라이브를 바로 읽음)
 * - /api/image  : 드라이브 사진 미리보기 중계
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { GOOGLE_DRIVE_FOLDER_URL } = require('./config.js');
const { fetchUrlBuffer, extractIdFromUrl, readDriveFolderTree } = require('./drive-reader.js');

const PORT = Number(process.env.PORT) || 3000;
const DEFAULT_FOLDER_ID = extractIdFromUrl(GOOGLE_DRIVE_FOLDER_URL);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

function sendJson(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = requestUrl.pathname;

  // 사진 목록 (하위 폴더 · 공모전 설명 txt 포함)
  if (pathname === '/api/folder') {
    const folderId = requestUrl.searchParams.get('id') || DEFAULT_FOLDER_ID;
    const forceLive = requestUrl.searchParams.get('live') === '1';

    if (!forceLive) {
      try {
        const cachePath = path.join(__dirname, 'drive-cache.json');
        if (fs.existsSync(cachePath)) {
          const cached = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
          // 드라이브 링크를 바꾼 뒤라면 예전 폴더의 저장 목록은 쓰지 않고 새 폴더를 바로 읽음
          if (cached && cached.ok && cached.folderId === folderId && Array.isArray(cached.photos) && cached.photos.length > 0) {
            sendJson(res, 200, cached);
            return;
          }
        }
      } catch (cacheErr) {}
    }

    try {
      const { folders, photos } = await readDriveFolderTree(folderId, {
        photoUrls: id => ({
          thumbUrl: `/api/image?id=${encodeURIComponent(id)}&sz=w800`,
          fullUrl: `/api/image?id=${encodeURIComponent(id)}&sz=w2000`
        })
      });
      sendJson(res, 200, { ok: true, folderId, count: photos.length, folders, photos });
    } catch (err) {
      sendJson(res, 500, { ok: false, error: err.message });
    }
    return;
  }

  // 드라이브 사진 미리보기 중계
  if (pathname === '/api/image') {
    const fileId = requestUrl.searchParams.get('id');
    const sz = requestUrl.searchParams.get('sz') || 'w800';
    if (!fileId) {
      res.writeHead(400);
      res.end('Missing id');
      return;
    }

    try {
      const thumbUrl = `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=${encodeURIComponent(sz)}`;
      const imgRes = await fetchUrlBuffer(thumbUrl);
      res.writeHead(200, {
        'Content-Type': imgRes.headers['content-type'] || 'image/jpeg',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(imgRes.buffer);
    } catch (err) {
      res.writeHead(502);
      res.end('Failed to load image');
    }
    return;
  }

  // 정적 파일 (점으로 시작하는 폴더·파일은 내보내지 않음)
  const safePath = pathname === '/' ? '/index.html' : decodeURIComponent(pathname);
  const filePath = path.join(__dirname, safePath);

  if (!filePath.startsWith(__dirname) || safePath.split('/').some(part => part.startsWith('.'))) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`Google Drive Photo Gallery Server running at http://localhost:${PORT}`);
});
