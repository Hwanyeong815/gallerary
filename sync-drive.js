/**
 * 구글 드라이브 공유 폴더와 하위 폴더를 읽어 drive-cache.json 을 새로 만듦 (API 키 불필요)
 * - 배포 사이트(GitHub Pages)는 이 파일을 먼저 읽어 바로 보여 줌
 * - 드라이브에 사진·폴더 이름·설명 txt 를 바꿨다면: `node sync-drive.js` 실행 → push
 */
const fs = require('fs');
const path = require('path');
const { GOOGLE_DRIVE_FOLDER_URL } = require('./config.js');
const { extractIdFromUrl, readDriveFolderTree } = require('./drive-reader.js');

const DEFAULT_FOLDER_ID = process.env.DRIVE_FOLDER_ID || extractIdFromUrl(GOOGLE_DRIVE_FOLDER_URL);

async function buildCache(rootFolderId) {
  const { folders, photos } = await readDriveFolderTree(rootFolderId, {
    photoUrls: id => ({
      thumbUrl: `https://drive.google.com/thumbnail?id=${id}&sz=w800`,
      fullUrl: `https://drive.google.com/thumbnail?id=${id}&sz=w2000`
    })
  });

  const output = {
    ok: true,
    folderId: rootFolderId,
    updatedAt: new Date().toISOString(),
    count: photos.length,
    folders,
    photos
  };

  fs.writeFileSync(path.join(__dirname, 'drive-cache.json'), JSON.stringify(output, null, 2), 'utf8');
  const described = folders.filter(f => f.description || f.descriptionEn).length;
  console.log(`Generated drive-cache.json with ${photos.length} photos across ${folders.length} folders (${described} with a description txt).`);
}

buildCache(DEFAULT_FOLDER_ID).catch(err => {
  console.error('Failed to build drive cache:', err);
  process.exitCode = 1;
});
