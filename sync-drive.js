/**
 * 구글 드라이브 공유 폴더 및 하위 폴더를 스캔하여 정적 drive-cache.json 생성 (API 키 불필요)
 * GitHub Pages 배포 시 즉시 로딩되도록 캐시 파일을 생성합니다.
 */
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { GOOGLE_DRIVE_FOLDER_URL } = require('./config.js');

function extractIdFromUrl(input) {
  const s = String(input || '').trim();
  const m1 = s.match(/\/folders\/([a-zA-Z0-9_-]{15,})/);
  if (m1) return m1[1];
  const m2 = s.match(/[?&]id=([a-zA-Z0-9_-]{15,})/);
  if (m2) return m2[1];
  return s || '1o3QBRz4f87QC9L-c2wuBADjgb28uUMmw';
}
const DEFAULT_FOLDER_ID = process.env.DRIVE_FOLDER_ID || extractIdFromUrl(GOOGLE_DRIVE_FOLDER_URL);

function fetchUrlText(targetUrl, redirectsLeft = 5) {
  return new Promise((resolve, reject) => {
    const parsed = url.parse(targetUrl);
    https.get({
      hostname: parsed.hostname,
      path: parsed.path,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36'
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirectsLeft > 0) {
        const nextUrl = url.resolve(targetUrl, res.headers.location);
        res.resume();
        return resolve(fetchUrlText(nextUrl, redirectsLeft - 1));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
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

function parseEntriesFromEmbedHtml(html) {
  const subfolders = [];
  const files = [];
  const seen = new Set();

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

    if (href.includes('/folders/') || chunk.includes('drive/folders/')) {
      subfolders.push({ id, name });
    } else if (!isNonImageFile(name)) {
      files.push({ id, name, modifiedTime, uploadIndex: i });
    }
  }
  return { subfolders, files };
}

async function buildCache(rootFolderId, maxDepth = 3) {
  const allPhotos = [];
  const folderCategories = [];
  const visited = new Set();

  async function traverse(folderId, folderName, depth) {
    if (visited.has(folderId) || depth > maxDepth) return;
    visited.add(folderId);

    const embedUrl = `https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(folderId)}&t=${Date.now()}#grid`;
    const html = await fetchUrlText(embedUrl);
    const { subfolders, files } = parseEntriesFromEmbedHtml(html);

    if (files.length > 0) {
      if (!folderCategories.some(f => f.id === folderId)) {
        folderCategories.push({ id: folderId, name: folderName });
      }
      files.forEach(file => {
        allPhotos.push({
          id: file.id,
          name: file.name,
          folderId: folderId,
          folderName: folderName,
          modifiedTime: file.modifiedTime || 0,
          uploadIndex: file.uploadIndex || 0,
          thumbUrl: `https://drive.google.com/thumbnail?id=${file.id}&sz=w800`,
          fullUrl: `https://drive.google.com/thumbnail?id=${file.id}&sz=w2000`,
          driveUrl: `https://drive.google.com/file/d/${file.id}/view`
        });
      });
    }

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

  const output = {
    ok: true,
    folderId: rootFolderId,
    updatedAt: new Date().toISOString(),
    count: allPhotos.length,
    folders: folderCategories,
    photos: allPhotos
  };

  fs.writeFileSync(path.join(__dirname, 'drive-cache.json'), JSON.stringify(output, null, 2), 'utf8');
  console.log(`Generated drive-cache.json with ${allPhotos.length} photos across ${folderCategories.length} folders.`);
}

buildCache(DEFAULT_FOLDER_ID).catch(err => {
  console.error('Failed to build drive cache:', err);
});
