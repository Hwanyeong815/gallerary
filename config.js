/**
 * ============================================================================
 * GALLERY & BOARD CONFIGURATION (config.js)
 * ============================================================================
 * 1. GOOGLE_DRIVE_FOLDER_URL: 사진 갤러리용 구글 드라이브 공유 폴더 링크
 * 2. GOOGLE_SHEET_CSV_URL: 게시판용 구글 스프레드시트 웹 게시(CSV) 링크
 * 3. BOARD_FORM_URL: 게시판 '+ 작성하기' 클릭 시 연결할 구글 폼 링크 (비워두면 준비중 안내 모달 표시)
 */

const GOOGLE_DRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/1o3QBRz4f87QC9L-c2wuBADjgb28uUMmw?usp=sharing';
const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRSSnDF4kOkpdc395mcK_tVi4yYg5klJfL-iIkHco6Bn2F1VBJqB9Cmj-1eFPiofNKhK00UmIT8YJU5/pub?output=csv';
const BOARD_FORM_URL = '';

if (typeof window !== 'undefined') {
  window.GOOGLE_DRIVE_FOLDER_URL = GOOGLE_DRIVE_FOLDER_URL;
  window.GOOGLE_SHEET_CSV_URL = GOOGLE_SHEET_CSV_URL;
  window.BOARD_FORM_URL = BOARD_FORM_URL;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    GOOGLE_DRIVE_FOLDER_URL,
    GOOGLE_SHEET_CSV_URL,
    BOARD_FORM_URL
  };
}
