/**
 * 구글 드라이브 공유 폴더와 하위 폴더를 읽어 drive-cache.json 을 새로 만듦 (API 키 불필요)
 * - 배포 사이트(GitHub Pages)는 이 파일을 먼저 읽어 바로 보여 줌
 * - GitHub Actions(.github/workflows/sync-drive.yml)가 약 10분마다 자동으로 실행함
 * - 직접 돌리려면: `node sync-drive.js` 실행 → push
 * - 사진 · 폴더 · 설명이 그대로면 파일을 다시 쓰지 않음 (쓸데없는 자동 커밋 방지)
 * - 폴더를 하나라도 못 읽으면(공유 꺼짐 등) 기존 파일을 그대로 두고 실패로 끝냄
 */
const fs = require('fs');
const path = require('path');
const { GOOGLE_DRIVE_FOLDER_URL } = require('./config.js');
const { extractIdFromUrl, readDriveFolderTree, fillPhotoSizes } = require('./drive-reader.js');

const DEFAULT_FOLDER_ID = process.env.DRIVE_FOLDER_ID || extractIdFromUrl(GOOGLE_DRIVE_FOLDER_URL);
const CACHE_PATH = path.join(__dirname, 'drive-cache.json');

function contentKey(data) {
  return JSON.stringify([data.folderId, data.folders, data.photos]);
}

async function buildCache(rootFolderId) {
  const { folders, photos, failures } = await readDriveFolderTree(rootFolderId, {
    photoUrls: id => ({
      thumbUrl: `https://drive.google.com/thumbnail?id=${id}&sz=w800`,
      fullUrl: `https://drive.google.com/thumbnail?id=${id}&sz=w2000`
    })
  });

  if (failures.length > 0) {
    console.error(`Could not read ${failures.length} folder(s); keeping the existing drive-cache.json.`);
    failures.forEach(f => console.error(`  - ${f.folderName} (${f.folderId}): ${f.reason}`));
    process.exitCode = 1;
    return;
  }
  if (photos.length === 0) {
    console.error('Drive returned no photos (sharing may be off); keeping the existing drive-cache.json.');
    process.exitCode = 1;
    return;
  }

  // 사진 가로·세로 크기: 예전 목록에 있던 사진은 그대로 쓰고, 새 사진만 드라이브에서 읽음
  let previous = null;
  try {
    previous = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
  } catch (e) {}
  const knownSizes = new Map(
    ((previous && previous.photos) || [])
      .filter(p => p.width && p.height)
      .map(p => [p.id, { width: p.width, height: p.height }])
  );
  await fillPhotoSizes(photos, knownSizes);

  const output = {
    ok: true,
    folderId: rootFolderId,
    updatedAt: new Date().toISOString(),
    count: photos.length,
    folders,
    photos
  };

  if (previous && contentKey(previous) === contentKey(output)) {
    console.log(`No changes on Drive (${photos.length} photos across ${folders.length} folders); drive-cache.json left as is.`);
    return;
  }

  fs.writeFileSync(CACHE_PATH, JSON.stringify(output, null, 2), 'utf8');
  const described = folders.filter(f => f.description || f.descriptionEn).length;
  console.log(`Generated drive-cache.json with ${photos.length} photos across ${folders.length} folders (${described} with a description txt).`);
}

buildCache(DEFAULT_FOLDER_ID).catch(err => {
  console.error('Failed to build drive cache:', err);
  process.exitCode = 1;
});
