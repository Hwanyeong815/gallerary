/* ==========================================================================
   각자의 프레임 — 사진 공모전 갤러리 스크립트
   ========================================================================== */

// config.js에서 설정한 값 (없으면 기본값)
const CONFIGURED_FOLDER_URL =
  (typeof window !== 'undefined' && window.GOOGLE_DRIVE_FOLDER_URL) ||
  'https://drive.google.com/drive/folders/1o3QBRz4f87QC9L-c2wuBADjgb28uUMmw?usp=sharing';

// 카카오톡 오픈채팅방 주소 (config.js의 KAKAO_OPENCHAT_URL, 비어 있으면 링크 버튼 없이 안내 문구만)
// config.js와 이름이 겹치지 않도록 여기서는 CONFIGURED_KAKAO_URL로 씀
const CONFIGURED_KAKAO_URL = (() => {
  const raw = typeof window !== 'undefined' ? String(window.KAKAO_OPENCHAT_URL || '').trim() : '';
  return /^https:\/\//i.test(raw) ? raw : '';
})();

// 구글 Drive API 키 (config.js의 GOOGLE_API_KEY). 있으면 페이지를 열 때마다 드라이브를 바로 읽음
const CONFIGURED_API_KEY = typeof window !== 'undefined' ? String(window.GOOGLE_API_KEY || '').trim() : '';

/* ==========================================================================
   1. 화면 문구 (한국어 / English) — 우측 상단 EN 버튼으로 전환
   ========================================================================== */
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

const STRINGS = {
  ko: {
    navGallery: '갤러리',
    navContests: '공모전 아카이브',
    navMini: '소마대전',
    langToggle: 'EN',
    langToggleAria: '영어로 보기',
    searchOpen: '검색창 열기',
    refresh: '구글 드라이브 최신 목록 새로고침',
    themeToggle: '어둡게 / 밝게 전환',
    phGallery: '작품, 작가 검색...',
    phContests: '공모전명, 연도, 참여 작가 검색...',
    phMini: '회차, 연도, 참여 작가 검색...',

    heroEyebrow: '전시 아카이브',
    heroTitle: '각자의 프레임',
    heroSubtitle: '잘 찍은 사진이 아니어도 괜찮아요.<br />초보와 고수의 경계 없이 각자의 시선으로 기록한 순간들의 컬렉션.',
    loadingCollection: '컬렉션 불러오는 중',
    syncing: '컬렉션 동기화 중...',
    syncingLive: '최신 목록 동기화 중...',
    photoCount: n => `${n}장의 사진`,
    loadFailed: '폴더에서 사진을 불러오지 못했습니다. config.js의 드라이브 폴더 공유 권한이 "링크가 있는 모든 사용자"인지 확인해 주세요.',
    connError: '연결 오류',
    errorPrefix: msg => `오류가 발생했습니다: ${msg}`,
    toastUpdated: '최신 목록으로 업데이트되었습니다',
    liveFailed: '드라이브를 지금 읽지 못해 저장된 목록을 보여 드려요',
    lastUpdated: text => `최종 갱신: ${text}`,
    footerMaker: '제작자: 웰컴',

    all: '전체',
    miniGroup: '소마대전',
    ongoingDotTitle: '진행중',
    entryNumber: n => `${n}번`,
    entry: '출품작',
    unknownAuthor: '작가 미상',
    viewLarge: label => `${label} 크게 보기`,
    awardGrand: '대상',
    awardBest: '최우수상',
    awardFirst: '1등',
    awardWin: '우승',
    awardExcellence: '우수상',
    awardHonor: '입선',

    statusOngoing: '진행 중',
    statusEnded: '종료',
    voteNote: '투표는 카카오톡 오픈채팅방에서 해 주세요.',
    kakaoLink: '오픈채팅방 열기',
    ongoingDesc: '작가명과 제목은 투표가 끝난 뒤 공개됩니다.',

    popupBadge: '진행중',
    popupTitle: name => `현재 ${name} 진행 중입니다`,
    popupDesc: '카카오톡 오픈채팅방에서 투표 진행 중인 사진입니다.<br />투표는 오픈채팅방에서 부탁드려요.',
    popupViewNow: '작품 보러가기',
    close: '닫기',
    closePopup: '팝업 닫기',

    contestsTitle: '공모전 아카이브',
    contestsSubtitle: '지금까지 열린 공모전을 연도별로 모았습니다. 공모전을 누르면 출품작과 수상작을 볼 수 있어요.',
    miniTitle: '소마대전',
    miniSubtitle: '소마대전은 미니 공모전입니다. 회차를 누르면 출품작과 수상작을 볼 수 있어요.',
    winTallyLabel: '누적 우승',
    winTallyItem: (name, n) => `${name} ${n}승`,
    filterAll: n => `전체 (${n})`,
    filterLive: n => `진행 중 (${n})`,
    filterEnded: n => `종료 (${n})`,
    filterYear: y => `${y}년`,
    noContests: '아직 공모전이 없습니다.',
    noMini: '아직 소마대전이 없습니다.<br />드라이브에 \'소마대전\' 폴더를 만들고 회차별 폴더를 그 안에 넣으면 이곳에 모입니다.',
    noMatchContests: '조건에 해당하는 공모전이 없습니다.',
    yearCount: n => `공모전 ${n}개`,
    statEntries: n => `출품 ${n}점`,
    statAuthors: n => `작가 ${n}명`,
    viewExhibition: '전시 보기',
    viewExhibitionOf: name => `${name} 전시 보기`,

    detailLoading: '공모전 정보를 불러오는 중입니다...',
    backToContests: '공모전 아카이브로 돌아가기',
    backToMini: '소마대전으로 돌아가기',
    kindMini: '소마대전',
    statLabelEntries: '출품',
    statLabelAuthors: '참여 작가',
    pieces: n => `${n}점`,
    people: n => `${n}명`,
    judging: '심사 중',
    none: '없음',
    revealAfterVote: '투표 후 공개',
    sectionEntries: '출품작',
    shownOf: (shown, total) => `${shown} / ${total}점`,
    noMatchEntries: '검색어에 맞는 출품작이 없습니다.',

    loadMore: '더보기',
    lightboxLabel: '사진 크게 보기',
    prevPhoto: '이전 사진',
    nextPhoto: '다음 사진',
    cursorView: '보기',
    cursorOpen: '열기',

    moodBtn: '기분전환',
    moodBtnAria: '사이트 분위기 고르기 (새로고침하면 원래대로)',
  },

  en: {
    navGallery: 'Gallery',
    navContests: 'Contests',
    navMini: 'Mini contests',
    langToggle: '한',
    langToggleAria: 'View in Korean',
    searchOpen: 'Open search',
    refresh: 'Refresh from Google Drive',
    themeToggle: 'Switch dark / light',
    phGallery: 'Search works or photographers',
    phContests: 'Search contests, years, photographers',
    phMini: 'Search rounds, years, photographers',

    heroEyebrow: 'Exhibition archive',
    heroTitle: 'Frames of Our Own',
    heroSubtitle: 'It doesn’t have to be a perfect shot.<br />Moments seen through each person’s eyes, beginners and pros alike.',
    loadingCollection: 'Loading the collection',
    syncing: 'Syncing the collection…',
    syncingLive: 'Syncing the latest list…',
    photoCount: n => plural(n, 'photo', 'photos'),
    loadFailed: 'Couldn’t load photos from the folder. Check that the Drive folder in config.js is shared with “Anyone with the link”.',
    connError: 'Connection error',
    errorPrefix: msg => `Something went wrong: ${msg}`,
    toastUpdated: 'Updated to the latest list',
    liveFailed: 'Couldn’t reach Drive right now, showing the saved list',
    lastUpdated: text => `Last updated: ${text}`,
    footerMaker: 'Made by 웰컴',

    all: 'All',
    miniGroup: 'Mini',
    ongoingDotTitle: 'Ongoing',
    entryNumber: n => `No. ${n}`,
    entry: 'Entry',
    unknownAuthor: 'Unknown photographer',
    viewLarge: label => `View ${label} larger`,
    awardGrand: 'Grand prize',
    awardBest: 'Best award',
    awardFirst: '1st place',
    awardWin: 'Winner',
    awardExcellence: 'Excellence award',
    awardHonor: 'Honorable mention',

    statusOngoing: 'Ongoing',
    statusEnded: 'Closed',
    voteNote: 'Voting happens in our KakaoTalk open chat.',
    kakaoLink: 'Open the chat room',
    ongoingDesc: 'Photographers and titles are revealed after voting ends.',

    popupBadge: 'Ongoing',
    popupTitle: name => `${name} is now open`,
    popupDesc: 'These photos are up for a vote in our KakaoTalk open chat.<br />Please cast your vote there.',
    popupViewNow: 'See the entries',
    close: 'Close',
    closePopup: 'Close',

    contestsTitle: 'Contest archive',
    contestsSubtitle: 'Every contest so far, by year. Pick one to see its entries and winners.',
    miniTitle: 'Mini contests',
    miniSubtitle: '소마대전 is our mini contest series. Pick a round to see its entries and winners.',
    winTallyLabel: 'Total wins',
    winTallyItem: (name, n) => `${name} ${n}`,
    filterAll: n => `All (${n})`,
    filterLive: n => `Ongoing (${n})`,
    filterEnded: n => `Closed (${n})`,
    filterYear: y => `${y}`,
    noContests: 'No contests yet.',
    noMini: 'No mini contests yet.<br />Create a “소마대전” folder in Drive and put each round’s folder inside it.',
    noMatchContests: 'No contests match.',
    yearCount: n => plural(n, 'contest', 'contests'),
    statEntries: n => plural(n, 'entry', 'entries'),
    statAuthors: n => plural(n, 'photographer', 'photographers'),
    viewExhibition: 'View exhibition',
    viewExhibitionOf: name => `View ${name}`,

    detailLoading: 'Loading the contest…',
    backToContests: 'Back to contests',
    backToMini: 'Back to mini contests',
    kindMini: 'Mini contest',
    statLabelEntries: 'Entries',
    statLabelAuthors: 'Photographers',
    pieces: n => `${n}`,
    people: n => `${n}`,
    judging: 'Judging',
    none: 'None',
    revealAfterVote: 'After voting',
    sectionEntries: 'Entries',
    shownOf: (shown, total) => `${shown} / ${total}`,
    noMatchEntries: 'No entries match your search.',

    loadMore: 'Show more',
    lightboxLabel: 'Photo viewer',
    prevPhoto: 'Previous photo',
    nextPhoto: 'Next photo',
    cursorView: 'View',
    cursorOpen: 'Open',

    moodBtn: 'Mood swap',
    moodBtnAria: 'Pick a mood for the site (refresh to reset)',
  }
};

let currentLang = (() => {
  try {
    return localStorage.getItem('gallery-lang') === 'en' ? 'en' : 'ko';
  } catch (e) {
    return 'ko';
  }
})();

function t(key, ...args) {
  const table = STRINGS[currentLang] || STRINGS.ko;
  const entry = key in table ? table[key] : STRINGS.ko[key];
  if (typeof entry === 'function') return entry(...args);
  return entry !== undefined ? entry : key;
}

// HTML에 data-i18n(글자) / data-i18n-html(줄바꿈 포함) / data-i18n-aria / data-i18n-title 로 표시한 문구 바꾸기
function applyStaticTexts() {
  document.documentElement.lang = currentLang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    el.setAttribute('aria-label', t(el.dataset.i18nAria));
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.setAttribute('title', t(el.dataset.i18nTitle));
  });

  const langBtn = document.getElementById('btnLangToggle');
  if (langBtn) {
    langBtn.textContent = t('langToggle');
    langBtn.setAttribute('aria-label', t('langToggleAria'));
  }

  document.querySelectorAll('.hero-title, .archive-page-title').forEach(splitTitleChars);
  renderFooterLastUpdated();
}

function setLanguage(lang) {
  currentLang = lang === 'en' ? 'en' : 'ko';
  try {
    localStorage.setItem('gallery-lang', currentLang);
  } catch (e) {}

  applyStaticTexts();
  renderFolderTabs();
  switchMainView(currentMainView);

  if (isOngoingModalOpen) updateOngoingPopup();
  const lightbox = document.getElementById('lightboxModal');
  if (lightbox && !lightbox.classList.contains('hidden')) updateLightboxContent();
  // 기분전환(moods.js)이 켜져 있으면 그 문구도 바꿈
  if (typeof window.refreshMoodTexts === 'function') window.refreshMoodTexts();
}

/* ==========================================================================
   날짜 · 맨 아래 최종 갱신
   ========================================================================== */
function formatDateYMD(dateObj) {
  const d = dateObj instanceof Date && !isNaN(dateObj) ? dateObj : new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
}

function formatDateTimeYMDHM(dateObj) {
  const d = dateObj instanceof Date && !isNaN(dateObj) ? dateObj : new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${formatDateYMD(d)} ${hh}:${min}`;
}

let footerUpdatedAt = { date: new Date(), withTime: false };

function updateFooterLastUpdated(withTime = false, customDate = null) {
  footerUpdatedAt = { date: customDate ? new Date(customDate) : new Date(), withTime };
  renderFooterLastUpdated();
}

function renderFooterLastUpdated() {
  const el = document.getElementById('footerLastUpdated');
  if (!el) return;
  const { date, withTime } = footerUpdatedAt;
  el.textContent = t('lastUpdated', withTime ? formatDateTimeYMDHM(date) : formatDateYMD(date));
}

/* ==========================================================================
   상태
   ========================================================================== */
let allPhotos = [];
let folderCategories = [];
let selectedSubfolderId = 'ALL';
let searchQuery = '';
let currentOngoingFolder = null;
let isOngoingModalOpen = false;
let ongoingModalDismissedOnThisLoad = false;
let filteredPhotos = [];
let activePhotoIndex = 0;
// 크게 보기에서 수상 표시를 할지 (공모전 아카이브 · 역대 수상작에서 열었을 때만)
let lightboxShowAwards = false;
let revealObserver = null;
let toastTimer = null;

// 메인 섹션 전환 상태: 'gallery' | 'competitions' | 'mini' | 'competition-detail'
let currentMainView = 'gallery';
let selectedCompetitionId = null;
// 공모전 아카이브 / 소마대전 목록의 필터 선택 (각각 따로 기억)
const compListFilter = { regular: 'ALL', mini: 'ALL' };
// 공모전 상세에서 '돌아가기'를 누르면 갈 목록 ('competitions' 또는 'mini')
let detailReturnView = 'competitions';

const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/* ==========================================================================
   2. [진행중] 공모전 · 소마대전 폴더
   ========================================================================== */
function isOngoingFolder(folderName) {
  return /(?:\[\s*진행\s*중\s*\]|진행\s*중)/i.test(String(folderName || ''));
}

function cleanOngoingFolderName(folderName) {
  return String(folderName || '')
    .replace(/\[\s*진행\s*중\s*\]/gi, '')
    .replace(/진행\s*중/gi, '')
    .replace(/^[\s/·_-]+|[\s/·_-]+$/g, '')
    .trim() || '공모전';
}

/* 소마대전(미니 공모전)
   폴더 이름에 '소마대전'이 들어가거나 드라이브의 '소마대전' 폴더 안에 넣은 폴더는
   공모전 아카이브와 따로 '소마대전' 메뉴에 모임 (하위 폴더 이름은 '소마대전 / 회차'로 들어옴) */
const MINI_CONTEST_NAME = '소마대전';

function isMiniFolder(folderName) {
  return String(folderName || '').includes(MINI_CONTEST_NAME);
}

/* 드라이브 폴더 구조: 맨 위 폴더 안에 '공식전', '소마대전' 같은 묶음 폴더가 있고 그 안에 회차 폴더
   (하위 폴더 이름은 '공식전 / 1차 공식전 햇빛(후드 우승)' 처럼 '상위 / 하위' 로 들어옴) */

// 회차 이름 끝의 '(소라 우승)' 같은 우승자 표시 지우기 (우승자는 공모전 아카이브에서만 보여 줌)
function stripWinnerNote(name) {
  return String(name || '')
    .replace(/\s*\(\s*[^()]*?우승\s*\)\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// 폴더 이름의 '(소라 우승)' → '소라'
function getFolderWinnerName(folderName) {
  const m = String(folderName || '').match(/\(\s*([^()]+?)\s*우승\s*\)/);
  return m ? m[1].trim() : '';
}

// 회차 번호 '3차' → 3 (없으면 null)
function getRoundNumber(folderName) {
  const m = String(folderName || '').match(/(\d+)\s*차/);
  return m ? Number(m[1]) : null;
}

// 묶음 이름: 하위 폴더면 맨 앞 폴더 이름(예: '공식전', '소마대전'), 맨 위에 바로 있는 폴더면 ''
function getFolderGroupName(folderName) {
  const parts = String(folderName || '').split(/\s+\/\s+/).map(s => s.trim()).filter(Boolean);
  return parts.length > 1 ? cleanOngoingFolderName(parts[0]) : '';
}

// 목록 안에서 쓸 짧은 이름: 경로의 마지막 폴더 이름에서 [진행중] · (OO 우승) 표시를 뺀 것
function getFolderShortName(folderName) {
  const parts = cleanOngoingFolderName(folderName).split(/\s+\/\s+/).map(s => s.trim()).filter(Boolean);
  const last = parts.length ? parts[parts.length - 1] : cleanOngoingFolderName(folderName);
  return stripWinnerNote(last) || last;
}

// 여러 공모전이 섞여 보이는 곳(갤러리 캡션, 수상작, 크게 보기, 팝업)에 쓸 이름: 소마대전이면 앞에 붙임
function getFolderFullName(folderName) {
  const short = getFolderShortName(folderName);
  return isMiniFolder(folderName) && !short.includes(MINI_CONTEST_NAME)
    ? `${MINI_CONTEST_NAME} ${short}`
    : short;
}

// 폴더 순서: [진행중] 먼저 → 묶음은 드라이브에 나온 순서 → 같은 묶음 안에서는 최근 회차(숫자 큰 것)부터
function sortFoldersOngoingFirst(folders) {
  const groupOrder = new Map();
  folders.forEach(f => {
    const g = getFolderGroupName(f.name) || f.id;
    if (!groupOrder.has(g)) groupOrder.set(g, groupOrder.size);
  });
  return [...folders].sort((a, b) => {
    const aOngoing = isOngoingFolder(a.name) ? 1 : 0;
    const bOngoing = isOngoingFolder(b.name) ? 1 : 0;
    if (aOngoing !== bOngoing) return bOngoing - aOngoing;

    const ga = groupOrder.get(getFolderGroupName(a.name) || a.id);
    const gb = groupOrder.get(getFolderGroupName(b.name) || b.id);
    if (ga !== gb) return ga - gb;

    const ra = getRoundNumber(a.name);
    const rb = getRoundNumber(b.name);
    if (ra !== null && rb !== null && ra !== rb) return rb - ra;
    if (ra !== null && rb === null) return -1;
    if (ra === null && rb !== null) return 1;
    return String(a.name).localeCompare(String(b.name), 'ko');
  });
}

// 목차 탭: 전체 / 진행중 공모전 / 묶음(공식전, 소마대전 …) / 묶음 밖의 단독 폴더
function getFolderTabs() {
  const tabs = [];
  const seenGroups = new Set();
  getOrderedFolders().forEach(folder => {
    if (isOngoingFolder(folder.name)) {
      tabs.push({ id: folder.id, label: getFolderShortName(folder.name), ongoing: true });
    }
  });
  getOrderedFolders().forEach(folder => {
    const group = getFolderGroupName(folder.name);
    if (group) {
      if (seenGroups.has(group)) return;
      seenGroups.add(group);
      tabs.push({ id: `GROUP:${group}`, label: group, ongoing: false });
    } else if (!isOngoingFolder(folder.name)) {
      tabs.push({ id: folder.id, label: getFolderShortName(folder.name), ongoing: false });
    }
  });
  return tabs;
}

// 묶음 안 회차(주제) 탭 이름: 묶음 이름은 위 탭에 있으니 뺌 ('1차 소마대전 RED' → '1차 RED')
function getRoundTabLabel(folderName) {
  const group = getFolderGroupName(folderName);
  const short = getFolderShortName(folderName);
  if (!group) return short;
  return short.split(group).join(' ').replace(/\s{2,}/g, ' ').trim() || short;
}

// 묶음(공식전, 소마대전 …) 안의 회차들 — 묶음 탭을 누르면 그 아래 한 줄로 나옴
function getRoundTabs(group) {
  return getOrderedFolders()
    .filter(f => !isOngoingFolder(f.name) && getFolderGroupName(f.name) === group)
    .map(f => ({ id: f.id, label: getRoundTabLabel(f.name) }));
}

// 지금 고른 탭이 들어 있는 묶음 (묶음 탭 자체이거나 그 묶음의 회차를 고른 경우)
function getActiveGroup() {
  if (selectedSubfolderId.startsWith('GROUP:')) return selectedSubfolderId.slice(6);
  const folder = folderCategories.find(f => f.id === selectedSubfolderId);
  return folder && !isOngoingFolder(folder.name) ? getFolderGroupName(folder.name) : '';
}

// 선택한 탭에 이 사진이 들어가는지
function photoMatchesTab(photo, tabId) {
  if (tabId === 'ALL') return true;
  if (tabId.startsWith('GROUP:')) return getFolderGroupName(photo.folderName) === tabId.slice(6);
  return photo.folderId === tabId;
}

function isValidTab(tabId) {
  return tabId === 'ALL' ||
    getFolderTabs().some(tab => tab.id === tabId) ||
    folderCategories.some(f => f.id === tabId);
}

// 목차와 갤러리에서 쓰는 폴더 순서: 일반 공모전(진행중 먼저) → 소마대전
function getOrderedFolders() {
  return [
    ...folderCategories.filter(f => !isMiniFolder(f.name)),
    ...folderCategories.filter(f => isMiniFolder(f.name))
  ];
}

// 공모전 설명: 드라이브 폴더 안 txt 파일 내용 (영어 화면에서는 영어 txt가 있으면 그것)
function getFolderDescription(folder) {
  if (!folder) return '';
  if (currentLang === 'en' && folder.descriptionEn) return folder.descriptionEn;
  return folder.description || '';
}

// 카카오톡 오픈채팅방 링크 버튼 (config.js에 주소가 있을 때만)
function kakaoLinkHtml() {
  if (!CONFIGURED_KAKAO_URL) return '';
  return `<a class="kakao-link-btn" href="${escapeHtml(CONFIGURED_KAKAO_URL)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('kakaoLink'))} &nearr;</a>`;
}

function voteNoteHtml() {
  return `<p class="vote-note"><span>${escapeHtml(t('voteNote'))}</span>${kakaoLinkHtml()}</p>`;
}

function navigateToOngoingFolder(folder) {
  if (!folder) return;
  if (currentMainView !== 'gallery') {
    switchMainView('gallery');
  }
  selectedSubfolderId = folder.id;
  searchQuery = '';
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';
  renderFolderTabs();
  applyFiltersAndRender();

  const gridEl = document.getElementById('photoGrid');
  if (gridEl) {
    gridEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function dismissOngoingPopup() {
  isOngoingModalOpen = false;
  ongoingModalDismissedOnThisLoad = true;

  const backdrop = document.getElementById('ongoingModalBackdrop');
  if (!backdrop) return;

  backdrop.classList.remove('is-visible');
  backdrop.classList.add('hidden');
}

// 접속 시 화면 가운데 [진행중] 공모전 안내 팝업 (출품작은 번호만 표시)
function updateOngoingPopup() {
  const backdrop = document.getElementById('ongoingModalBackdrop');
  const popupTitle = document.getElementById('ongoingPopupTitle');
  const previewGrid = document.getElementById('ongoingModalPreviewGrid');
  const linkWrap = document.getElementById('ongoingVoteLinkWrap');

  const ongoingFolder = folderCategories.find(f => isOngoingFolder(f.name)) || null;
  currentOngoingFolder = ongoingFolder;

  if (!ongoingFolder) {
    isOngoingModalOpen = false;
    if (backdrop) {
      backdrop.classList.remove('is-visible');
      backdrop.classList.add('hidden');
    }
    if (previewGrid) previewGrid.innerHTML = '';
    return;
  }

  if (linkWrap) linkWrap.innerHTML = kakaoLinkHtml();

  if (previewGrid) {
    const ongoingPhotos = allPhotos.filter(p => p.folderId === ongoingFolder.id);
    previewGrid.innerHTML = ongoingPhotos.map(photo => {
      const meta = getDisplayMeta(photo);
      return `
        <button type="button" class="ongoing-preview-item" data-photo-id="${escapeHtml(photo.id)}" aria-label="${escapeHtml(t('viewLarge', meta.title))}">
          <div class="ongoing-preview-thumb-wrap">
            <img class="ongoing-preview-thumb" src="${photo.thumbUrl}" alt="${escapeHtml(meta.title)}" loading="lazy" referrerpolicy="no-referrer" />
          </div>
          <div class="ongoing-preview-info">
            <span class="vote-num-badge">${escapeHtml(meta.title)}</span>
          </div>
        </button>
      `;
    }).join('');

    previewGrid.querySelectorAll('.ongoing-preview-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetId = btn.getAttribute('data-photo-id');
        dismissOngoingPopup();
        selectedSubfolderId = ongoingFolder.id;
        searchQuery = '';
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = '';
        renderFolderTabs();
        applyFiltersAndRender();

        const targetIndex = filteredPhotos.findIndex(p => p.id === targetId);
        if (targetIndex !== -1) {
          lightboxShowAwards = false;
          openLightbox(targetIndex);
        }
      });
    });
  }

  // 한 번 닫은 뒤에는 새로고침 전까지 다시 뜨지 않음
  if (backdrop && popupTitle) {
    popupTitle.textContent = t('popupTitle', getFolderFullName(ongoingFolder.name));
    if (!ongoingModalDismissedOnThisLoad) {
      isOngoingModalOpen = true;
      backdrop.classList.remove('hidden');
      requestAnimationFrame(() => {
        if (!ongoingModalDismissedOnThisLoad) {
          backdrop.classList.add('is-visible');
        }
      });
    } else {
      isOngoingModalOpen = false;
      backdrop.classList.remove('is-visible');
      backdrop.classList.add('hidden');
    }
  }
}

/* ==========================================================================
   3. 알림 · 화면에 들어올 때 나타나기
   ========================================================================== */
function showAppleToast(message) {
  const toast = document.getElementById('appleToast');
  const textEl = document.getElementById('appleToastText');
  if (!toast || !textEl) return;

  textEl.textContent = message || t('toastUpdated');
  toast.classList.add('visible');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('visible');
  }, 2800);
}

// 한 화면에 그리드가 여러 개 있어도 모두 지켜보도록 관찰자는 하나만 두고, 화면을 새로 그릴 때만 비움
function getRevealObserver() {
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );
  }
  return revealObserver;
}

function resetRevealObserver() {
  if (revealObserver) {
    revealObserver.disconnect();
    revealObserver = null;
  }
}

/* ==========================================================================
   4. 파일 이름 읽기: 수상 표시 · 작가 · 제목 · 순번 (진행중 폴더는 번호만)
   ========================================================================== */
function stripExtension(filename) {
  return String(filename || 'Untitled')
    .replace(/\.(jpg|jpeg|png|webp|gif|bmp|avif|heic|tif|tiff)$/i, '')
    .trim();
}

// 파일명에 수상 키워드(대상, 최우수상, 우승, 1등, 우수상, 2등, 3등, 장려상, 입선) 감지 및 등급 반환
function getAwardTierInfo(filename) {
  const s = stripExtension(filename);
  if (/(?:\[\s*대상\s*\]|(?:^|[_\s-])대상(?:$|[_\s-]))/i.test(s)) {
    return { tier: 'GRAND', rankOrder: 1, label: t('awardGrand'), shortLabel: t('awardGrand'), isTopWinner: true };
  }
  if (/(?:\[\s*최우수(?:상)?\s*\]|(?:^|[_\s-])최우수(?:상)?(?:$|[_\s-]))/i.test(s)) {
    return { tier: 'BEST', rankOrder: 2, label: t('awardBest'), shortLabel: t('awardBest'), isTopWinner: true };
  }
  if (/(?:\[\s*(?:1등|우승)\s*\]|(?:^|[_\s-])(?:1등|우승)(?:$|[_\s-]))/i.test(s)) {
    return { tier: 'FIRST', rankOrder: 3, label: t('awardFirst'), shortLabel: t('awardFirst'), isTopWinner: true };
  }
  if (/(?:\[\s*(?:우수(?:상)?|2등|3등)\s*\]|(?:^|[_\s-])(?:우수(?:상)?|2등|3등)(?:$|[_\s-]))/i.test(s)) {
    return { tier: 'EXCELLENCE', rankOrder: 4, label: t('awardExcellence'), shortLabel: t('awardExcellence'), isTopWinner: false };
  }
  if (/(?:\[\s*(?:장려(?:상)?|입선)\s*\]|(?:^|[_\s-])(?:장려(?:상)?|입선)(?:$|[_\s-]))/i.test(s)) {
    return { tier: 'HONOR', rankOrder: 5, label: t('awardHonor'), shortLabel: t('awardHonor'), isTopWinner: false };
  }
  return null;
}

// 화면 표시 및 파싱을 위해 수상 키워드와 앞뒤 언더바/공백을 완전히 제거
function removeAwardKeywords(filename) {
  let s = stripExtension(filename);
  s = s.replace(/\[\s*(?:1등|2등|3등|우승|대상|최우수(?:상)?|우수(?:상)?|장려(?:상)?|입선)\s*\]/gi, '');
  s = s.replace(/(?:^|[_\s-]+)(?:1등|2등|3등|우승|대상|최우수(?:상)?|우수(?:상)?|장려(?:상)?|입선)(?=$|[_\s-]+)/gi, '');
  s = s.replace(/^[_-\s]+|[_-\s]+$/g, '').replace(/_{2,}/g, '_').trim();
  return s || 'Untitled';
}

// 파일명에서 명시적 순번 추출: (1), (2) 또는 맨 앞의 01_, 02_ 등
function extractExplicitOrderNumber(filename) {
  const noExt = stripExtension(filename);
  // 1) 파일명 끝의 (1), (2) 형태
  const endParen = noExt.match(/\(0*(\d+)\)\s*$/);
  if (endParen) return parseInt(endParen[1], 10);

  // 2) 수상 키워드 제거 후 맨 앞의 01_, 02_, 1., 1- 형태
  const cleaned = removeAwardKeywords(filename);
  const leadNum = cleaned.match(/^0*(\d+)[_.\s-]+/);
  if (leadNum) return parseInt(leadNum[1], 10);

  // 3) 파일명 내부의 (1), (2) 형태
  const anyParen = noExt.match(/\(0*(\d+)\)/);
  if (anyParen) return parseInt(anyParen[1], 10);

  return null;
}

// 수상 키워드와 맨 앞 순번 접두어(01_, 02_ 등)를 제거한 문자열 반환
function removeAwardAndLeadingNumber(filename) {
  const cleaned = removeAwardKeywords(filename);
  return cleaned.replace(/^0*\d+[_.\s-]+/, '').trim() || cleaned;
}

// 제목 텍스트 끝에 붙은 (1), (2) 등 중복 괄호 숫자 제거
function cleanDuplicateTrailingNumber(title) {
  return String(title || '')
    .replace(/\s*\(0*\d+\)\s*$/g, '')
    .trim() || String(title || '').trim();
}

// 작가명 추출: 수상 키워드 및 맨 앞 번호(01_) 제거 후 첫 번째 언더바(_) 앞부분
// 언더바가 없으면 파일 이름 전체가 작가명 (예: '소라.jpg' → 소라)
// 한 사람이 여러 장 낸 경우 끝의 번호는 뺌: '소라 (2).jpg' · '소라 2.jpg' · '소라-2.jpg' · '소라2.jpg' → 소라
function extractAuthorFromFilename(filename) {
  const cleaned = removeAwardAndLeadingNumber(filename);
  const underscoreIdx = cleaned.indexOf('_');
  if (underscoreIdx > 0) {
    return cleaned.slice(0, underscoreIdx).trim();
  }
  const base = cleanDuplicateTrailingNumber(cleaned);
  if (base === 'Untitled') return '';
  return base.replace(/[\s.-]*\d+$/, '').trim() || base;
}

// 순수 작품 제목 추출 (언더바 뒤 작품 제목 부분만 + 끝의 카메라 기종 제외 + 끝의 중복 (1), (2) 제거)
// 언더바가 없는 파일(작가명만 있는 파일)은 제목 없음
function extractWorkTitleOnly(filename) {
  const cleaned = removeAwardAndLeadingNumber(filename);
  const withoutParen = cleanDuplicateTrailingNumber(cleaned);
  const parts = withoutParen.split('_').map(s => s.trim()).filter(Boolean);

  // '소라_2.jpg'처럼 언더바 뒤가 번호뿐이면 제목이 아니라 같은 사람의 몇 번째 사진
  const notJustNumber = text => (/^\d+$/.test(text) ? '' : text);
  if (parts.length >= 3) {
    return notJustNumber(parts.slice(1, -1).join(' '));
  }
  if (parts.length === 2) {
    return notJustNumber(parts[1]);
  }
  return '';
}

// 수상 표시: 파일 이름의 [1등] 등 키워드, 없으면 폴더 이름의 '(소라 우승)'과 작가명이 같은 사진
function getPhotoAward(photo) {
  const fromFile = getAwardTierInfo(photo.name);
  if (fromFile) return fromFile;
  if (isOngoingFolder(photo.folderName)) return null;
  const winner = getFolderWinnerName(photo.folderName);
  if (winner && extractAuthorFromFilename(photo.name) === winner) {
    return { tier: 'WIN', rankOrder: 3, label: t('awardWin'), shortLabel: t('awardWin'), isTopWinner: true };
  }
  return null;
}

function isTopWinnerPhoto(photo) {
  const info = getPhotoAward(photo);
  return Boolean(info && info.isTopWinner);
}

// 파일 순서: 파일명 숫자 오름차순 → 업로드(수정) 시간 오름차순
function compareByFileOrder(a, b) {
  const numA = extractExplicitOrderNumber(a.name);
  const numB = extractExplicitOrderNumber(b.name);
  if (numA !== null && numB !== null && numA !== numB) {
    return numA - numB;
  }
  if (numA !== null && numB === null) return -1;
  if (numA === null && numB !== null) return 1;

  const timeA = typeof a.modifiedTime === 'number' ? a.modifiedTime : (a.uploadIndex || a._originalIdx || 0);
  const timeB = typeof b.modifiedTime === 'number' ? b.modifiedTime : (b.uploadIndex || b._originalIdx || 0);
  if (timeA !== timeB) return timeA - timeB;

  return (a._originalIdx || 0) - (b._originalIdx || 0);
}

// 공모전(아카이브) 안 순서: 수상작 먼저 → 파일 순서
function comparePhotosByPriority(a, b) {
  const aWin = isTopWinnerPhoto(a) ? 1 : 0;
  const bWin = isTopWinnerPhoto(b) ? 1 : 0;
  if (aWin !== bWin) return bWin - aWin;
  return compareByFileOrder(a, b);
}

// 폴더별 사진들을 정렬 원칙으로 정렬하고 진행중 폴더 사진에 고정 번호(1번, 2번...) 부여
function sortAndNumberOngoingPhotos(photos) {
  const byFolder = new Map();
  photos.forEach((p, idx) => {
    p._originalIdx = idx;
    if (!byFolder.has(p.folderId)) byFolder.set(p.folderId, []);
    byFolder.get(p.folderId).push(p);
  });

  const result = [];
  byFolder.forEach((group) => {
    const ongoing = group.length > 0 && isOngoingFolder(group[0].folderName);
    group.sort(comparePhotosByPriority);

    group.forEach((p, idx) => {
      p.contestNumber = ongoing ? idx + 1 : null;
    });
    result.push(...group);
  });

  return result;
}

// 사진 객체별로 화면에 표시할 제목, 순번, 작가명, 수상 등급 반환 (카메라 기종은 표시하지 않음)
function getDisplayMeta(photo) {
  const inOngoing = isOngoingFolder(photo.folderName);

  if (inOngoing) {
    // 진행중 공모전 작품은 번호만 표시 (제목·작가명 모두 숨김)
    const numLabel = photo.contestNumber ? t('entryNumber', photo.contestNumber) : '';
    return {
      title: numLabel || t('entry'),
      pureTitle: '',
      numLabel: numLabel,
      authorLabel: '',
      awardInfo: null,
      isAnonymous: true
    };
  }

  const rawAuthor = extractAuthorFromFilename(photo.name);
  const fullCleanTitle = cleanDuplicateTrailingNumber(removeAwardAndLeadingNumber(photo.name));
  const workTitle = extractWorkTitleOnly(photo.name) || (rawAuthor ? '' : fullCleanTitle);
  return {
    title: fullCleanTitle,
    pureTitle: workTitle,
    // 큰 글씨 한 줄: 제목이 있으면 제목, 없으면(작가명만 있는 파일) 작가명
    headline: workTitle || rawAuthor || fullCleanTitle,
    // 작은 글씨 줄에 넣을 작가명: 큰 글씨가 이미 작가명이면 비움
    subAuthor: workTitle ? rawAuthor : '',
    numLabel: '',
    authorLabel: rawAuthor || '',
    awardInfo: getPhotoAward(photo),
    isAnonymous: false
  };
}

// 대체 텍스트·접근성 라벨용 짧은 이름 (숨긴 기종 등은 빼고 제목, 작가만)
function getPhotoLabel(meta) {
  if (meta.isAnonymous) return meta.title;
  return [meta.headline, meta.subAuthor].filter(Boolean).join(', ') || meta.title;
}

// 검색: 진행중 작품은 화면에 보이는 번호로만, 나머지는 제목 · 작가 · 폴더명으로
function matchesSearchQuery(photo, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  const meta = getDisplayMeta(photo);

  if (meta.isAnonymous) {
    return `${meta.numLabel} ${photo.contestNumber || ''}`.toLowerCase().includes(q);
  }

  return `${meta.title} ${photo.name} ${photo.folderName || ''}`.toLowerCase().includes(q);
}

/* ==========================================================================
   5. 구글 드라이브 폴더 & 하위 폴더 읽기 (서버·캐시가 없을 때 브라우저에서 직접)
   ========================================================================== */
function extractFolderId(input) {
  const trimmed = String(input || '').trim();
  const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]{15,})/);
  if (folderMatch) return folderMatch[1];

  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{15,})/);
  if (idParamMatch) return idParamMatch[1];

  if (/^[a-zA-Z0-9_-]{15,}$/.test(trimmed)) return trimmed;
  return '1o3QBRz4f87QC9L-c2wuBADjgb28uUMmw';
}

function renderSkeletonGrid(count = 8) {
  const grid = document.getElementById('photoGrid');
  const moreWrap = document.getElementById('photoGridMore');
  if (moreWrap) moreWrap.innerHTML = '';
  let html = '';
  for (let i = 0; i < count; i++) {
    html += `
      <div class="photo-card is-skeleton in-view" aria-hidden="true" style="--ratio: ${[1.5, 0.67, 1.5, 0.8, 1.33][i % 5]}">
        <div class="photo-media-wrap"></div>
        <div class="card-caption">
          <span class="skeleton-line"></span>
          <span class="skeleton-line is-short"></span>
        </div>
      </div>
    `;
  }
  grid.innerHTML = html;
}

function decodeEntities(str) {
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

// 폴더 안 txt 중 설명으로 쓸 파일 고르기 (한국어용 / 영어용)
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

    const name = decodeEntities(titleMatch[1].trim());
    const href = hrefMatch ? hrefMatch[1] : '';
    const modifiedTime = parseDriveModifiedTime(chunk, i);

    if (href.includes('/folders/') || chunk.includes('drive/folders/')) {
      subfolders.push({ id, name });
    } else if (isTextFile(name)) {
      texts.push({ id, name });
    } else if (!isNonImageFile(name)) {
      files.push({ id, name, modifiedTime, uploadIndex: i });
    }
  }

  return { subfolders, files, texts };
}

// 외부 중계 서버를 차례로 시도해 주소의 내용을 가져옴 (브라우저에서 드라이브를 직접 못 읽기 때문)
async function fetchViaProxies(targetUrl, bustCache = false, isValid = () => true) {
  const cb = bustCache ? `&cb=${Date.now()}` : '';
  const proxyUrls = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}${cb}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
    `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`
  ];

  for (const pUrl of proxyUrls) {
    try {
      const res = await fetch(pUrl, { cache: 'no-store' });
      if (!res.ok) continue;
      const text = await res.text();
      if (text && isValid(text)) return text;
    } catch (e) {}
  }
  return '';
}

async function fetchSingleFolderEmbedHtml(folderId, bustCache = false) {
  const cb = bustCache ? `&cb=${Date.now()}` : '';
  const embedUrl = `https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(folderId)}${cb}#grid`;
  const html = await fetchViaProxies(embedUrl, bustCache, text => text.includes('flip-entry'));
  if (html) return html;

  try {
    const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(embedUrl)}${cb}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && data.contents) return data.contents;
    }
  } catch (e) {}

  return '';
}

async function fetchDriveText(fileId, bustCache = false) {
  const url = `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`;
  return cleanDescriptionText(await fetchViaProxies(url, bustCache));
}

async function fetchFolderTreeViaPublicEmbed(rootFolderId, bustCache = false, maxDepth = 3) {
  const photos = [];
  const folders = [];
  const visited = new Set();
  // 중계 서버로 못 읽은 폴더 수 (하나라도 있으면 일부가 빠진 목록일 수 있음)
  let failed = 0;

  async function traverse(folderId, folderName, depth) {
    if (visited.has(folderId) || depth > maxDepth) return;
    visited.add(folderId);

    const html = await fetchSingleFolderEmbedHtml(folderId, bustCache);
    if (!html) { failed += 1; return; }

    const { subfolders, files, texts } = parseEntriesFromEmbedHtml(html);

    if (files.length > 0) {
      const folder = { id: folderId, name: folderName };
      const { ko, en } = pickDescriptionFiles(texts);
      const [description, descriptionEn] = await Promise.all([
        ko ? fetchDriveText(ko.id, bustCache) : '',
        en ? fetchDriveText(en.id, bustCache) : ''
      ]);
      if (description) folder.description = description;
      if (descriptionEn) folder.descriptionEn = descriptionEn;
      if (!folders.some(f => f.id === folderId)) folders.push(folder);

      files.forEach(file => {
        photos.push({
          id: file.id,
          name: file.name,
          folderId: folderId,
          folderName: folderName,
          modifiedTime: file.modifiedTime || 0,
          uploadIndex: file.uploadIndex || 0,
          thumbUrl: `https://drive.google.com/thumbnail?id=${file.id}&sz=w1000`,
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
  return { folders, photos, failed };
}

/* 구글 Drive API(키 필요)로 폴더 읽기: 브라우저에서 바로 읽을 수 있어 중계 서버가 필요 없음.
   폴더 하나라도 못 읽으면 실패로 처리해서 일부만 빠진 목록으로 바꾸지 않음 */
async function driveApiListChildren(folderId, apiKey) {
  const items = [];
  let pageToken = '';
  do {
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'nextPageToken, files(id, name, mimeType, imageMediaMetadata(width, height, rotation))',
      pageSize: '1000',
      orderBy: 'folder,name',
      supportsAllDrives: 'true',
      includeItemsFromAllDrives: 'true',
      key: apiKey
    });
    if (pageToken) params.set('pageToken', pageToken);
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Drive API ${res.status}`);
    const data = await res.json();
    items.push(...(data.files || []));
    pageToken = data.nextPageToken || '';
  } while (pageToken);
  return items;
}

async function driveApiReadText(fileId, apiKey) {
  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media&key=${encodeURIComponent(apiKey)}`, { cache: 'no-store' });
    return res.ok ? cleanDescriptionText(await res.text()) : '';
  } catch (e) {
    return '';
  }
}

async function fetchFolderTreeViaDriveApi(rootFolderId, apiKey, maxDepth = 3) {
  const photos = [];
  const folders = [];
  const visited = new Set();

  // orderKey: 드라이브에 나온 순서를 기억해 두었다가 마지막에 폴더 순서를 맞춤 (동시에 읽어도 순서가 흔들리지 않게)
  async function traverse(folderId, folderName, depth, orderKey) {
    if (visited.has(folderId) || depth > maxDepth) return;
    visited.add(folderId);

    const items = await driveApiListChildren(folderId, apiKey);
    const subfolders = items.filter(it => it.mimeType === 'application/vnd.google-apps.folder');
    const texts = items.filter(it => isTextFile(it.name));
    const files = items.filter(it =>
      it.mimeType !== 'application/vnd.google-apps.folder' &&
      !isTextFile(it.name) &&
      !isNonImageFile(it.name) &&
      (/^image\//.test(it.mimeType || '') || /\.(jpe?g|png|gif|webp|heic|heif|bmp|tiff?)$/i.test(it.name))
    );

    if (files.length > 0) {
      const folder = { id: folderId, name: folderName };
      const { ko, en } = pickDescriptionFiles(texts);
      const [description, descriptionEn] = await Promise.all([
        ko ? driveApiReadText(ko.id, apiKey) : '',
        en ? driveApiReadText(en.id, apiKey) : ''
      ]);
      if (description) folder.description = description;
      if (descriptionEn) folder.descriptionEn = descriptionEn;
      folders.push({ folder, orderKey });

      files.forEach((file, i) => {
        // 사진 크기 (90° · 270° 돌려 찍은 사진은 가로세로를 바꿈)
        const meta = file.imageMediaMetadata || {};
        const turned = meta.rotation === 1 || meta.rotation === 3;
        photos.push({
          id: file.id,
          name: file.name,
          folderId,
          folderName,
          ...(meta.width && meta.height ? { width: turned ? meta.height : meta.width, height: turned ? meta.width : meta.height } : {}),
          modifiedTime: i + 1,
          uploadIndex: i + 1,
          thumbUrl: `https://drive.google.com/thumbnail?id=${file.id}&sz=w1000`,
          fullUrl: `https://drive.google.com/thumbnail?id=${file.id}&sz=w2000`,
          driveUrl: `https://drive.google.com/file/d/${file.id}/view`
        });
      });
    }

    if (subfolders.length > 0 && depth < maxDepth) {
      await Promise.all(subfolders.map((sub, i) => {
        const subLabel = folderName && folderName !== '기본 폴더' ? `${folderName} / ${sub.name}` : sub.name;
        return traverse(sub.id, subLabel, depth + 1, `${orderKey}.${String(i).padStart(4, '0')}`);
      }));
    }
  }

  await traverse(rootFolderId, '기본 폴더', 0, '0');
  folders.sort((a, b) => (a.orderKey < b.orderKey ? -1 : a.orderKey > b.orderKey ? 1 : 0));
  return { folders: folders.map(f => f.folder), photos };
}

/* ==========================================================================
   6. 폴더 목차 · 갤러리 (갤러리는 감상용: 수상 표시 없음)
   ========================================================================== */
function renderFolderTabs() {
  const tabsContainer = document.getElementById('folderCategoryTabs');
  if (!tabsContainer) return;

  if (folderCategories.length <= 1 && folderCategories[0]?.name === '기본 폴더') {
    tabsContainer.innerHTML = '';
    return;
  }

  // 첫 줄은 묶음(공식전 · 소마대전)만 보여 주고, 묶음을 누르면 둘째 줄에 그 안의 회차(주제)가 나옴
  // 회차를 누르면 그 주제에 낸 사람들 사진이 모두 보임
  const tabs = [{ id: 'ALL', label: t('all'), ongoing: false }, ...getFolderTabs()];
  const activeGroup = getActiveGroup();
  const tabButton = (tab, isActive, extraClass = '') => {
    const count = allPhotos.filter(p => photoMatchesTab(p, tab.id)).length;
    return `
      <button type="button" class="folder-tab-btn ${extraClass} ${isActive ? 'active' : ''}" data-folder-id="${escapeHtml(tab.id)}">
        ${tab.ongoing ? `<span class="tab-live-dot" title="${escapeHtml(t('ongoingDotTitle'))}"></span>` : ''}${escapeHtml(tab.label)}<span class="folder-tab-count">${count}</span>
      </button>
    `;
  };

  const groupRow = tabs.map(tab => {
    const isActive = selectedSubfolderId === tab.id || (activeGroup && tab.id === `GROUP:${activeGroup}`);
    return tabButton(tab, isActive);
  }).join('');

  const rounds = activeGroup ? getRoundTabs(activeGroup) : [];
  const roundRow = rounds.length > 1
    ? `<div class="folder-subtabs" role="group" aria-label="${escapeHtml(activeGroup)}">
        ${rounds.map(round => tabButton(round, selectedSubfolderId === round.id, 'is-sub')).join('')}
      </div>`
    : '';

  tabsContainer.innerHTML = groupRow + roundRow;

  tabsContainer.querySelectorAll('.folder-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedSubfolderId = btn.getAttribute('data-folder-id');
      renderFolderTabs();
      applyFiltersAndRender();
    });
  });
}

function applyFiltersAndRender() {
  const matched = allPhotos.filter(p => photoMatchesTab(p, selectedSubfolderId) && matchesSearchQuery(p, searchQuery));

  // 갤러리 순서: 목차 순서대로 공모전별로 모으고, 공모전 안에서는 번호 · 올린 순서 (수상작을 앞에 두지 않음)
  const folderOrder = new Map(getOrderedFolders().map((f, i) => [f.id, i]));
  filteredPhotos = [...matched].sort((a, b) => {
    const fa = folderOrder.has(a.folderId) ? folderOrder.get(a.folderId) : 999;
    const fb = folderOrder.has(b.folderId) ? folderOrder.get(b.folderId) : 999;
    if (fa !== fb) return fa - fb;
    if (a.contestNumber && b.contestNumber) return a.contestNumber - b.contestNumber;
    return compareByFileOrder(a, b);
  });

  const badge = document.getElementById('photoCountBadge');
  if (badge) {
    const activeTab = getFolderTabs().find(tab => tab.id === selectedSubfolderId);
    const activeFolder = activeTab ? null : folderCategories.find(f => f.id === selectedSubfolderId);
    const prefix = activeTab
      ? `${activeTab.label} · `
      : (activeFolder ? `${getFolderFullName(activeFolder.name)} · ` : '');
    badge.textContent = `${prefix}${t('photoCount', filteredPhotos.length)}`;
  }

  renderPhotoGrid(filteredPhotos);
}

/* 사진 목록 불러오기
   - 페이지를 열면 저장된 목록(drive-cache.json)과 드라이브 바로 읽기를 동시에 시작
   - 드라이브를 바로 읽을 수 있으면(API 키 또는 내 PC 서버) 최대 몇 초 기다렸다가 최신 목록으로 바로 그림
     → 예전 목록(지운 사진)이 먼저 번쩍 보이지 않음
   - 바로 못 읽으면 저장된 목록을 먼저 보여 주고, 드라이브를 다 읽은 뒤 달라졌을 때만 다시 그림
   - 저장된 목록은 GitHub Actions가 약 10분마다 드라이브를 읽어 새로 만듦 (.github/workflows/sync-drive.yml) */
const LIVE_WAIT_MS = 4500;
let driveDataSignature = '';

function isLocalServerHost() {
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}

function hasFastLiveSource() {
  return Boolean(CONFIGURED_API_KEY) || isLocalServerHost();
}

// 읽는 방법마다 순서가 다를 수 있어서 정렬해서 비교 (순서만 다르면 같은 목록)
function getDriveDataSignature(photos, folders) {
  const rows = [
    ...(folders || []).map(f => JSON.stringify(['f', f.id, f.name, f.description || '', f.descriptionEn || ''])),
    ...(photos || []).map(p => JSON.stringify(['p', p.id, p.name, p.folderId, p.folderName]))
  ];
  return rows.sort().join('|');
}

async function readCachedDriveList(folderId) {
  try {
    const res = await fetch(`./drive-cache.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.ok && data.folderId === folderId && Array.isArray(data.photos) && data.photos.length > 0) {
      return {
        photos: data.photos,
        folders: Array.isArray(data.folders) ? data.folders : [],
        updatedAt: data.updatedAt || null
      };
    }
  } catch (e) {}
  return null;
}

// 드라이브를 지금 바로 읽기: API 키 → 내 PC 서버 → (새로고침 버튼일 때만) 공개 중계 서버
async function readLiveDriveList(folderId, { allowRelays = false } = {}) {
  if (CONFIGURED_API_KEY) {
    try {
      const result = await fetchFolderTreeViaDriveApi(folderId, CONFIGURED_API_KEY);
      if (result.photos.length > 0) return result;
    } catch (e) {}
  }

  if (isLocalServerHost()) {
    try {
      const res = await fetch(`./api/folder?id=${encodeURIComponent(folderId)}&live=1&t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.ok && Array.isArray(data.photos) && data.photos.length > 0) {
          return { photos: data.photos, folders: Array.isArray(data.folders) ? data.folders : [] };
        }
      }
    } catch (e) {}
  }

  if (allowRelays) {
    const result = await fetchFolderTreeViaPublicEmbed(folderId, true);
    if (result.photos.length > 0) return result;
  }
  return null;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function showLoadFailed() {
  const badge = document.getElementById('photoCountBadge');
  const statusBanner = document.getElementById('statusBanner');
  document.getElementById('photoGrid').innerHTML = '';
  const more = document.getElementById('photoGridMore');
  if (more) more.innerHTML = '';
  if (badge) badge.textContent = t('photoCount', 0);
  if (statusBanner) {
    statusBanner.textContent = t('loadFailed');
    statusBanner.classList.remove('hidden');
  }
}

// 받아 온 목록으로 화면 전체를 다시 그림 (지금 보고 있는 화면 · 목차 선택은 그대로)
function applyDriveData(photos, folders, updatedAt = null) {
  driveDataSignature = getDriveDataSignature(photos, folders);
  folderCategories = sortFoldersOngoingFirst(folders);
  // 진행중 폴더 작품들을 정렬하고 1번, 2번... 고유 번호를 부여 (전체 탭 및 크게 보기에서도 동일 번호 유지)
  allPhotos = sortAndNumberOngoingPhotos(photos);

  if (!isValidTab(selectedSubfolderId)) {
    selectedSubfolderId = 'ALL';
  }

  const statusBanner = document.getElementById('statusBanner');
  if (statusBanner) statusBanner.classList.add('hidden');

  renderFolderTabs();
  updateOngoingPopup();
  applyFiltersAndRender();
  if (currentMainView === 'competitions') renderCompetitionsArchiveView('regular');
  if (currentMainView === 'mini') renderCompetitionsArchiveView('mini');
  if (currentMainView === 'competition-detail') renderCompetitionDetailView(selectedCompetitionId);
  updateFooterLastUpdated(true, updatedAt);
}

async function loadDriveFolder(folderInput, forceLive = false) {
  const folderId = extractFolderId(folderInput);
  const badge = document.getElementById('photoCountBadge');
  const statusBanner = document.getElementById('statusBanner');
  const refreshBtn = document.getElementById('btnRefreshGallery');

  if (statusBanner) statusBanner.classList.add('hidden');
  if (badge) badge.textContent = forceLive ? t('syncingLive') : t('syncing');

  if (forceLive && refreshBtn) {
    refreshBtn.classList.add('is-spinning');
  } else {
    renderSkeletonGrid(8);
  }

  try {
    // 새로고침(↻) 버튼: 드라이브를 바로 다시 읽음
    if (forceLive) {
      const live = await readLiveDriveList(folderId, { allowRelays: true });
      if (live) {
        applyDriveData(live.photos, live.folders);
        showAppleToast(t('toastUpdated'));
        return;
      }
      if (allPhotos.length > 0) {
        applyFiltersAndRender();
        showAppleToast(t('liveFailed'));
        return;
      }
      const cachedFallback = await readCachedDriveList(folderId);
      if (cachedFallback) applyDriveData(cachedFallback.photos, cachedFallback.folders, cachedFallback.updatedAt);
      else showLoadFailed();
      return;
    }

    const fast = hasFastLiveSource();
    const cachePromise = readCachedDriveList(folderId);
    const livePromise = fast ? readLiveDriveList(folderId) : Promise.resolve(null);

    if (fast) {
      const first = await Promise.race([livePromise, delay(LIVE_WAIT_MS).then(() => null)]);
      if (first) {
        applyDriveData(first.photos, first.folders);
        return;
      }
    }

    const cached = await cachePromise;
    if (cached) applyDriveData(cached.photos, cached.folders, cached.updatedAt);

    // 저장된 목록을 먼저 보여 준 경우: 드라이브를 다 읽은 뒤 달라졌을 때만 다시 그림
    // 저장된 목록도 없는 경우: 공개 중계 서버로라도 읽어 봄
    // 사이트(GitHub Pages)에서는 저장된 목록이 몇 시간 늦을 수 있어서, 먼저 보여 준 뒤 공개 중계 서버로 드라이브를 다시 읽음
    // (새 사진 · 새 폴더 · 폴더 이름의 '진행중'을 바로 반영. 폴더를 하나라도 못 읽으면 저장된 목록을 그대로 둠)
    let live = fast ? await livePromise : null;
    if (!fast) {
      const relay = await fetchFolderTreeViaPublicEmbed(folderId, true);
      if (relay.photos.length > 0 && (!cached || relay.failed === 0)) {
        const knownSizes = new Map((cached ? cached.photos : []).map(p => [p.id, p]));
        relay.photos.forEach(p => {
          const known = knownSizes.get(p.id);
          if (known && known.width && known.height) {
            p.width = known.width;
            p.height = known.height;
          }
        });
        live = relay;
      }
    }

    if (live && getDriveDataSignature(live.photos, live.folders) !== driveDataSignature) {
      applyDriveData(live.photos, live.folders);
      if (cached) showAppleToast(t('toastUpdated'));
    } else if (!cached && !live) {
      showLoadFailed();
    }
  } catch (err) {
    if (badge) badge.textContent = t('connError');
    if (statusBanner) {
      statusBanner.textContent = t('errorPrefix', err.message);
      statusBanner.classList.remove('hidden');
    }
  } finally {
    if (refreshBtn) {
      refreshBtn.classList.remove('is-spinning');
    }
  }
}

/* ==========================================================================
   7. 사진 카드 · 크게 보기 (모바일: 좌우로 밀어 넘기기, 아래로 당겨 닫기)
   ========================================================================== */
// 사진 카드: 가로 프레임 + 아래 캡션. showAward는 공모전 아카이브(상세)에서만 true
// delayIdx: 화면에 차례로 나타날 때의 순서 (더보기로 붙인 묶음은 그 묶음 안에서 다시 0부터)
function renderPhotoCardHtml(photo, idx, showAward = false, delayIdx = idx) {
  const meta = getDisplayMeta(photo);
  const award = showAward ? meta.awardInfo : null;
  const rawFolder = photo.folderName && photo.folderName !== '기본 폴더' ? photo.folderName : '';
  // 한 회차만 보는 화면(공모전 상세 — showAward가 true — 또는 갤러리에서 회차 탭을 고른 경우)은
  // 회차 이름이 이미 위에 있으니 캡션에서는 뺌
  const singleRound = showAward ||
    (currentMainView === 'gallery' && folderCategories.some(f => f.id === selectedSubfolderId));
  const folderLabel = rawFolder && !singleRound ? getFolderFullName(rawFolder) : '';
  const label = getPhotoLabel(meta);

  let captionHtml;
  if (meta.isAnonymous) {
    captionHtml = `
      <p class="caption-title"><span class="vote-num-badge">${escapeHtml(meta.title)}</span></p>
      ${folderLabel ? `<p class="caption-meta-row">${escapeHtml(folderLabel)}</p>` : ''}
    `;
  } else {
    const metaLine = [meta.subAuthor, folderLabel].filter(Boolean).map(escapeHtml).join(' · ');
    captionHtml = `
      ${award ? `<p class="caption-award">${escapeHtml(award.shortLabel)}</p>` : ''}
      <p class="caption-title">${escapeHtml(meta.headline)}</p>
      ${metaLine ? `<p class="caption-meta-row">${metaLine}</p>` : ''}
    `;
  }

  // 기분전환(윈도우 98) 창 제목줄에 쓰는 파일 이름. 진행중 작품은 작가가 드러나지 않게 번호로만
  const extMatch = String(photo.name || '').match(/\.[a-z0-9]{2,5}$/i);
  const fileLabel = `${meta.isAnonymous ? meta.title : (meta.headline || meta.title)}${extMatch ? extMatch[0].toLowerCase() : '.jpg'}`;

  return `
    <article
      class="photo-card ${award && award.isTopWinner ? 'is-winner' : ''}"
      data-index="${idx}"
      data-photo-id="${escapeHtml(photo.id)}"
      data-file="${escapeHtml(fileLabel)}"
      data-author="${meta.isAnonymous ? '' : escapeHtml(meta.authorLabel || '')}"
      tabindex="0"
      role="button"
      aria-label="${escapeHtml(t('viewLarge', label))}"
      style="--d: ${Math.min(delayIdx * 55, 330)}ms; --ratio: ${getPhotoRatio(photo).toFixed(4)}"
    >
      <div class="photo-media-wrap">
        <img
          class="photo-thumb"
          src="${photo.thumbUrl}"
          alt="${escapeHtml(label)}"
          loading="lazy"
          referrerpolicy="no-referrer"
        />
      </div>
      <div class="card-caption">${captionHtml}</div>
    </article>
  `;
}

// 사진 비율(가로÷세로): 저장된 목록의 크기 → 화면에서 읽은 크기 → 모르면 가로 3:2
function getPhotoRatio(photo) {
  if (photo && photo.width > 0 && photo.height > 0) return photo.width / photo.height;
  if (photo && photo._ratio > 0) return photo._ratio;
  return 1.5;
}

function bindPhotoCardEvents(container, photoList, showAward = false) {
  if (!container) return;
  const observer = getRevealObserver();

  container.querySelectorAll('.photo-card').forEach(card => {
    // 더보기로 카드를 덧붙여도 이미 연결한 카드는 다시 연결하지 않음
    if (card.dataset.bound) return;
    card.dataset.bound = '1';

    const img = card.querySelector('.photo-thumb');
    const idx = Number(card.getAttribute('data-index'));

    observer.observe(card);
    // 처음 한 번 순서대로 나타난 뒤에는 마우스 반응이 늦지 않도록 지연을 없앰
    setTimeout(() => {
      card.style.setProperty('--d', '0ms');
    }, 1300);

    const markLoaded = () => {
      card.classList.add('loaded');
      // 크기를 미리 몰랐던 사진은 불러온 그림의 실제 비율로 줄을 다시 맞춤
      const photo = photoList[idx];
      if (img && img.naturalWidth > 0 && img.naturalHeight > 0 && photo && !(photo.width > 0)) {
        const ratio = img.naturalWidth / img.naturalHeight;
        if (Math.abs(ratio - getPhotoRatio(photo)) > 0.01) {
          photo._ratio = ratio;
          card.style.setProperty('--ratio', ratio.toFixed(4));
        }
      }
    };
    if (img && img.complete && img.naturalWidth > 0) {
      markLoaded();
    } else if (img) {
      img.addEventListener('load', markLoaded);
      img.addEventListener('error', () => {
        const photo = photoList[idx];
        if (!photo) return;
        const fallbackUrl = `https://lh3.googleusercontent.com/d/${photo.id}=w1000`;
        if (img.src !== fallbackUrl) {
          img.src = fallbackUrl;
        } else {
          markLoaded();
        }
      });
    }

    const openFromList = () => {
      filteredPhotos = photoList;
      lightboxShowAwards = showAward;
      openLightbox(idx);
    };

    card.addEventListener('click', openFromList);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openFromList();
      }
    });
  });
}

/* 더보기: 처음엔 5줄만 보여 주고, 버튼을 누를 때마다 5줄씩 더 붙임
   (크게 보기에서는 아직 안 붙인 사진까지 전부 넘겨 볼 수 있음) */
const ROWS_PER_PAGE = 5;

// 한 번에 붙일 장수: 한 줄에 대략 몇 장 걸리는지(줄 높이와 화면 너비로 어림) × 5줄
function getGridPageSize(grid) {
  const rowH = parseFloat(getComputedStyle(grid).getPropertyValue('--row-h')) || 210;
  const width = grid.clientWidth || (grid.parentElement && grid.parentElement.clientWidth) || window.innerWidth;
  const perRow = Math.max(2, Math.round(width / (rowH * 1.15)));
  return perRow * ROWS_PER_PAGE;
}

function renderPagedPhotoGrid(grid, moreWrap, photos, showAward = false) {
  if (!grid) return;
  grid._paged = { photos, showAward, moreWrap, shown: 0 };
  grid.innerHTML = '';
  appendPhotoPage(grid);
}

function appendPhotoPage(grid) {
  const state = grid._paged;
  if (!state) return;
  const start = state.shown;
  const end = Math.min(state.photos.length, start + getGridPageSize(grid));
  const html = state.photos
    .slice(start, end)
    .map((photo, i) => renderPhotoCardHtml(photo, start + i, state.showAward, i))
    .join('');
  grid.insertAdjacentHTML('beforeend', html);
  state.shown = end;
  bindPhotoCardEvents(grid, state.photos, state.showAward);
  renderLoadMoreButton(grid);
}

function renderLoadMoreButton(grid) {
  const { moreWrap, shown, photos } = grid._paged;
  if (!moreWrap) return;
  if (shown >= photos.length) {
    moreWrap.innerHTML = '';
    return;
  }
  moreWrap.innerHTML = `
    <button type="button" class="load-more-btn">
      <span>${escapeHtml(t('loadMore'))}</span>
      <span class="load-more-count">${shown} / ${photos.length}</span>
    </button>
  `;
  moreWrap.querySelector('.load-more-btn').addEventListener('click', () => {
    const firstNewIndex = grid._paged.shown;
    appendPhotoPage(grid);
    // 키보드로 누른 경우 새로 붙은 첫 사진으로 이어서 이동할 수 있게
    const firstNew = grid.querySelector(`.photo-card[data-index="${firstNewIndex}"]`);
    if (firstNew) firstNew.focus({ preventScroll: true });
  });
}

function renderPhotoGrid(photos) {
  const grid = document.getElementById('photoGrid');
  if (!grid) return;
  resetRevealObserver();
  renderPagedPhotoGrid(grid, document.getElementById('photoGridMore'), photos, false);
}

function openLightbox(index) {
  if (!filteredPhotos.length) return;
  activePhotoIndex = (index + filteredPhotos.length) % filteredPhotos.length;

  const modal = document.getElementById('lightboxModal');
  const wrap = document.getElementById('lightboxFigureWrap');
  if (wrap) {
    wrap.style.transform = '';
    wrap.style.opacity = '';
  }

  modal.classList.remove('hidden');
  requestAnimationFrame(() => {
    modal.classList.add('is-open');
  });
  document.body.style.overflow = 'hidden';

  renderFilmstrip();
  updateLightboxContent();
}

function renderFilmstrip() {
  const strip = document.getElementById('lightboxFilmstrip');
  strip.innerHTML = filteredPhotos.map((p, idx) => `
    <div class="film-thumb ${idx === activePhotoIndex ? 'active' : ''}" data-idx="${idx}">
      <img src="${p.thumbUrl}" alt="" referrerpolicy="no-referrer" />
    </div>
  `).join('');

  strip.querySelectorAll('.film-thumb').forEach(el => {
    el.addEventListener('click', () => {
      activePhotoIndex = Number(el.getAttribute('data-idx'));
      updateLightboxContent();
    });
  });
}

function updateLightboxContent() {
  const photo = filteredPhotos[activePhotoIndex];
  if (!photo) return;

  const meta = getDisplayMeta(photo);
  const img = document.getElementById('lightboxImage');
  const spinner = document.getElementById('lightboxSpinner');
  const counter = document.getElementById('lightboxCounter');
  const title = document.getElementById('lightboxTitle');
  const authorEl = document.getElementById('lightboxAuthor');
  const folderTag = document.getElementById('lightboxFolderTag');

  img.setAttribute('referrerpolicy', 'no-referrer');

  counter.textContent = `${activePhotoIndex + 1} / ${filteredPhotos.length}`;
  const award = lightboxShowAwards ? meta.awardInfo : null;
  const awardInline = award ? `<span class="winner-badge-inline">${escapeHtml(award.shortLabel)}</span>` : '';
  const numInline = meta.numLabel ? `<span class="vote-num-badge">${escapeHtml(meta.numLabel)}</span>` : '';
  title.innerHTML = `${awardInline}${numInline}${escapeHtml(meta.isAnonymous ? '' : meta.headline)}`;

  if (authorEl) {
    const sub = meta.isAnonymous ? '' : meta.subAuthor;
    authorEl.textContent = sub || '';
    authorEl.classList.toggle('hidden', !sub);
  }

  if (photo.folderName && photo.folderName !== '기본 폴더') {
    folderTag.textContent = getFolderFullName(photo.folderName);
    folderTag.classList.remove('hidden');
  } else {
    folderTag.classList.add('hidden');
  }

  document.querySelectorAll('.film-thumb').forEach((el, idx) => {
    el.classList.toggle('active', idx === activePhotoIndex);
  });

  img.classList.remove('loaded');
  spinner.classList.remove('hidden');

  img.onload = () => {
    spinner.classList.add('hidden');
    img.classList.add('loaded');
  };

  img.onerror = () => {
    const fallbackFull = `https://lh3.googleusercontent.com/d/${photo.id}=w2000`;
    if (img.src !== fallbackFull) {
      img.src = fallbackFull;
    } else {
      spinner.classList.add('hidden');
      img.classList.add('loaded');
    }
  };

  img.src = photo.fullUrl;
  img.alt = getPhotoLabel(meta);
}

function closeLightbox() {
  const modal = document.getElementById('lightboxModal');
  const img = document.getElementById('lightboxImage');
  modal.classList.remove('is-open');
  img.classList.remove('loaded');
  document.body.style.overflow = '';

  setTimeout(() => {
    if (!modal.classList.contains('is-open')) {
      modal.classList.add('hidden');
      img.src = '';
    }
  }, 360);
}

function showPrevPhoto() {
  if (!filteredPhotos.length) return;
  activePhotoIndex = (activePhotoIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
  updateLightboxContent();
}

function showNextPhoto() {
  if (!filteredPhotos.length) return;
  activePhotoIndex = (activePhotoIndex + 1) % filteredPhotos.length;
  updateLightboxContent();
}

// 모바일 크게 보기 터치 (좌우로 밀어 이전/다음, 아래로 당겨서 닫기)
function setupLightboxTouchGestures() {
  const stage = document.getElementById('lightboxStage');
  const wrap = document.getElementById('lightboxFigureWrap');
  if (!stage || !wrap) return;

  let startX = 0;
  let startY = 0;
  let deltaX = 0;
  let deltaY = 0;
  let isTracking = false;

  stage.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    deltaX = 0;
    deltaY = 0;
    isTracking = true;
    wrap.style.transition = 'none';
  }, { passive: true });

  stage.addEventListener('touchmove', (e) => {
    if (!isTracking || e.touches.length !== 1) return;
    deltaX = e.touches[0].clientX - startX;
    deltaY = e.touches[0].clientY - startY;

    if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > 0) {
      const progress = Math.min(deltaY / 240, 1);
      wrap.style.transform = `translateY(${deltaY * 0.75}px) scale(${1 - progress * 0.12})`;
      wrap.style.opacity = String(1 - progress * 0.45);
    }
  }, { passive: true });

  stage.addEventListener('touchend', () => {
    if (!isTracking) return;
    isTracking = false;
    wrap.style.transition = '';

    if (Math.abs(deltaX) > 48 && Math.abs(deltaX) > Math.abs(deltaY)) {
      wrap.style.transform = '';
      wrap.style.opacity = '';
      if (deltaX < 0) {
        showNextPhoto();
      } else {
        showPrevPhoto();
      }
      return;
    }

    if (deltaY > 85 && Math.abs(deltaY) > Math.abs(deltaX)) {
      closeLightbox();
      setTimeout(() => {
        wrap.style.transform = '';
        wrap.style.opacity = '';
      }, 360);
      return;
    }

    wrap.style.transform = '';
    wrap.style.opacity = '';
  });
}

/* ==========================================================================
   8. 공모전 아카이브 · 소마대전 · 공모전 상세 · 역대 수상작 (수상 표시는 여기서만)
   ========================================================================== */
function buildCompetitionMetadata(folder) {
  const ongoing = isOngoingFolder(folder.name);
  const isMini = isMiniFolder(folder.name);
  const title = getFolderShortName(folder.name);
  // 연도는 폴더 이름의 20xx에서 읽고, 없으면 올해로 묶음
  const yearMatch = folder.name.match(/(20\d{2})/);
  const year = yearMatch ? yearMatch[1] : String(new Date().getFullYear());

  const photos = allPhotos.filter(p => p.folderId === folder.id);
  const winners = photos.filter(p => Boolean(getPhotoAward(p)));
  const coverPhoto = winners[0] || photos[0] || null;

  // 참여 작가 목록 (진행중 공모전은 투표가 끝날 때까지 공개하지 않음)
  const authorSet = new Set();
  if (!ongoing) {
    photos.forEach(p => {
      const a = extractAuthorFromFilename(p.name);
      if (a) authorSet.add(a);
    });
  }

  // 설명: 드라이브 txt가 있으면 그 내용, 없으면 진행중일 때만 기본 안내
  const customDescription = getFolderDescription(folder);
  const description = customDescription || (ongoing ? t('ongoingDesc') : '');

  return {
    id: folder.id,
    rawName: folder.name,
    title,
    year,
    ongoing,
    isMini,
    statusLabel: ongoing ? t('statusOngoing') : t('statusEnded'),
    photoCount: photos.length,
    winnerCount: winners.length,
    coverPhoto,
    photos,
    winners,
    // 폴더 이름의 '(소라 우승)' — 사진 파일 이름이 달라도 아카이브 카드에 우승자를 보여 주기 위해
    winnerName: ongoing ? '' : getFolderWinnerName(folder.name),
    authors: Array.from(authorSet),
    description,
    customDescription
  };
}

function getAllCompetitionsMeta() {
  return folderCategories
    .filter(f => f.name !== '기본 폴더' || folderCategories.length === 1)
    .map(buildCompetitionMetadata);
}

// 상태 표시는 진행 중일 때만 (끝난 공모전에는 '종료'를 붙이지 않음)
function statusPillHtml(comp) {
  if (!comp.ongoing) return '';
  return `<span class="comp-status-pill is-live"><span class="live-dot"></span>${escapeHtml(comp.statusLabel)}</span>`;
}

// 공모전 목록 (연도별) — kind: 'regular' = 공모전 아카이브, 'mini' = 소마대전
// 소마대전 누적 우승 횟수 (폴더 이름의 '(소라 우승)'을 셈, 진행 중 회차는 뺌) — 많이 이긴 사람부터
function renderMiniWinTally(comps) {
  const el = document.getElementById('miniWinTally');
  if (!el) return;
  const tally = new Map();
  comps.forEach(c => {
    if (c.ongoing || !c.winnerName) return;
    tally.set(c.winnerName, (tally.get(c.winnerName) || 0) + 1);
  });
  if (tally.size === 0) {
    el.hidden = true;
    el.innerHTML = '';
    return;
  }
  const items = Array.from(tally.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, n]) => `<span class="mini-win-tally-item">${escapeHtml(t('winTallyItem', name, n))}</span>`);
  el.innerHTML = `<span class="mini-win-tally-label">${escapeHtml(t('winTallyLabel'))}</span>${items.join('<span class="mini-win-tally-sep" aria-hidden="true">·</span>')}`;
  el.hidden = false;
}

function renderCompetitionsArchiveView(kind = 'regular') {
  const isMiniList = kind === 'mini';
  const filterBar = document.getElementById(isMiniList ? 'miniYearFilterBar' : 'compYearFilterBar');
  const container = document.getElementById(isMiniList ? 'miniContestsListContainer' : 'competitionsListContainer');
  if (!container || !filterBar) return;

  const comps = getAllCompetitionsMeta().filter(c => c.isMini === isMiniList);
  if (isMiniList) renderMiniWinTally(comps);

  if (comps.length === 0) {
    filterBar.innerHTML = '';
    container.innerHTML = `<div class="archive-empty-state">${isMiniList ? t('noMini') : escapeHtml(t('noContests'))}</div>`;
    return;
  }

  const selectedFilter = compListFilter[kind] || 'ALL';
  const years = Array.from(new Set(comps.map(c => c.year))).sort((a, b) => b.localeCompare(a));

  // '전체'와 결과가 똑같은 칸은 만들지 않음: 진행 중인 공모전이 없으면 진행 중/종료 칸을, 연도가 하나뿐이면 연도 칸을 뺌
  const liveCount = comps.filter(c => c.ongoing).length;
  const filterOptions = [{ id: 'ALL', label: t('filterAll', comps.length) }];
  if (liveCount > 0 && liveCount < comps.length) {
    filterOptions.push(
      { id: 'LIVE', label: t('filterLive', liveCount) },
      { id: 'ENDED', label: t('filterEnded', comps.length - liveCount) }
    );
  }
  if (years.length > 1) {
    filterOptions.push(...years.map(y => ({ id: `YEAR_${y}`, label: t('filterYear', y) })));
  }
  // 고를 칸이 '전체' 하나뿐이면 막대를 비움 (이전에 고른 칸이 사라졌으면 전체로)
  if (!filterOptions.some(opt => opt.id === selectedFilter)) {
    compListFilter[kind] = 'ALL';
    return renderCompetitionsArchiveView(kind);
  }

  filterBar.innerHTML = filterOptions.length <= 1 ? '' : filterOptions.map(opt => `
    <button type="button" class="comp-filter-chip ${selectedFilter === opt.id ? 'active' : ''}" data-comp-filter="${opt.id}">
      ${escapeHtml(opt.label)}
    </button>
  `).join('');

  filterBar.querySelectorAll('.comp-filter-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      compListFilter[kind] = btn.getAttribute('data-comp-filter');
      renderCompetitionsArchiveView(kind);
    });
  });

  const q = searchQuery.toLowerCase();
  const filteredComps = comps.filter(c => {
    if (selectedFilter === 'LIVE' && !c.ongoing) return false;
    if (selectedFilter === 'ENDED' && c.ongoing) return false;
    if (selectedFilter.startsWith('YEAR_') && c.year !== selectedFilter.replace('YEAR_', '')) return false;
    if (q) {
      return `${c.title} ${c.year} ${c.customDescription} ${c.authors.join(' ')}`.toLowerCase().includes(q);
    }
    return true;
  });

  if (filteredComps.length === 0) {
    container.innerHTML = `<div class="archive-empty-state">${escapeHtml(t('noMatchContests'))}</div>`;
    return;
  }

  const groupedByYear = new Map();
  filteredComps.forEach(c => {
    if (!groupedByYear.has(c.year)) groupedByYear.set(c.year, []);
    groupedByYear.get(c.year).push(c);
  });

  let html = '';
  groupedByYear.forEach((group, year) => {
    // 연도가 하나뿐이면 연도 제목(2026 · 공모전 8개)은 위 '전체 (8)'과 같으므로 숨김
    html += `
      <section class="comp-year-section">
        ${groupedByYear.size > 1 ? `
          <div class="comp-year-header">
            <h2 class="comp-year-title">${escapeHtml(year)}</h2>
            <span class="comp-year-count">${escapeHtml(t('yearCount', group.length))}</span>
          </div>
        ` : ''}
        <div class="comp-cards-grid">
          ${group.map(comp => {
            const coverUrl = comp.coverPhoto ? comp.coverPhoto.thumbUrl : '';
            const topWinner = comp.winners[0];
            const topWinnerMeta = topWinner ? getDisplayMeta(topWinner) : null;
            const stats = [t('statEntries', comp.photoCount)];
            if (!comp.ongoing && comp.authors.length > 0) stats.push(t('statAuthors', comp.authors.length));
            return `
              <article class="comp-archive-card ${comp.ongoing ? 'is-ongoing-card' : ''}" data-comp-id="${escapeHtml(comp.id)}" tabindex="0" role="button" aria-label="${escapeHtml(t('viewExhibitionOf', comp.title))}">
                <div class="comp-card-cover-wrap">
                  ${coverUrl ? `<img class="comp-card-cover" src="${coverUrl}" alt="" loading="lazy" referrerpolicy="no-referrer" />` : ''}
                </div>
                <div class="comp-card-body">
                  ${comp.ongoing ? `<p class="comp-card-period">${statusPillHtml(comp)}</p>` : ''}
                  <h3 class="comp-card-title">${escapeHtml(comp.title)}</h3>
                  ${comp.customDescription ? `<p class="comp-card-desc">${escapeHtml(comp.customDescription)}</p>` : ''}
                  ${comp.ongoing ? voteNoteHtml() : ''}
                  <p class="comp-card-meta-stats">${escapeHtml(stats.join(' · '))}</p>
                  ${topWinnerMeta && !topWinnerMeta.isAnonymous ? `
                    <p class="comp-card-winner-highlight">
                      <span class="winner-highlight-label">${escapeHtml(topWinnerMeta.awardInfo ? topWinnerMeta.awardInfo.shortLabel : '')}</span>
                      <span class="winner-highlight-val">${escapeHtml(topWinnerMeta.headline)}${topWinnerMeta.subAuthor ? ` — ${escapeHtml(topWinnerMeta.subAuthor)}` : ''}</span>
                    </p>
                  ` : (!comp.ongoing && comp.winnerName ? `
                    <p class="comp-card-winner-highlight">
                      <span class="winner-highlight-label">${escapeHtml(t('awardWin'))}</span>
                      <span class="winner-highlight-val">${escapeHtml(comp.winnerName)}</span>
                    </p>
                  ` : '')}
                  <span class="comp-card-enter-link">${escapeHtml(t('viewExhibition'))} &rarr;</span>
                </div>
              </article>
            `;
          }).join('')}
        </div>
      </section>
    `;
  });

  container.innerHTML = html;

  container.querySelectorAll('.comp-archive-card').forEach(card => {
    const openDetail = () => openCompetitionDetail(card.getAttribute('data-comp-id'));
    card.addEventListener('click', openDetail);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openDetail();
      }
    });
    // 오픈채팅방 링크는 카드 열기와 따로 동작
    card.querySelectorAll('.kakao-link-btn').forEach(a => a.addEventListener('click', e => e.stopPropagation()));
  });
}

function openCompetitionDetail(folderId) {
  if (!folderId) return;
  selectedCompetitionId = folderId;
  const folder = folderCategories.find(f => f.id === folderId);
  detailReturnView = folder && isMiniFolder(folder.name) ? 'mini' : 'competitions';
  switchMainView('competition-detail');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 공모전 상세: 표지 + 소개 + 출품작(수상 표시 포함) + 참여 작가
function renderCompetitionDetailView(folderId) {
  const container = document.getElementById('competitionDetailContent');
  if (!container) return;

  const targetFolder = folderCategories.find(f => f.id === folderId) || folderCategories[0];
  if (!targetFolder) {
    container.innerHTML = `<div class="archive-empty-state">${escapeHtml(t('detailLoading'))}</div>`;
    return;
  }

  resetRevealObserver();

  const comp = buildCompetitionMetadata(targetFolder);
  // 우승 칸: 폴더 이름의 '(소라 우승)', 없으면 [1등] 같은 표시가 붙은 사진의 작가
  const winnerLabel = comp.winnerName || (comp.winners[0] ? getDisplayMeta(comp.winners[0]).authorLabel : '');
  const winnerValue = winnerLabel || (comp.ongoing ? t('judging') : t('none'));
  // 회차 이름에 이미 '소마대전'이 들어 있으면 옆의 '소마대전' 표시는 뺌
  const showKindTag = comp.isMini && !comp.title.includes(MINI_CONTEST_NAME);
  // 상세 화면에서도 상단 검색어로 출품작을 거를 수 있게 함
  const shownPhotos = searchQuery
    ? comp.photos.filter(p => matchesSearchQuery(p, searchQuery))
    : comp.photos;
  // 출품 수는 위 '출품 N점'에 있으니, 검색했을 때만 '보이는 수 / 전체'를 붙임
  const shownCount = t('shownOf', shownPhotos.length, comp.photoCount);

  container.innerHTML = `
    <header class="comp-detail-hero">
      <div class="comp-detail-hero-content">
        ${comp.ongoing || showKindTag ? `
          <p class="comp-detail-badges">
            ${statusPillHtml(comp)}
            ${showKindTag ? `<span class="comp-kind-tag">${escapeHtml(t('kindMini'))}</span>` : ''}
          </p>
        ` : ''}
        <h1 class="comp-detail-title">${escapeHtml(comp.title)}</h1>
        ${comp.description ? `<p class="comp-detail-desc">${escapeHtml(comp.description)}</p>` : ''}
        ${comp.ongoing ? voteNoteHtml() : ''}
        <dl class="comp-detail-QuickStats">
          <div class="detail-stat-item">
            <dt class="detail-stat-label">${escapeHtml(t('statLabelEntries'))}</dt>
            <dd class="detail-stat-value">${escapeHtml(t('pieces', comp.photoCount))}</dd>
          </div>
          <div class="detail-stat-item">
            <dt class="detail-stat-label">${escapeHtml(t('awardWin'))}</dt>
            <dd class="detail-stat-value">${escapeHtml(winnerValue)}</dd>
          </div>
          <div class="detail-stat-item">
            <dt class="detail-stat-label">${escapeHtml(t('statLabelAuthors'))}</dt>
            <dd class="detail-stat-value">${escapeHtml(comp.ongoing ? t('revealAfterVote') : t('people', comp.authors.length))}</dd>
          </div>
        </dl>
      </div>
    </header>

    <section class="comp-detail-section">
      <div class="comp-section-head">
        <h2 class="comp-section-title">${escapeHtml(t('sectionEntries'))}</h2>
        ${searchQuery ? `<span class="comp-section-count">${escapeHtml(shownCount)}</span>` : ''}
      </div>
      ${shownPhotos.length > 0 ? `
        <div id="compDetailAllPhotosGrid" class="bento-grid"></div>
        <div id="compDetailAllPhotosMore" class="load-more-wrap"></div>
      ` : `<div class="archive-empty-state">${escapeHtml(t('noMatchEntries'))}</div>`}
    </section>

  `;

  if (shownPhotos.length > 0) {
    renderPagedPhotoGrid(
      document.getElementById('compDetailAllPhotosGrid'),
      document.getElementById('compDetailAllPhotosMore'),
      shownPhotos,
      true
    );
  }
}

function switchMainView(viewName) {
  const validViews = ['gallery', 'competitions', 'mini', 'competition-detail'];
  currentMainView = validViews.includes(viewName) ? viewName : 'gallery';

  const views = {
    gallery: document.getElementById('galleryViewContainer'),
    competitions: document.getElementById('competitionsArchiveView'),
    mini: document.getElementById('miniContestsView'),
    'competition-detail': document.getElementById('competitionDetailView')
  };
  Object.entries(views).forEach(([name, el]) => {
    if (el) el.classList.toggle('hidden', currentMainView !== name);
  });
  document.getElementById('folderCategoryTabs')?.classList.toggle('hidden', currentMainView !== 'gallery');

  const inDetail = currentMainView === 'competition-detail';
  document.getElementById('navViewGallery')?.classList.toggle('active', currentMainView === 'gallery');
  document.getElementById('navViewCompetitions')?.classList.toggle('active', currentMainView === 'competitions' || (inDetail && detailReturnView === 'competitions'));
  document.getElementById('navViewMini')?.classList.toggle('active', currentMainView === 'mini' || (inDetail && detailReturnView === 'mini'));

  const backLabel = document.querySelector('#btnBackToArchive span');
  if (backLabel) {
    backLabel.textContent = detailReturnView === 'mini' ? t('backToMini') : t('backToContests');
  }

  const searchInput = document.getElementById('searchInput');
  const setPlaceholder = key => {
    if (searchInput) searchInput.placeholder = t(key);
  };

  if (currentMainView === 'competitions') {
    setPlaceholder('phContests');
    renderCompetitionsArchiveView('regular');
  } else if (currentMainView === 'mini') {
    setPlaceholder('phMini');
    renderCompetitionsArchiveView('mini');
  } else if (currentMainView === 'competition-detail') {
    setPlaceholder('phGallery');
    renderCompetitionDetailView(selectedCompetitionId);
  } else {
    setPlaceholder('phGallery');
    applyFiltersAndRender();
  }
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ==========================================================================
   9. 인터랙션: 제목 글자 등장 · 첫머리 조명 · 따라다니는 빨간 점
   ========================================================================== */
// 제목을 글자 단위로 나눠 한 자씩 올라오게 함 (읽기 도구에는 원래 문장 그대로 전달)
function splitTitleChars(el) {
  if (!el) return;
  const text = el.textContent.replace(/\s+/g, ' ').trim();
  if (!text) return;
  el.setAttribute('aria-label', text);
  let i = 0;
  el.innerHTML = text.split(' ').map(word => {
    const chars = [...word].map(ch => `<span class="char" style="--i:${i++}">${escapeHtml(ch)}</span>`).join('');
    i += 1;
    return `<span class="word" aria-hidden="true">${chars}</span>`;
  }).join(' ');
  el.classList.add('split-chars');
}

// 어두운 모드: 첫머리의 조명이 마우스를 따라 좌우로 움직임
function initHeroSpotlight() {
  const hero = document.querySelector('.hero-stage');
  if (!hero || prefersReducedMotion) return;

  let rafId = null;
  hero.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const rect = hero.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      hero.style.setProperty('--spot-x', `${x.toFixed(1)}%`);
    });
  });
  hero.addEventListener('pointerleave', () => {
    hero.style.removeProperty('--spot-x');
  });
}

// 데스크톱: 마우스를 따라다니는 빨간 점. 사진 위에서는 '보기', 공모전 표지 위에서는 '열기'로 커짐
function initCursorFollower() {
  const finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!finePointer || prefersReducedMotion) return;

  const dot = document.createElement('div');
  dot.className = 'cursor-follower is-hidden';
  dot.setAttribute('aria-hidden', 'true');
  dot.innerHTML = '<span class="cursor-label"></span>';
  document.body.appendChild(dot);
  const label = dot.firstElementChild;

  let x = -100;
  let y = -100;
  let targetX = -100;
  let targetY = -100;
  let running = false;

  const step = () => {
    x += (targetX - x) * 0.22;
    y += (targetY - y) * 0.22;
    dot.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    if (Math.abs(targetX - x) > 0.2 || Math.abs(targetY - y) > 0.2) {
      requestAnimationFrame(step);
    } else {
      running = false;
    }
  };

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    targetX = e.clientX;
    targetY = e.clientY;
    dot.classList.remove('is-hidden');

    const target = e.target instanceof Element
      ? e.target.closest('.photo-card:not(.is-skeleton), .ongoing-preview-item, .comp-archive-card')
      : null;
    const text = target ? (target.classList.contains('comp-archive-card') ? t('cursorOpen') : t('cursorView')) : '';
    dot.classList.toggle('is-active', Boolean(text));
    if (text) label.textContent = text;

    if (!running) {
      running = true;
      requestAnimationFrame(step);
    }
  }, { passive: true });

  document.documentElement.addEventListener('mouseleave', () => dot.classList.add('is-hidden'));
  window.addEventListener('blur', () => dot.classList.add('is-hidden'));
}

/* ==========================================================================
   10. 시작 · 버튼 연결
   ========================================================================== */
// 사진 · 링크를 끌어서 옮기는 동작 막기 (CSS만으로는 막히지 않는 브라우저용)
document.addEventListener('dragstart', e => e.preventDefault());

document.addEventListener('DOMContentLoaded', () => {
  applyStaticTexts();
  setupLightboxTouchGestures();
  initHeroSpotlight();
  initCursorFollower();
  loadDriveFolder(CONFIGURED_FOLDER_URL, false);

  // 상단 메인 섹션 전환 메뉴
  document.getElementById('navViewGallery')?.addEventListener('click', () => switchMainView('gallery'));
  document.getElementById('navViewCompetitions')?.addEventListener('click', () => switchMainView('competitions'));
  document.getElementById('navViewMini')?.addEventListener('click', () => switchMainView('mini'));
  document.getElementById('btnBackToArchive')?.addEventListener('click', () => switchMainView(detailReturnView));

  document.getElementById('btnResetFilter').addEventListener('click', (e) => {
    e.preventDefault();
    switchMainView('gallery');
    selectedSubfolderId = 'ALL';
    searchQuery = '';
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    renderFolderTabs();
    applyFiltersAndRender();
  });

  // 상단 검색창 입력 및 모바일 돋보기 확장 토글
  const searchInput = document.getElementById('searchInput');
  const searchPillWrap = document.getElementById('searchPillWrap');
  const btnMobileSearchToggle = document.getElementById('btnMobileSearchToggle');

  if (btnMobileSearchToggle && searchPillWrap && searchInput) {
    btnMobileSearchToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      searchPillWrap.classList.toggle('is-expanded');
      if (searchPillWrap.classList.contains('is-expanded')) {
        searchInput.focus();
      }
    });

    document.addEventListener('click', (e) => {
      if (!searchPillWrap.contains(e.target) && !searchInput.value.trim()) {
        searchPillWrap.classList.remove('is-expanded');
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      if (currentMainView === 'competitions') {
        renderCompetitionsArchiveView('regular');
      } else if (currentMainView === 'mini') {
        renderCompetitionsArchiveView('mini');
      } else if (currentMainView === 'competition-detail') {
        renderCompetitionDetailView(selectedCompetitionId);
      } else {
        applyFiltersAndRender();
      }
    });
  }

  // 공모전 안내 팝업: 작품 보러가기 / 닫기 / X 버튼 / 바깥 영역 클릭
  const ongoingModalBackdrop = document.getElementById('ongoingModalBackdrop');
  document.getElementById('btnOngoingViewNow')?.addEventListener('click', (e) => {
    e.stopPropagation();
    dismissOngoingPopup();
    if (currentOngoingFolder) {
      navigateToOngoingFolder(currentOngoingFolder);
    }
  });
  document.getElementById('btnOngoingClose')?.addEventListener('click', (e) => {
    e.stopPropagation();
    dismissOngoingPopup();
  });
  document.getElementById('btnOngoingCloseTop')?.addEventListener('click', (e) => {
    e.stopPropagation();
    dismissOngoingPopup();
  });
  document.getElementById('ongoingPopup')?.addEventListener('click', e => e.stopPropagation());
  ongoingModalBackdrop?.addEventListener('click', (e) => {
    if (e.target === ongoingModalBackdrop) dismissOngoingPopup();
  });

  // 새로고침(↻) 버튼: 저장해 둔 목록 대신 구글 드라이브를 바로 다시 읽음
  document.getElementById('btnRefreshGallery').addEventListener('click', () => {
    loadDriveFolder(CONFIGURED_FOLDER_URL, true);
  });

  // 한국어 / English 전환
  document.getElementById('btnLangToggle')?.addEventListener('click', () => {
    setLanguage(currentLang === 'en' ? 'ko' : 'en');
  });

  // 어둡게 / 밝게 (기본은 어둡게)
  document.getElementById('btnThemeToggle').addEventListener('click', () => {
    const html = document.documentElement;
    const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', next);
    document.getElementById('iconSun').classList.toggle('hidden', next === 'light');
    document.getElementById('iconMoon').classList.toggle('hidden', next === 'dark');
  });

  document.getElementById('btnCloseLightbox').addEventListener('click', closeLightbox);
  document.getElementById('btnPrevPhoto').addEventListener('click', e => {
    e.stopPropagation();
    showPrevPhoto();
  });
  document.getElementById('btnNextPhoto').addEventListener('click', e => {
    e.stopPropagation();
    showNextPhoto();
  });

  document.getElementById('lightboxStage').addEventListener('click', e => {
    if (e.target.id === 'lightboxStage') closeLightbox();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOngoingModalOpen) {
      dismissOngoingPopup();
      return;
    }
    const modal = document.getElementById('lightboxModal');
    if (modal.classList.contains('hidden')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrevPhoto();
    if (e.key === 'ArrowRight') showNextPhoto();
  });
});
