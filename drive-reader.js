/**
 * 구글 드라이브 공유 폴더 읽기 (server.js · sync-drive.js 가 함께 씀, API 키 불필요)
 * - 폴더 안 사진 목록, 하위 폴더(최대 3단계), 공모전 설명 txt 를 읽어 옴
 * - 하위 폴더 이름은 '상위 / 하위' 로 이어 붙임 (예: '소마대전 / 주제:가을')
 */
const https = require('https');

// 리다이렉트를 따라가며 내용을 받아 옴
function fetchUrlBuffer(targetUrl, redirectsLeft = 5) {
  return new Promise((resolve, reject) => {
    const target = new URL(targetUrl);
    const options = {
      hostname: target.hostname,
      path: `${target.pathname}${target.search}`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    };

    https.get(options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirectsLeft > 0) {
        const nextUrl = new URL(res.headers.location, targetUrl).toString();
        res.resume();
        resolve(fetchUrlBuffer(nextUrl, redirectsLeft - 1));
        return;
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

function extractIdFromUrl(input, fallback = '1o3QBRz4f87QC9L-c2wuBADjgb28uUMmw') {
  const s = String(input || '').trim();
  const m1 = s.match(/\/folders\/([a-zA-Z0-9_-]{15,})/);
  if (m1) return m1[1];
  const m2 = s.match(/[?&]id=([a-zA-Z0-9_-]{15,})/);
  if (m2) return m2[1];
  return s || fallback;
}

function decodeHtmlEntities(str) {
  return String(str || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function isTextFile(name) {
  return /\.txt$/i.test(name);
}

function isNonImageFile(name) {
  return /\.(pdf|zip|rar|7z|mp4|mov|avi|mkv|doc|docx|xls|xlsx|ppt|pptx|txt|csv|json|js|css|html)$/i.test(name);
}

// 영어 설명 파일: 이름에 en / eng / english 가 따로 들어간 txt (예: 설명_en.txt, description.en.txt)
function isEnglishTextFile(name) {
  const base = String(name || '').replace(/\.txt$/i, '');
  return /(^|[^a-z])(en|eng|english)(?=[^a-z]|$)/i.test(base);
}

// 폴더 안 txt 중 설명으로 쓸 파일 고르기 ('설명'·'소개'가 들어간 이름 우선)
function pickDescriptionFiles(texts) {
  const en = texts.find(f => isEnglishTextFile(f.name)) || null;
  const koCandidates = texts.filter(f => !isEnglishTextFile(f.name));
  const ko = koCandidates.find(f => /설명|소개|description|about/i.test(f.name)) || koCandidates[0] || null;
  return { ko, en };
}

function cleanDescriptionText(text) {
  const s = String(text || '').replace(/^﻿/, '').replace(/\r\n?/g, '\n').trim();
  if (!s || /^<!doctype html|^<html/i.test(s)) return '';
  return s.slice(0, 3000);
}

function parseDriveModifiedTime(chunk, index) {
  const m = chunk.match(/class="flip-entry-last-modified"[\s\S]*?<div>([^<]+)<\/div>/i);
  if (!m) return index;
  const parsed = Date.parse(m[1].trim());
  return !isNaN(parsed) ? parsed : index;
}

// 드라이브 공개 폴더 화면(embeddedfolderview)에서 하위 폴더 · 사진 · txt 를 나눠 뽑음
function parseEntriesFromEmbedHtml(html) {
  const subfolders = [];
  const files = [];
  const texts = [];
  const seen = new Set();

  const parts = String(html || '').split(/class="flip-entry"/i);
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

    if (href.includes('/folders/') || chunk.includes('drive/folders/')) {
      subfolders.push({ id, name });
    } else if (isTextFile(name)) {
      texts.push({ id, name });
    } else if (!isNonImageFile(name)) {
      files.push({ id, name, modifiedTime: parseDriveModifiedTime(chunk, i), uploadIndex: i });
    }
  }

  return { subfolders, files, texts };
}

// 공개 txt 파일 내용 받기 (실패하면 빈 문자열)
async function fetchDriveText(fileId) {
  try {
    const res = await fetchUrlBuffer(`https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`);
    if (res.statusCode !== 200) return '';
    if (/text\/html/i.test(String(res.headers['content-type'] || ''))) return '';
    return cleanDescriptionText(res.buffer.toString('utf8'));
  } catch (err) {
    return '';
  }
}

/**
 * 하위 폴더까지 읽어 { folders, photos } 를 돌려줌
 * photoUrls(fileId) → { thumbUrl, fullUrl } 로 사진 주소 형식을 정함
 */
async function readDriveFolderTree(rootFolderId, { photoUrls, maxDepth = 3 } = {}) {
  const photos = [];
  const folders = [];
  const visited = new Set();
  // 읽지 못한 폴더 (공유가 꺼졌거나 드라이브 오류) — 하나라도 있으면 목록 일부가 빠졌을 수 있음
  const failures = [];

  // orderKey: 드라이브에 나온 순서. 하위 폴더를 동시에 읽어도 결과 순서가 매번 같도록 마지막에 이 값으로 정렬
  const folderOrder = new Map();

  async function traverse(folderId, folderName, depth, orderKey) {
    if (visited.has(folderId) || depth > maxDepth) return;
    folderOrder.set(folderId, orderKey);
    visited.add(folderId);

    const embedUrl = `https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(folderId)}&t=${Date.now()}#grid`;
    let embedRes;
    try {
      embedRes = await fetchUrlBuffer(embedUrl);
    } catch (err) {
      failures.push({ folderId, folderName, reason: err.message });
      return;
    }
    if (embedRes.statusCode !== 200) {
      failures.push({ folderId, folderName, reason: `HTTP ${embedRes.statusCode}` });
      return;
    }
    const { subfolders, files, texts } = parseEntriesFromEmbedHtml(embedRes.buffer.toString('utf8'));

    if (files.length > 0) {
      const folder = { id: folderId, name: folderName };
      const { ko, en } = pickDescriptionFiles(texts);
      const [description, descriptionEn] = await Promise.all([
        ko ? fetchDriveText(ko.id) : '',
        en ? fetchDriveText(en.id) : ''
      ]);
      if (description) folder.description = description;
      if (descriptionEn) folder.descriptionEn = descriptionEn;
      if (!folders.some(f => f.id === folderId)) folders.push(folder);

      files.forEach(file => {
        photos.push({
          id: file.id,
          name: file.name,
          folderId,
          folderName,
          modifiedTime: file.modifiedTime || 0,
          uploadIndex: file.uploadIndex || 0,
          ...photoUrls(file.id),
          driveUrl: `https://drive.google.com/file/d/${file.id}/view`
        });
      });
    }

    if (subfolders.length > 0 && depth < maxDepth) {
      await Promise.all(
        subfolders.map((sub, i) => {
          const subLabel = folderName && folderName !== '기본 폴더'
            ? `${folderName} / ${sub.name}`
            : sub.name;
          return traverse(sub.id, subLabel, depth + 1, `${orderKey}.${String(i).padStart(4, '0')}`);
        })
      );
    }
  }

  await traverse(rootFolderId, '기본 폴더', 0, '0');

  const keyOf = id => folderOrder.get(id) || '';
  const byKey = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
  // [진행중] 폴더가 가장 먼저, 나머지는 드라이브에 나온 순서
  folders.sort((a, b) => {
    const aLive = /\[\s*진행\s*중\s*\]/i.test(a.name) ? 1 : 0;
    const bLive = /\[\s*진행\s*중\s*\]/i.test(b.name) ? 1 : 0;
    return (bLive - aLive) || byKey(keyOf(a.id), keyOf(b.id));
  });
  photos.sort((a, b) => byKey(keyOf(a.folderId), keyOf(b.folderId)) || (a.uploadIndex - b.uploadIndex));

  return { folders, photos, failures };
}

module.exports = {
  fetchUrlBuffer,
  extractIdFromUrl,
  readDriveFolderTree
};
