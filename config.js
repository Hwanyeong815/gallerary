/**
 * ============================================================================
 * GALLERY CONFIGURATION (config.js)
 * ============================================================================
 * 아래 GOOGLE_DRIVE_FOLDER_URL 한 줄의 주소만 새로운 구글 드라이브 공유 폴더 링크로 바꾸면
 * 사이트 전체(로컬 서버 및 정적 페이지)가 해당 폴더 및 하위 폴더의 사진들로 영구 변경됩니다.
 */

const GOOGLE_DRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/1o3QBRz4f87QC9L-c2wuBADjgb28uUMmw?usp=sharing';

if (typeof window !== 'undefined') {
  window.GOOGLE_DRIVE_FOLDER_URL = GOOGLE_DRIVE_FOLDER_URL;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GOOGLE_DRIVE_FOLDER_URL };
}
