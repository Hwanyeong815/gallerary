const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { GOOGLE_DRIVE_FOLDER_URL } = require('./config.js');

const PORT = 3000;
function extractIdFromUrl(input) {
  const s = String(input || '').trim();
  const m1 = s.match(/\/folders\/([a-zA-Z0-9_-]{15,})/);
  if (m1) return m1[1];
  const m2 = s.match(/[?&]id=([a-zA-Z0-9_-]{15,})/);
  if (m2) return m2[1];
  return s || '1o3QBRz4f87QC9L-c2wuBADjgb28uUMmw';
}
const DEFAULT_FOLDER_ID = extractIdFromUrl(GOOGLE_DRIVE_FOLDER_URL);

// HTTPS GET helper that follows redirects
function fetchUrlBuffer(targetUrl, redirectsLeft = 5) {
  return new Promise((resolve, reject) => {
    const parsed = url.parse(targetUrl);
    const options = {
      hostname: parsed.hostname,
      path: parsed.path,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    };

    https.get(options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirectsLeft > 0) {
        const nextUrl = url.resolve(targetUrl, res.headers.location);
        res.resume();
        return resolve(fetchUrlBuffer(nextUrl, redirectsLeft - 1));
      }

      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          buffer: Buffer.concat(chunks)
        });
      });
    }).on('error', reject);
  });
}

function decodeHtmlEntities(str) {
  return String(str || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function isNonImageFile(name) {
  return /\.(pdf|zip|rar|7z|mp4|mov|avi|mkv|doc|docx|xls|xlsx|ppt|pptx|txt|csv|json|js|css|html)$/i.test(name);
}

function parseDriveModifiedTime(chunk, index) {
  const m = chunk.match(/class="flip-entry-last-modified"[\s\S]*?<div>([^<]+)<\/div>/i);
  if (!m) return index;
  const raw = m[1].trim();
  const parsed = Date.parse(raw);
  if (!isNaN(parsed)) return parsed;
  return index;
}

// 단일 embeddedfolderview HTML에서 하위 폴더 목록과 이미지 파일 목록을 분리 추출
function parseEntriesFromEmbedHtml(html) {
  const subfolders = [];
  const files = [];
  const seen = new Set();

  // 각 flip-entry 블록 단위로 분리
  const parts = html.split(/class="flip-entry"/i);
  for (let i = 1; i < parts.length; i++) {
    const chunk = parts[i];
    const idMatch = chunk.match(/id="entry-([a-zA-Z0-9_-]{15,})"/);
    const titleMatch = chunk.match(/<div class="flip-entry-title">([^<]+)<\/div>/);
    const hrefMatch = chunk.match(/href="([^"]+)"/);

    if (!idMatch || !titleMatch) continue;
    const id = idMatch[1];
    if (seen.has(id)) continue;
    seen.add(id);

    const name = decodeHtmlEntities(titleMatch[1].trim());
    const href = hrefMatch ? hrefMatch[1] : '';
    const modifiedTime = parseDriveModifiedTime(chunk, i);

    // 링크가 /drive/folders/ 를 포함하면 하위 폴더
    if (href.includes('/folders/') || chunk.includes('drive/folders/')) {
      subfolders.push({ id, name });
    } else if (!isNonImageFile(name)) {
      files.push({ id, name, modifiedTime, uploadIndex: i });
    }
  }

  return { subfolders, files };
}

// 하위 폴더까지 재귀적으로 탐색하여 폴더 구조와 사진들을 모두 가져옴
async function parseDriveFolderTree(rootFolderId, maxDepth = 3) {
  const allPhotos = [];
  const folderCategories = [];
  const visitedFolders = new Set();

  async function traverse(folderId, folderName, depth) {
    if (visitedFolders.has(folderId) || depth > maxDepth) return;
    visitedFolders.add(folderId);

    const embedUrl = `https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(folderId)}&t=${Date.now()}#grid`;
    const embedRes = await fetchUrlBuffer(embedUrl);
    const html = embedRes.buffer.toString('utf8');

    const { subfolders, files } = parseEntriesFromEmbedHtml(html);

    if (files.length > 0) {
      if (!folderCategories.some(f => f.id === folderId)) {
        folderCategories.push({
          id: folderId,
          name: folderName
        });
      }

      files.forEach(file => {
        allPhotos.push({
          id: file.id,
          name: file.name,
          folderId: folderId,
          folderName: folderName,
          modifiedTime: file.modifiedTime || 0,
          uploadIndex: file.uploadIndex || 0,
          thumbUrl: `/api/image?id=${encodeURIComponent(file.id)}&sz=w800`,
          fullUrl: `/api/image?id=${encodeURIComponent(file.id)}&sz=w2000`,
          driveUrl: `https://drive.google.com/file/d/${file.id}/view`
        });
      });
    }

    // 하위 폴더들을 병렬로 재귀 탐색
    if (subfolders.length > 0 && depth < maxDepth) {
      await Promise.all(
        subfolders.map(sub => {
          const subLabel = folderName && folderName !== '기본 폴더'
            ? `${folderName} / ${sub.name}`
            : sub.name;
          return traverse(sub.id, subLabel, depth + 1);
        })
      );
    }
  }

  await traverse(rootFolderId, '기본 폴더', 0);

  // [진행중] 폴더가 가장 먼저 나오도록 정렬
  folderCategories.sort((a, b) => {
    const aLive = /\[\s*진행\s*중\s*\]/i.test(a.name) ? 1 : 0;
    const bLive = /\[\s*진행\s*중\s*\]/i.test(b.name) ? 1 : 0;
    return bLive - aLive;
  });

  return {
    folders: folderCategories,
    photos: allPhotos
  };
}

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

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // API 1: 하위 폴더 포함 전체 사진 및 폴더 카테고리 조회
  if (pathname === '/api/folder') {
    const folderId = parsedUrl.query.id || DEFAULT_FOLDER_ID;
    try {
      const { folders, photos } = await parseDriveFolderTree(folderId);
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({
        ok: true,
        folderId,
        count: photos.length,
        folders,
        photos
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  // API 2: 구글 드라이브 썸네일 / 원본 이미지 프록시
  if (pathname === '/api/image') {
    const fileId = parsedUrl.query.id;
    const sz = parsedUrl.query.sz || 'w800';
    if (!fileId) {
      res.writeHead(400);
      res.end('Missing id');
      return;
    }

    try {
      const thumbUrl = `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=${encodeURIComponent(sz)}`;
      const imgRes = await fetchUrlBuffer(thumbUrl);
      const contentType = imgRes.headers['content-type'] || 'image/jpeg';
      res.writeHead(200, {
        'Content-Type': contentType,
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

  // 정적 파일 서빙
  let safePath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.join(__dirname, safePath);

  if (!filePath.startsWith(__dirname)) {
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
