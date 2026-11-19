/**
 * ============================================================================
 * GALLERY CONFIGURATION (config.js)
 * ============================================================================
 * GOOGLE_DRIVE_FOLDER_URL: 사진 갤러리용 구글 드라이브 공유 폴더 링크
 *   (폴더 공유 설정은 '링크가 있는 모든 사용자 · 뷰어'여야 함)
 *
 * KAKAO_OPENCHAT_URL: 진행 중 공모전 투표를 하는 카카오톡 오픈채팅방 링크 (https://open.kakao.com/...)
 *   비워 두면 "투표는 카카오톡 오픈채팅방에서 해 주세요" 문구만 나오고,
 *   넣으면 그 옆에 '오픈채팅방 열기' 버튼이 생김
 *
 * 공모전 설명: 드라이브의 각 공모전 폴더에 .txt 파일을 넣으면 그 내용이 공모전 설명이 됨
 *   - 이름에 '설명'이나 '소개'가 들어간 txt를 먼저 씀 (예: 설명.txt)
 *   - 영어 화면용은 이름에 en을 붙인 txt (예: 설명_en.txt)
 *   - 배포 사이트에 반영하려면 `node sync-drive.js`를 실행한 뒤 push
 */

const GOOGLE_DRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/1o3QBRz4f87QC9L-c2wuBADjgb28uUMmw?usp=sharing';
const KAKAO_OPENCHAT_URL = '';

if (typeof window !== 'undefined') {
  window.GOOGLE_DRIVE_FOLDER_URL = GOOGLE_DRIVE_FOLDER_URL;
  window.KAKAO_OPENCHAT_URL = KAKAO_OPENCHAT_URL;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    GOOGLE_DRIVE_FOLDER_URL,
    KAKAO_OPENCHAT_URL
  };
}
