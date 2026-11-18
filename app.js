// config.js에서 설정된 GOOGLE_DRIVE_FOLDER_URL 사용
const CONFIGURED_FOLDER_URL =
  (typeof window !== 'undefined' && window.GOOGLE_DRIVE_FOLDER_URL) ||
  'https://drive.google.com/drive/folders/1o3QBRz4f87QC9L-c2wuBADjgb28uUMmw?usp=sharing';

// 게시판 구글 시트 CSV 주소 및 글쓰기 구글 폼 주소 (config.js의 전역 상수와 식별자 충돌 방지)
const CONFIGURED_BOARD_CSV_URL =
  (typeof window !== 'undefined' && window.GOOGLE_SHEET_CSV_URL) ||
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRSSnDF4kOkpdc395mcK_tVi4yYg5klJfL-iIkHco6Bn2F1VBJqB9Cmj-1eFPiofNKhK00UmIT8YJU5/pub?output=csv';

const CONFIGURED_BOARD_FORM_URL =
  (typeof window !== 'undefined' && typeof window.BOARD_FORM_URL === 'string')
    ? window.BOARD_FORM_URL
    : '';

// 사용자 브라우저 언어(Locale) 기반 다국어(i18n) 매핑 (한국어 기본, 해외 접속 시 영문 전환)
const IS_KOREAN = typeof navigator !== 'undefined'
  ? String(navigator.language || 'ko').toLowerCase().startsWith('ko')
  : true;

const I18N = {
  allTab: IS_KOREAN ? '전체' : 'ALL',
  liveBadge: IS_KOREAN ? '진행중' : 'LIVE',
  heroEyebrow: IS_KOREAN ? '전시 아카이브' : 'ARCHIVE',
  firstPrizeBadge: IS_KOREAN ? '👑 1등 · WINNER' : '👑 1ST · WINNER'
};

function formatDateYMD(dateObj) {
  const d = dateObj instanceof Date && !isNaN(dateObj) ? dateObj : new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
}

function formatDateTimeYMDHM(dateObj) {
  const d = dateObj instanceof Date && !isNaN(dateObj) ? dateObj : new Date();
  const ymd = formatDateYMD(d);
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${ymd} ${hh}:${min}`;
}

function updateFooterLastUpdated(withTime = false, customDate = null) {
  const el = document.getElementById('footerLastUpdated');
  if (!el) return;
  const d = customDate ? new Date(customDate) : new Date();
  const text = withTime ? formatDateTimeYMDHM(d) : formatDateYMD(d);
  el.textContent = `최종 갱신: ${text}`;
}

function applyLocaleTexts() {
  const eyebrow = document.getElementById('heroEyebrow');
  const liveBadgeText = document.getElementById('ongoingLiveBadgeText');

  if (eyebrow) eyebrow.textContent = I18N.heroEyebrow;
  if (liveBadgeText) liveBadgeText.textContent = I18N.liveBadge;
  updateFooterLastUpdated(false);
}

let allPhotos = [];
let folderCategories = [];
let selectedSubfolderId = 'ALL';
let searchQuery = '';
let currentOngoingFolder = null;
let isOngoingModalOpen = false;
let ongoingModalDismissedOnThisLoad = false;
let filteredPhotos = [];
let activePhotoIndex = 0;
let revealObserver = null;
let currentThemeValue = 0.0;
let targetThemeValue = 0.0;
let toastTimer = null;

// 메인 섹션 전환 및 구글 시트 연동 게시판 상태
// 'gallery' | 'competitions' | 'competition-detail' | 'winners' | 'tips'
let currentMainView = 'gallery';
let selectedCompetitionId = null;
let selectedCompYearFilter = 'ALL';
let selectedWinnerTierFilter = 'ALL';
let activeTipPostId = null;
let tipsPosts = [];
let isBoardLoading = false;

/* ==========================================================================
   1. WebGL 셰이더 배경 (다크/라이트 테마 대응 앰비언트 실크 오로라 & 마우스 빛 반사)
   ========================================================================== */
function initWebGLBackground() {
  const canvas = document.getElementById('webglCanvas');
  if (!canvas) return;

  const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
  if (!gl) return;

  const vsSource = `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const fsSource = `
    precision mediump float;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;
    uniform float u_time;
    uniform float u_lightMode;

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
      vec2 m = (u_mouse - 0.5) * vec2(u_resolution.x / min(u_resolution.x, u_resolution.y), 1.0);

      float t = u_time * 0.18;
      vec2 q = p;
      q.x += 0.22 * sin(p.y * 2.1 + t) + 0.12 * cos(p.x * 3.0 - t * 0.7);
      q.y += 0.22 * cos(p.x * 1.9 - t * 0.8) + 0.12 * sin(p.y * 2.7 + t * 0.6);

      float wave1 = sin(q.x * 2.4 + q.y * 1.8 + t) * 0.5 + 0.5;
      float wave2 = cos(q.x * 1.7 - q.y * 2.5 - t * 0.9) * 0.5 + 0.5;

      float distToMouse = length(p - m);
      float mouseGlow = exp(-distToMouse * 2.4) * 0.20;

      // 무채색 다크 모드 (옵시디언 블랙 & 퓨어 실버 그레이 광택)
      vec3 darkBase = vec3(0.012, 0.012, 0.014);
      vec3 darkAurora1 = vec3(0.085, 0.085, 0.092);
      vec3 darkAurora2 = vec3(0.055, 0.055, 0.060);
      vec3 darkSpec = vec3(0.28, 0.28, 0.30);

      vec3 darkCol = darkBase;
      darkCol = mix(darkCol, darkAurora1, wave1 * 0.45 * (1.0 - uv.y * 0.4));
      darkCol = mix(darkCol, darkAurora2, wave2 * 0.34);
      darkCol += darkSpec * mouseGlow;

      // 무채색 라이트 모드 (퓨어 실버 화이트 & 모노크롬 미스트 광택)
      vec3 lightBase = vec3(0.980, 0.980, 0.985);
      vec3 lightAurora1 = vec3(0.935, 0.935, 0.942);
      vec3 lightAurora2 = vec3(0.955, 0.955, 0.962);
      vec3 lightSpec = vec3(1.0, 1.0, 1.0);

      vec3 lightCol = lightBase;
      lightCol = mix(lightCol, lightAurora1, wave1 * 0.55);
      lightCol = mix(lightCol, lightAurora2, wave2 * 0.45);
      lightCol = mix(lightCol, lightSpec, mouseGlow * 1.4);

      vec3 finalCol = mix(darkCol, lightCol, u_lightMode);
      gl_FragColor = vec4(finalCol, 1.0);
    }
  `;

  function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vs = compileShader(gl.VERTEX_SHADER, vsSource);
  const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
  if (!vs || !fs) return;

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  );

  const posLoc = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(program, 'u_resolution');
  const uMouse = gl.getUniformLocation(program, 'u_mouse');
  const uTime = gl.getUniformLocation(program, 'u_time');
  const uLightMode = gl.getUniformLocation(program, 'u_lightMode');

  let targetMouseX = 0.5;
  let targetMouseY = 0.65;
  let curMouseX = 0.5;
  let curMouseY = 0.65;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('pointermove', (e) => {
    targetMouseX = e.clientX / window.innerWidth;
    targetMouseY = 1.0 - e.clientY / window.innerHeight;
  }, { passive: true });

  const startTime = performance.now();
  function render(now) {
    curMouseX += (targetMouseX - curMouseX) * 0.05;
    curMouseY += (targetMouseY - curMouseY) * 0.05;
    currentThemeValue += (targetThemeValue - currentThemeValue) * 0.08;

    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform2f(uMouse, curMouseX, curMouseY);
    gl.uniform1f(uTime, (now - startTime) * 0.001);
    gl.uniform1f(uLightMode, currentThemeValue);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

/* ==========================================================================
   2. [진행중] 공모전 폴더 감지 & 상단 슬림 배너 + 화면 정중앙 모달 제어
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

// [진행중]이 포함된 폴더를 항상 첫 번째 순서로 정렬
function sortFoldersOngoingFirst(folders) {
  return [...folders].sort((a, b) => {
    const aOngoing = isOngoingFolder(a.name) ? 1 : 0;
    const bOngoing = isOngoingFolder(b.name) ? 1 : 0;
    return bOngoing - aOngoing;
  });
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

function updateOngoingNoticeUI() {
  const banner = document.getElementById('ongoingBanner');
  const bannerText = document.getElementById('ongoingBannerText');
  const backdrop = document.getElementById('ongoingModalBackdrop');
  const popupTitle = document.getElementById('ongoingPopupTitle');
  const previewGrid = document.getElementById('ongoingModalPreviewGrid');

  const ongoingFolder = folderCategories.find(f => isOngoingFolder(f.name)) || null;
  currentOngoingFolder = ongoingFolder;

  if (!ongoingFolder) {
    isOngoingModalOpen = false;
    if (banner) banner.classList.add('hidden');
    if (backdrop) {
      backdrop.classList.remove('is-visible');
      backdrop.classList.add('hidden');
    }
    if (previewGrid) previewGrid.innerHTML = '';
    return;
  }

  const cleanName = cleanOngoingFolderName(ongoingFolder.name);

  if (banner && bannerText) {
    bannerText.innerHTML = `현재 <strong>[${escapeHtml(cleanName)}]</strong> 진행 중입니다 ·`;
    banner.classList.remove('hidden');
  }

  // 모달 내 진행중 후보작 미리보기 카드 렌더링 (고대비 1번 배지 + 굵은 작품제목 + 클릭 시 라이트박스 직행)
  if (previewGrid) {
    const ongoingPhotos = allPhotos.filter(p => p.folderId === ongoingFolder.id);
    previewGrid.innerHTML = ongoingPhotos.map(photo => {
      const meta = getDisplayMeta(photo);
      const numBadgeHtml = meta.numLabel
        ? `<span class="vote-num-badge">${escapeHtml(meta.numLabel)}</span>`
        : '';
      return `
        <button type="button" class="ongoing-preview-item" data-photo-id="${escapeHtml(photo.id)}" aria-label="${escapeHtml(meta.title)} 크게 보기">
          <div class="ongoing-preview-thumb-wrap">
            <img class="ongoing-preview-thumb" src="${photo.thumbUrl}" alt="${escapeHtml(meta.title)}" loading="lazy" referrerpolicy="no-referrer" />
          </div>
          <div class="ongoing-preview-info">
            <div class="ongoing-preview-title-row">
              ${numBadgeHtml}
              <span class="ongoing-preview-title">${escapeHtml(meta.pureTitle)}</span>
            </div>
            <span class="ongoing-preview-author">by 익명</span>
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
          openLightbox(targetIndex);
        }
      });
    });
  }

  // 한 번 닫은 뒤에는 다시 튀어나오지 않도록 ongoingModalDismissedOnThisLoad 체크
  if (backdrop && popupTitle) {
    if (!ongoingModalDismissedOnThisLoad) {
      isOngoingModalOpen = true;
      popupTitle.textContent = `현재 ${cleanName} 진행 중입니다`;
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
   3. 애플 스타일 토스트 알림 & 3D 틸트 인터랙션
   ========================================================================== */
function showAppleToast(message = '최신 목록으로 업데이트되었습니다') {
  const toast = document.getElementById('appleToast');
  const textEl = document.getElementById('appleToastText');
  if (!toast || !textEl) return;

  textEl.textContent = message;
  toast.classList.add('visible');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('visible');
  }, 2800);
}

function setupScrollRevealObserver() {
  if (revealObserver) revealObserver.disconnect();

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

function attachAppleCardInteractions(card) {
  let rafId = null;

  card.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'touch') return;
    card.classList.add('is-tilting');
  });

  card.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const px = x / rect.width;
      const py = y / rect.height;

      const rotateY = (px - 0.5) * 11;
      const rotateX = (0.5 - py) * 11;

      card.style.transform = `perspective(1100px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`;
      card.style.setProperty('--glare-x', `${(px * 100).toFixed(1)}%`);
      card.style.setProperty('--glare-y', `${(py * 100).toFixed(1)}%`);
    });
  });

  card.addEventListener('pointerleave', () => {
    if (rafId) cancelAnimationFrame(rafId);
    card.classList.remove('is-tilting');
    card.style.transform = '';
  });
}

/* ==========================================================================
   4. 수상작 자동 인식 & 키워드 완벽 제거 & 진행중 폴더 작가명 블라인드(익명) 처리
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
    return { tier: 'GRAND', rankOrder: 1, label: '👑 대상 · GRAND PRIZE', shortLabel: '👑 대상 · WINNER', isTopWinner: true };
  }
  if (/(?:\[\s*최우수(?:상)?\s*\]|(?:^|[_\s-])최우수(?:상)?(?:$|[_\s-]))/i.test(s)) {
    return { tier: 'BEST', rankOrder: 2, label: '👑 최우수상 · BEST AWARD', shortLabel: '👑 최우수 · WINNER', isTopWinner: true };
  }
  if (/(?:\[\s*(?:1등|우승)\s*\]|(?:^|[_\s-])(?:1등|우승)(?:$|[_\s-]))/i.test(s)) {
    return { tier: 'FIRST', rankOrder: 3, label: '👑 1등 · WINNER', shortLabel: '👑 1등 · WINNER', isTopWinner: true };
  }
  if (/(?:\[\s*(?:우수(?:상)?|2등|3등)\s*\]|(?:^|[_\s-])(?:우수(?:상)?|2등|3등)(?:$|[_\s-]))/i.test(s)) {
    return { tier: 'EXCELLENCE', rankOrder: 4, label: '✦ 우수상 · EXCELLENCE', shortLabel: '✦ 우수상', isTopWinner: false };
  }
  if (/(?:\[\s*(?:장려(?:상)?|입선)\s*\]|(?:^|[_\s-])(?:장려(?:상)?|입선)(?:$|[_\s-]))/i.test(s)) {
    return { tier: 'HONOR', rankOrder: 5, label: '• 입선 · HONORABLE', shortLabel: '• 입선', isTopWinner: false };
  }
  return null;
}

// 파일명에 1등, 우승, 대상, 최우수 키워드 중 하나라도 포함되어 있는지 감지 (대괄호 무관)
function isFirstPrize(filename) {
  const info = getAwardTierInfo(filename);
  return Boolean(info && info.isTopWinner);
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

// 작가명 추출: 수상 키워드 및 맨 앞 번호(01_) 제거 후 첫 번째 언더바(_) 앞부분 추출
function extractAuthorFromFilename(filename) {
  const cleaned = removeAwardAndLeadingNumber(filename);
  const underscoreIdx = cleaned.indexOf('_');
  if (underscoreIdx > 0) {
    return cleaned.slice(0, underscoreIdx).trim();
  }
  return '';
}

// 카메라 기종(EXIF) 추출: 작가명_작품제목_카메라기종 형태에서 3번째 이상 파트가 있을 때 마지막 파트 추출
function extractCameraFromFilename(filename) {
  const cleaned = cleanDuplicateTrailingNumber(removeAwardAndLeadingNumber(filename));
  const parts = cleaned.split('_').map(s => s.trim()).filter(Boolean);
  if (parts.length >= 3) {
    return parts[parts.length - 1];
  }
  return '';
}

// 순수 작품 제목 추출 (언더바 뒤 작품 제목 부분만 추출 + 카메라 기종 분리 + 끝의 중복 (1), (2) 제거)
function extractWorkTitleOnly(filename, hideCamera = false) {
  const cleaned = removeAwardAndLeadingNumber(filename);
  const withoutParen = cleanDuplicateTrailingNumber(cleaned);
  const parts = withoutParen.split('_').map(s => s.trim()).filter(Boolean);

  if (parts.length >= 3) {
    return parts.slice(1, -1).join(' ');
  }
  if (parts.length === 2) {
    return parts[1];
  }
  return withoutParen;
}

// 사진 정렬 비교 함수: [1등] 최상단 -> 1순위 파일명 숫자 오름차순 -> 2순위 업로드(수정) 시간 오름차순
function comparePhotosByPriority(a, b) {
  const aWin = isFirstPrize(a.name) ? 1 : 0;
  const bWin = isFirstPrize(b.name) ? 1 : 0;
  if (aWin !== bWin) return bWin - aWin;

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

    if (ongoing) {
      group.forEach((p, idx) => {
        p.contestNumber = idx + 1;
      });
    } else {
      group.forEach((p) => {
        p.contestNumber = null;
      });
    }
    result.push(...group);
  });

  return result;
}

// 사진 객체별로 화면에 표시할 제목, 순번 배지, 작가명, 카메라 EXIF, 수상 등급 반환
function getDisplayMeta(photo) {
  const inOngoing = isOngoingFolder(photo.folderName);
  const rawAuthor = extractAuthorFromFilename(photo.name);
  const rawCamera = extractCameraFromFilename(photo.name);
  const pureWorkTitle = extractWorkTitleOnly(photo.name, inOngoing);
  const fullCleanTitle = cleanDuplicateTrailingNumber(removeAwardAndLeadingNumber(photo.name));
  const awardInfo = getAwardTierInfo(photo.name);

  if (inOngoing) {
    const numLabel = photo.contestNumber ? `${photo.contestNumber}번` : '';
    const combinedTitle = numLabel ? `${numLabel} ${pureWorkTitle}` : pureWorkTitle;
    return {
      title: combinedTitle,
      pureTitle: pureWorkTitle,
      numLabel: numLabel,
      authorName: '익명',
      authorLabel: 'by 익명',
      cameraLabel: '',
      awardInfo: null,
      isAnonymous: true
    };
  }

  return {
    title: fullCleanTitle,
    pureTitle: pureWorkTitle || fullCleanTitle,
    numLabel: '',
    authorName: rawAuthor || '미상',
    authorLabel: rawAuthor ? `by ${rawAuthor}` : '',
    cameraLabel: rawCamera,
    awardInfo: awardInfo,
    isAnonymous: false
  };
}

// 검색어 매칭 검사 (진행중 폴더는 실제 작가명/카메라 기종 검색을 차단하고 오직 노출된 제목 및 번호로만 검색 허용)
function matchesSearchQuery(photo, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  const meta = getDisplayMeta(photo);

  if (meta.isAnonymous) {
    // 진행중 익명 작품: 오직 화면에 표시된 번호('1번', '1')와 순수 작품 제목만 검색 허용
    const searchable = `${meta.numLabel} ${meta.pureTitle}`.toLowerCase();
    return searchable.includes(q);
  }

  // 일반 마감 폴더 작품: 작품 제목, 작가명, 카메라 기종(파일명 전체), 폴더명 모두 검색 허용
  const fullSearchable = `${meta.title} ${photo.name} ${photo.folderName || ''}`.toLowerCase();
  return fullSearchable.includes(q);
}

/* ==========================================================================
   5. 구글 드라이브 폴더 & 하위 폴더 파싱
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

function renderSkeletonGrid(count = 6) {
  const grid = document.getElementById('photoGrid');
  const heights = ['', 'tall', 'short', 'tall', '', 'short'];
  let html = '';
  for (let i = 0; i < count; i++) {
    html += `
      <div class="photo-card in-view">
        <div class="photo-media-wrap skeleton-card-box ${heights[i % heights.length]}">
          <div class="skeleton-shimmer">
            <div class="apple-spinner"></div>
          </div>
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

function isNonImageFile(name) {
  return /\.(pdf|zip|rar|7z|mp4|mov|avi|mkv|doc|docx|xls|xlsx|ppt|pptx|txt|csv|json|js|css|html)$/i.test(name);
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
    } else if (!isNonImageFile(name)) {
      files.push({ id, name, modifiedTime, uploadIndex: i });
    }
  }

  return { subfolders, files };
}

async function fetchSingleFolderEmbedHtml(folderId, bustCache = false) {
  const cb = bustCache ? `&cb=${Date.now()}` : '';
  const embedUrl = `https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(folderId)}${cb}#grid`;
  const proxyUrls = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(embedUrl)}${cb}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(embedUrl)}`,
    `https://corsproxy.io/?${encodeURIComponent(embedUrl)}`
  ];

  for (const pUrl of proxyUrls) {
    try {
      const res = await fetch(pUrl, { cache: 'no-store' });
      if (!res.ok) continue;
      const html = await res.text();
      if (html && html.includes('flip-entry')) return html;
    } catch (e) {}
  }

  try {
    const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(embedUrl)}${cb}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && data.contents) return data.contents;
    }
  } catch (e) {}

  return '';
}

async function fetchFolderTreeViaPublicEmbed(rootFolderId, bustCache = false, maxDepth = 3) {
  const photos = [];
  const folders = [];
  const visited = new Set();

  async function traverse(folderId, folderName, depth) {
    if (visited.has(folderId) || depth > maxDepth) return;
    visited.add(folderId);

    const html = await fetchSingleFolderEmbedHtml(folderId, bustCache);
    if (!html) return;

    const { subfolders, files } = parseEntriesFromEmbedHtml(html);

    if (files.length > 0) {
      if (!folders.some(f => f.id === folderId)) {
        folders.push({ id: folderId, name: folderName });
      }
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
  return { folders, photos };
}

function renderFolderTabs() {
  const tabsContainer = document.getElementById('folderCategoryTabs');
  if (!tabsContainer) return;

  if (folderCategories.length <= 1 && folderCategories[0]?.name === '기본 폴더') {
    tabsContainer.innerHTML = '';
    return;
  }

  let html = `
    <button type="button" class="folder-tab-btn ${selectedSubfolderId === 'ALL' ? 'active' : ''}" data-folder-id="ALL">
      ${escapeHtml(I18N.allTab)}<span class="folder-tab-count">${allPhotos.length}</span>
    </button>
  `;

  folderCategories.forEach(folder => {
    const count = allPhotos.filter(p => p.folderId === folder.id).length;
    const ongoing = isOngoingFolder(folder.name);
    const label = ongoing ? cleanOngoingFolderName(folder.name) : folder.name;
    html += `
      <button type="button" class="folder-tab-btn ${selectedSubfolderId === folder.id ? 'active' : ''}" data-folder-id="${folder.id}">
        ${ongoing ? '<span class="tab-live-dot" title="진행중"></span>' : ''}${escapeHtml(label)}<span class="folder-tab-count">${count}</span>
      </button>
    `;
  });

  tabsContainer.innerHTML = html;

  tabsContainer.querySelectorAll('.folder-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedSubfolderId = btn.getAttribute('data-folder-id');
      renderFolderTabs();
      renderOngoingHeroShowcase();
      applyFiltersAndRender();
    });
  });
}

function applyFiltersAndRender() {
  const matched = allPhotos.filter(p => {
    const matchFolder = selectedSubfolderId === 'ALL' || p.folderId === selectedSubfolderId;
    if (!matchFolder) return false;
    return matchesSearchQuery(p, searchQuery);
  });

  // 1등 수상작 우선 배치 + 진행중 폴더 번호순 / 일반 폴더 우선순위 유지
  filteredPhotos = [...matched].sort((a, b) => {
    const aWin = isFirstPrize(a.name) ? 1 : 0;
    const bWin = isFirstPrize(b.name) ? 1 : 0;
    if (aWin !== bWin) return bWin - aWin;

    if (a.folderId === b.folderId && a.contestNumber && b.contestNumber) {
      return a.contestNumber - b.contestNumber;
    }
    return comparePhotosByPriority(a, b);
  });

  const badge = document.getElementById('photoCountBadge');
  if (badge) {
    const activeFolder = folderCategories.find(f => f.id === selectedSubfolderId);
    const cleanFolder = activeFolder ? cleanOngoingFolderName(activeFolder.name) : '';
    const prefix = cleanFolder ? `${cleanFolder} · ` : '';
    badge.textContent = `${prefix}${filteredPhotos.length}장의 사진`;
  }

  renderPhotoGrid(filteredPhotos);
}

async function loadDriveFolder(folderInput, forceLive = false) {
  const folderId = extractFolderId(folderInput);
  const badge = document.getElementById('photoCountBadge');
  const statusBanner = document.getElementById('statusBanner');
  const refreshBtn = document.getElementById('btnRefreshGallery');

  if (statusBanner) statusBanner.classList.add('hidden');
  if (badge) badge.textContent = forceLive ? '최신 목록 동기화 중...' : '컬렉션 동기화 중...';

  if (forceLive && refreshBtn) {
    refreshBtn.classList.add('is-spinning');
  } else {
    renderSkeletonGrid(6);
  }

  try {
    let photos = [];
    let folders = [];

    const isLocalServer =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    // 1순위: 강제 새로고침이 아닐 때는 정적 캐시(drive-cache.json)를 먼저 즉시 로드하여 "컬렉션 불러오는 중" 멈춤 현상 원천 차단
    if (!forceLive) {
      try {
        const cacheRes = await fetch(`./drive-cache.json?t=${Date.now()}`);
        if (cacheRes.ok) {
          const cacheData = await cacheRes.json();
          if (cacheData.ok && cacheData.folderId === folderId && Array.isArray(cacheData.photos) && cacheData.photos.length > 0) {
            photos = cacheData.photos;
            folders = Array.isArray(cacheData.folders) ? cacheData.folders : [];
          }
        }
      } catch (cacheErr) {}
    }

    // 2순위: 로컬 서버 API (/api/folder) 호출 (강제 새로고침이거나 캐시가 비어 있을 때)
    if ((photos.length === 0 || forceLive) && isLocalServer) {
      try {
        const liveParam = forceLive ? '&live=1' : '';
        const res = await fetch(`./api/folder?id=${encodeURIComponent(folderId)}${liveParam}&t=${Date.now()}`, {
          cache: 'no-store'
        });
        if (res.ok) {
          const data = await res.json();
          if (data.ok && Array.isArray(data.photos) && data.photos.length > 0) {
            photos = data.photos;
            folders = Array.isArray(data.folders) ? data.folders : [];
          }
        }
      } catch (localErr) {}
    }

    // 3순위: 공개 임베드 뷰 직접 파싱 폴백
    if (photos.length === 0) {
      const result = await fetchFolderTreeViaPublicEmbed(folderId, forceLive);
      photos = result.photos;
      folders = result.folders;
    }

    folderCategories = sortFoldersOngoingFirst(folders);
    // 진행중 폴더 작품들을 정렬하고 1번, 2번... 고유 번호를 부여 (All 탭 및 라이트박스에서도 동일 번호 유지)
    allPhotos = sortAndNumberOngoingPhotos(photos);

    if (selectedSubfolderId !== 'ALL' && !folderCategories.some(f => f.id === selectedSubfolderId)) {
      selectedSubfolderId = 'ALL';
    }

    renderFolderTabs();
    updateOngoingNoticeUI();
    renderOngoingHeroShowcase();

    if (photos.length === 0) {
      document.getElementById('photoGrid').innerHTML = '';
      if (badge) badge.textContent = '0장의 사진';
      if (statusBanner) {
        statusBanner.textContent = '폴더에서 사진을 불러오지 못했습니다. config.js의 드라이브 폴더 공유 권한이 "링크가 있는 모든 사용자"인지 확인해 주세요.';
        statusBanner.classList.remove('hidden');
      }
      return;
    }

    applyFiltersAndRender();
    if (currentMainView === 'competitions') renderCompetitionsArchiveView();
    if (currentMainView === 'competition-detail') renderCompetitionDetailView(selectedCompetitionId);
    if (currentMainView === 'winners') renderWinnersHallView();
    updateFooterLastUpdated(true);

    if (forceLive) {
      showAppleToast('최신 목록으로 업데이트되었습니다');
    }
  } catch (err) {
    if (badge) badge.textContent = '연결 오류';
    if (statusBanner) {
      statusBanner.textContent = `오류가 발생했습니다: ${err.message}`;
      statusBanner.classList.remove('hidden');
    }
  } finally {
    if (refreshBtn) {
      refreshBtn.classList.remove('is-spinning');
    }
  }
}

/* ==========================================================================
   6. 사진 그리드 렌더링 & 라이트박스 (모바일 터치 스와이프/드래그 닫기 제스처 포함)
   ========================================================================== */
function renderPhotoCardHtml(photo, idx, forceWinnerGlow = false) {
  const awardInfo = getAwardTierInfo(photo.name);
  const winner = Boolean(awardInfo && awardInfo.isTopWinner);
  // 1등 수상작 카드에도 은은한 골드 1px 외곽선과 부드러운 후광 적용
  const showWinnerGlow = forceWinnerGlow || winner;
  const meta = getDisplayMeta(photo);
  const rawFolder = photo.folderName && photo.folderName !== '기본 폴더' ? photo.folderName : '';
  const folderLabel = rawFolder ? cleanOngoingFolderName(rawFolder) : '';
  const numBadgeHtml = meta.numLabel
    ? `<span class="vote-num-badge">${escapeHtml(meta.numLabel)}</span>`
    : '';
  const exifPillHtml = meta.cameraLabel
    ? `<span class="caption-exif-pill">📷 ${escapeHtml(meta.cameraLabel)}</span>`
    : '';
  const badgeLabel = awardInfo ? awardInfo.shortLabel : I18N.firstPrizeBadge;

  return `
    <article
      class="photo-card ${showWinnerGlow ? 'is-winner' : ''}"
      data-index="${idx}"
      data-photo-id="${escapeHtml(photo.id)}"
      tabindex="0"
      role="button"
      aria-label="${escapeHtml(meta.title)} 크게 보기"
      style="transition-delay: ${Math.min(idx * 45, 270)}ms"
    >
      <div class="card-glare" aria-hidden="true"></div>
      <div class="photo-media-wrap">
        ${awardInfo ? `<span class="winner-glass-badge ${awardInfo.isTopWinner ? '' : 'is-silver-tier'}">${escapeHtml(badgeLabel)}</span>` : ''}
        <div class="skeleton-shimmer">
          <div class="apple-spinner"></div>
        </div>
        <img
          class="photo-thumb"
          src="${photo.thumbUrl}"
          alt="${escapeHtml(meta.title)}"
          loading="lazy"
          referrerpolicy="no-referrer"
        />
        <div class="card-glass-caption">
          <div class="caption-text-group">
            <div class="caption-meta-row">
              ${folderLabel ? `<span>${escapeHtml(folderLabel)}</span>` : ''}
              ${folderLabel && meta.authorLabel ? `<span>·</span>` : ''}
              ${meta.authorLabel ? `<span class="caption-author">${escapeHtml(meta.authorLabel)}</span>` : ''}
              ${exifPillHtml}
            </div>
            <h3 class="caption-title">${numBadgeHtml}${escapeHtml(meta.pureTitle)}</h3>
          </div>
          <span class="caption-expand-icon" aria-hidden="true">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 3 21 3 21 9"></polyline>
              <polyline points="9 21 3 21 3 15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
          </span>
        </div>
      </div>
    </article>
  `;
}

function bindPhotoCardEvents(container, photoList) {
  if (!container) return;
  setupScrollRevealObserver();

  container.querySelectorAll('.photo-card').forEach(card => {
    const img = card.querySelector('.photo-thumb');
    const idx = Number(card.getAttribute('data-index'));

    revealObserver.observe(card);
    setTimeout(() => {
      card.style.transitionDelay = '0ms';
    }, 650);

    attachAppleCardInteractions(card);

    const markLoaded = () => card.classList.add('loaded');
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

function renderPhotoGrid(photos) {
  const grid = document.getElementById('photoGrid');
  if (!grid) return;
  grid.innerHTML = photos.map((photo, idx) => renderPhotoCardHtml(photo, idx)).join('');
  bindPhotoCardEvents(grid, photos);
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
  const winner = isFirstPrize(photo.name);
  const img = document.getElementById('lightboxImage');
  const spinner = document.getElementById('lightboxSpinner');
  const counter = document.getElementById('lightboxCounter');
  const title = document.getElementById('lightboxTitle');
  const authorEl = document.getElementById('lightboxAuthor');
  const folderTag = document.getElementById('lightboxFolderTag');
  const resText = document.getElementById('lightboxResolution');
  const ambientBg = document.getElementById('lightboxAmbientBg');

  img.setAttribute('referrerpolicy', 'no-referrer');

  counter.textContent = `${activePhotoIndex + 1} / ${filteredPhotos.length}`;
  const winnerInline = winner ? `<span class="winner-badge-inline">${escapeHtml(I18N.firstPrizeBadge)}</span>` : '';
  const numInline = meta.numLabel ? `<span class="vote-num-badge">${escapeHtml(meta.numLabel)}</span>` : '';
  title.innerHTML = `${winnerInline}${numInline}${escapeHtml(meta.pureTitle)}`;

  if (authorEl) {
    authorEl.textContent = meta.authorLabel || '';
    authorEl.classList.toggle('hidden', !meta.authorLabel);
  }

  if (photo.folderName && photo.folderName !== '기본 폴더') {
    folderTag.textContent = cleanOngoingFolderName(photo.folderName);
    folderTag.classList.remove('hidden');
  } else {
    folderTag.classList.add('hidden');
  }

  resText.textContent = '';
  ambientBg.style.backgroundImage = `url('${photo.thumbUrl}')`;

  document.querySelectorAll('.film-thumb').forEach((el, idx) => {
    el.classList.toggle('active', idx === activePhotoIndex);
  });

  img.classList.remove('loaded');
  spinner.classList.remove('hidden');

  img.onload = () => {
    spinner.classList.add('hidden');
    img.classList.add('loaded');
    if (img.naturalWidth && img.naturalHeight) {
      resText.textContent = `${img.naturalWidth} × ${img.naturalHeight}`;
    }
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
  img.alt = meta.title;
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

// 모바일 라이트박스 터치 제스처 (좌우 스와이프 이전/다음, 아래로 당겨서 닫기)
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

    // 아래로 당기는 제스처 시각 피드백
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

    // 좌우 스와이프 (이전/다음 사진 전환)
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

    // 아래로 당겨서 닫기 (Swipe Down to Close)
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
   6-B. 공모전 아카이브 & 공모전 상세 전시관 & 역대 수상작 큐레이션
   ========================================================================== */

// 폴더명 및 사진 메타데이터로부터 공모전 상세 정보(연도, 개최 기간, 상태, 대표 이미지, 수상작, 출품작, 참여 작가) 생성
function buildCompetitionMetadata(folder) {
  const ongoing = isOngoingFolder(folder.name);
  const title = cleanOngoingFolderName(folder.name);
  const yearMatch = folder.name.match(/(20\d{2})/);
  const year = yearMatch ? yearMatch[1] : '2026';

  let period = `${year} 시즌 아카이브`;
  if (/겨울/i.test(title)) period = `${year}.11 — 진행 중`;
  else if (/봄/i.test(title)) period = `${year} 봄 시즌 전시`;
  else if (/여름/i.test(title)) period = `${year} 여름 시즌 전시`;
  else if (/가을/i.test(title)) period = `${year} 가을 시즌 전시`;
  else if (ongoing) period = `${year} 현재 투표 및 전시 진행 중`;
  else period = `${year} 공식 마감 · 영구 보존 전시`;

  const photos = allPhotos.filter(p => p.folderId === folder.id);
  const winners = photos.filter(p => Boolean(getAwardTierInfo(p.name)));
  const coverPhoto = winners[0] || photos[0] || null;

  // 참여 작가 목록 추출 (진행중 공모전은 익명 블라인드 보호)
  const authorSet = new Set();
  if (ongoing) {
    authorSet.add(`익명 참여 작가 (${photos.length}출품 · 블라인드 투표 중)`);
  } else {
    photos.forEach(p => {
      const a = extractAuthorFromFilename(p.name);
      if (a) authorSet.add(a);
    });
  }
  const authors = Array.from(authorSet);

  const description = ongoing
    ? `현재 실시간 블라인드 투표가 진행 중인 「${title}」 전시입니다. 공정한 심사를 위해 모든 출품작의 작가명과 카메라 기종이 익명으로 보호되며, 종료 후 수상작과 작가명이 영구 아카이브에 기록됩니다.`
    : `「${title}」에 출품된 총 ${photos.length}점의 작품과 수상작을 보존한 공식 디지털 전시관입니다. 공모전 종료 이후에도 각 작가의 시선과 기록을 언제든 감상할 수 있습니다.`;

  return {
    id: folder.id,
    rawName: folder.name,
    title,
    year,
    period,
    ongoing,
    statusLabel: ongoing ? '진행 중 · LIVE' : '전시 종료 · ARCHIVED',
    photoCount: photos.length,
    winnerCount: winners.length,
    coverPhoto,
    photos,
    winners,
    authors,
    description
  };
}

function getAllCompetitionsMeta() {
  return folderCategories
    .filter(f => f.name !== '기본 폴더' || folderCategories.length === 1)
    .map(buildCompetitionMetadata);
}

// 1. 메인 갤러리 상단 진행 중인 공모전 스포트라이트 쇼케이스 렌더링
function renderOngoingHeroShowcase() {
  const wrap = document.getElementById('ongoingHeroCardWrap');
  if (!wrap) return;

  const ongoingFolder = folderCategories.find(f => isOngoingFolder(f.name));
  if (!ongoingFolder || selectedSubfolderId !== 'ALL' || searchQuery.trim() !== '') {
    wrap.classList.add('hidden');
    wrap.innerHTML = '';
    return;
  }

  const comp = buildCompetitionMetadata(ongoingFolder);
  const previewPhotos = comp.photos.slice(0, 3);

  wrap.innerHTML = `
    <div class="ongoing-showcase-card">
      <div class="ongoing-showcase-info">
        <div class="ongoing-showcase-badges">
          <span class="comp-status-pill is-live"><span class="live-dot"></span>${escapeHtml(comp.statusLabel)}</span>
          <span class="comp-period-tag">${escapeHtml(comp.period)}</span>
        </div>
        <h2 class="ongoing-showcase-title">${escapeHtml(comp.title)}</h2>
        <p class="ongoing-showcase-desc">${escapeHtml(comp.description)}</p>
        <div class="ongoing-showcase-stats">
          <div class="stat-box">
            <span class="stat-num">${comp.photoCount}</span>
            <span class="stat-label">출품작</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-box">
            <span class="stat-num">블라인드</span>
            <span class="stat-label">심사 방식</span>
          </div>
        </div>
        <div class="ongoing-showcase-actions">
          <button type="button" class="ongoing-btn-primary" id="btnShowcaseOpenDetail">공모전 전시관 입장 &rarr;</button>
          <button type="button" class="ongoing-btn-secondary" id="btnShowcaseFilterGrid">갤러리에서 바로 필터링</button>
        </div>
      </div>
      <div class="ongoing-showcase-thumbs">
        ${previewPhotos.map((p, idx) => {
          const meta = getDisplayMeta(p);
          return `
            <div class="showcase-thumb-card" data-showcase-photo-id="${escapeHtml(p.id)}" role="button" tabindex="0" aria-label="${escapeHtml(meta.title)} 보기">
              <img src="${p.thumbUrl}" alt="${escapeHtml(meta.title)}" loading="lazy" referrerpolicy="no-referrer" />
              <span class="showcase-thumb-num">${escapeHtml(meta.numLabel || `${idx + 1}번`)}</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
  wrap.classList.remove('hidden');

  document.getElementById('btnShowcaseOpenDetail')?.addEventListener('click', () => {
    openCompetitionDetail(comp.id);
  });
  document.getElementById('btnShowcaseFilterGrid')?.addEventListener('click', () => {
    navigateToOngoingFolder(ongoingFolder);
  });
  wrap.querySelectorAll('.showcase-thumb-card').forEach(el => {
    el.addEventListener('click', () => {
      const pid = el.getAttribute('data-showcase-photo-id');
      filteredPhotos = comp.photos;
      const targetIdx = filteredPhotos.findIndex(p => p.id === pid);
      if (targetIdx !== -1) openLightbox(targetIdx);
    });
  });
}

// 2. 공모전 아카이브 페이지 렌더링 (연도별 분류, 진행 중/종료 상태, 개최 기간, 작품 수)
function renderCompetitionsArchiveView() {
  const filterBar = document.getElementById('compYearFilterBar');
  const container = document.getElementById('competitionsListContainer');
  if (!container || !filterBar) return;

  const comps = getAllCompetitionsMeta();
  const years = Array.from(new Set(comps.map(c => c.year))).sort((a, b) => b.localeCompare(a));

  const filterOptions = [
    { id: 'ALL', label: `전체 (${comps.length})` },
    { id: 'LIVE', label: `진행 중 (${comps.filter(c => c.ongoing).length})` },
    { id: 'ENDED', label: `종료된 전시 (${comps.filter(c => !c.ongoing).length})` },
    ...years.map(y => ({ id: `YEAR_${y}`, label: `${y}년` }))
  ];

  filterBar.innerHTML = filterOptions.map(opt => `
    <button type="button" class="comp-filter-chip ${selectedCompYearFilter === opt.id ? 'active' : ''}" data-comp-filter="${opt.id}">
      ${escapeHtml(opt.label)}
    </button>
  `).join('');

  filterBar.querySelectorAll('.comp-filter-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedCompYearFilter = btn.getAttribute('data-comp-filter');
      renderCompetitionsArchiveView();
    });
  });

  const q = searchQuery.toLowerCase();
  const filteredComps = comps.filter(c => {
    if (selectedCompYearFilter === 'LIVE' && !c.ongoing) return false;
    if (selectedCompYearFilter === 'ENDED' && c.ongoing) return false;
    if (selectedCompYearFilter.startsWith('YEAR_')) {
      const targetY = selectedCompYearFilter.replace('YEAR_', '');
      if (c.year !== targetY) return false;
    }
    if (q) {
      const searchable = `${c.title} ${c.year} ${c.period} ${c.authors.join(' ')}`.toLowerCase();
      return searchable.includes(q);
    }
    return true;
  });

  if (filteredComps.length === 0) {
    container.innerHTML = `
      <div class="archive-empty-state">조건에 해당하는 공모전 아카이브가 없습니다.</div>
    `;
    return;
  }

  // 연도별 그룹화
  const groupedByYear = new Map();
  filteredComps.forEach(c => {
    if (!groupedByYear.has(c.year)) groupedByYear.set(c.year, []);
    groupedByYear.get(c.year).push(c);
  });

  let html = '';
  groupedByYear.forEach((group, year) => {
    html += `
      <div class="comp-year-section">
        <div class="comp-year-header">
          <h2 class="comp-year-title">${escapeHtml(year)}</h2>
          <span class="comp-year-count">${group.length}개의 공모전 아카이브</span>
        </div>
        <div class="comp-cards-grid">
          ${group.map(comp => {
            const coverUrl = comp.coverPhoto ? comp.coverPhoto.thumbUrl : '';
            const topWinner = comp.winners[0];
            const topWinnerMeta = topWinner ? getDisplayMeta(topWinner) : null;
            return `
              <article class="comp-archive-card ${comp.ongoing ? 'is-ongoing-card' : ''}" data-comp-id="${escapeHtml(comp.id)}" tabindex="0" role="button" aria-label="${escapeHtml(comp.title)} 상세 페이지 열기">
                <div class="comp-card-cover-wrap">
                  ${coverUrl ? `<img class="comp-card-cover" src="${coverUrl}" alt="${escapeHtml(comp.title)}" loading="lazy" referrerpolicy="no-referrer" />` : ''}
                  <div class="comp-card-cover-overlay"></div>
                  <div class="comp-card-top-badges">
                    <span class="comp-status-pill ${comp.ongoing ? 'is-live' : 'is-ended'}">
                      ${comp.ongoing ? '<span class="live-dot"></span>' : ''}${escapeHtml(comp.statusLabel)}
                    </span>
                    ${comp.winnerCount > 0 ? `<span class="comp-winner-count-pill">👑 수상작 ${comp.winnerCount}점</span>` : ''}
                  </div>
                </div>
                <div class="comp-card-body">
                  <div class="comp-card-period">${escapeHtml(comp.period)}</div>
                  <h3 class="comp-card-title">${escapeHtml(comp.title)}</h3>
                  <p class="comp-card-desc">${escapeHtml(comp.description)}</p>
                  ${topWinnerMeta ? `
                    <div class="comp-card-winner-highlight">
                      <span class="winner-highlight-label">대표 수상작</span>
                      <span class="winner-highlight-val">${escapeHtml(topWinnerMeta.pureTitle)} (${escapeHtml(topWinnerMeta.authorLabel)})</span>
                    </div>
                  ` : ''}
                  <div class="comp-card-footer">
                    <div class="comp-card-meta-stats">
                      <span>출품작 <strong>${comp.photoCount}</strong>점</span>
                      <span>·</span>
                      <span>참여 작가 <strong>${comp.ongoing ? '익명' : `${comp.authors.length}명`}</strong></span>
                    </div>
                    <span class="comp-card-enter-link">전시 관람하기 &rarr;</span>
                  </div>
                </div>
              </article>
            `;
          }).join('')}
        </div>
      </div>
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
  });
}

// 3. 공모전 상세 페이지 이동 및 렌더링 (공모전 제목/소개, 개최 기간, 대표 이미지, 수상작 모음, 전체 출품작, 참여 작가 목록)
function openCompetitionDetail(folderId) {
  if (!folderId) return;
  selectedCompetitionId = folderId;
  switchMainView('competition-detail');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderCompetitionDetailView(folderId) {
  const container = document.getElementById('competitionDetailContent');
  if (!container) return;

  const targetFolder = folderCategories.find(f => f.id === folderId) || folderCategories[0];
  if (!targetFolder) {
    container.innerHTML = `<div class="archive-empty-state">공모전 정보를 불러오는 중입니다...</div>`;
    return;
  }

  const comp = buildCompetitionMetadata(targetFolder);
  const coverUrl = comp.coverPhoto ? comp.coverPhoto.thumbUrl : '';
  const coverMeta = comp.coverPhoto ? getDisplayMeta(comp.coverPhoto) : null;

  container.innerHTML = `
    <!-- 공모전 대표 이미지 & 에디토리얼 헤더 -->
    <div class="comp-detail-hero">
      <div class="comp-detail-hero-media">
        ${coverUrl ? `<img src="${coverUrl}" alt="${escapeHtml(comp.title)} 대표 이미지" referrerpolicy="no-referrer" />` : ''}
        <div class="comp-detail-hero-gradient"></div>
      </div>
      <div class="comp-detail-hero-content">
        <div class="comp-detail-badges">
          <span class="comp-status-pill ${comp.ongoing ? 'is-live' : 'is-ended'}">
            ${comp.ongoing ? '<span class="live-dot"></span>' : ''}${escapeHtml(comp.statusLabel)}
          </span>
          <span class="comp-period-tag">${escapeHtml(comp.period)}</span>
        </div>
        <h1 class="comp-detail-title">${escapeHtml(comp.title)}</h1>
        <p class="comp-detail-desc">${escapeHtml(comp.description)}</p>
        <div class="comp-detail-QuickStats">
          <div class="detail-stat-item">
            <span class="detail-stat-label">개최 연도</span>
            <strong class="detail-stat-value">${escapeHtml(comp.year)}년</strong>
          </div>
          <div class="detail-stat-item">
            <span class="detail-stat-label">총 출품작</span>
            <strong class="detail-stat-value">${comp.photoCount}점</strong>
          </div>
          <div class="detail-stat-item">
            <span class="detail-stat-label">수상작</span>
            <strong class="detail-stat-value">${comp.winnerCount > 0 ? `${comp.winnerCount}점` : (comp.ongoing ? '심사 진행 중' : '-')}</strong>
          </div>
          <div class="detail-stat-item">
            <span class="detail-stat-label">참여 작가</span>
            <strong class="detail-stat-value">${comp.ongoing ? '블라인드 익명' : `${comp.authors.length}명`}</strong>
          </div>
        </div>
        ${coverMeta ? `<div class="comp-cover-caption">대표 전시작: ${escapeHtml(coverMeta.pureTitle)} (${escapeHtml(coverMeta.authorLabel)})</div>` : ''}
      </div>
    </div>

    <!-- 참여 작가 아카이브 목록 -->
    <section class="comp-detail-section">
      <div class="comp-section-head">
        <div>
          <p class="comp-section-eyebrow">PARTICIPATING PHOTOGRAPHERS</p>
          <h2 class="comp-section-title">참여 작가 목록</h2>
        </div>
      </div>
      <div class="comp-authors-list">
        ${comp.authors.map(author => `
          <span class="comp-author-chip">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            ${escapeHtml(author)}
          </span>
        `).join('')}
      </div>
    </section>

    <!-- 수상작 모음 섹션 (수상작이 있는 경우 강조 전시) -->
    ${comp.winners.length > 0 ? `
      <section class="comp-detail-section">
        <div class="comp-section-head">
          <div>
            <p class="comp-section-eyebrow">AWARD-WINNING WORKS</p>
            <h2 class="comp-section-title">수상작 모음</h2>
          </div>
          <span class="comp-section-count">총 ${comp.winners.length}점</span>
        </div>
        <div id="compDetailWinnersGrid" class="comp-winners-spotlight-grid">
          ${comp.winners.map((photo, idx) => renderPhotoCardHtml(photo, idx, true)).join('')}
        </div>
      </section>
    ` : ''}

    <!-- 전체 출품작 아카이브 그리드 -->
    <section class="comp-detail-section">
      <div class="comp-section-head">
        <div>
          <p class="comp-section-eyebrow">ALL EXHIBITED WORKS</p>
          <h2 class="comp-section-title">전체 출품작 (${comp.photoCount})</h2>
        </div>
      </div>
      <div id="compDetailAllPhotosGrid" class="bento-grid">
        ${comp.photos.map((photo, idx) => renderPhotoCardHtml(photo, idx, true)).join('')}
      </div>
    </section>
  `;

  if (comp.winners.length > 0) {
    bindPhotoCardEvents(document.getElementById('compDetailWinnersGrid'), comp.winners);
  }
  bindPhotoCardEvents(document.getElementById('compDetailAllPhotosGrid'), comp.photos);
}

// 4. 역대 수상작 (Hall of Fame) 큐레이션 뷰 렌더링
function renderWinnersHallView() {
  const filterBar = document.getElementById('winnerTierFilterBar');
  const container = document.getElementById('winnersHallContainer');
  if (!container || !filterBar) return;

  const allWinners = allPhotos
    .map(p => ({ photo: p, award: getAwardTierInfo(p.name), meta: getDisplayMeta(p) }))
    .filter(item => item.award !== null)
    .sort((a, b) => a.award.rankOrder - b.award.rankOrder);

  const tierFilters = [
    { id: 'ALL', label: `전체 수상작 (${allWinners.length})` },
    { id: 'TOP', label: '대상 · 최우수 · 1등' },
    { id: 'EXCELLENCE', label: '우수상 · 장려 · 입선' }
  ];

  filterBar.innerHTML = tierFilters.map(t => `
    <button type="button" class="comp-filter-chip ${selectedWinnerTierFilter === t.id ? 'active' : ''}" data-tier-filter="${t.id}">
      ${escapeHtml(t.label)}
    </button>
  `).join('');

  filterBar.querySelectorAll('.comp-filter-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedWinnerTierFilter = btn.getAttribute('data-tier-filter');
      renderWinnersHallView();
    });
  });

  const q = searchQuery.toLowerCase();
  const filteredWinners = allWinners.filter(item => {
    if (selectedWinnerTierFilter === 'TOP' && !item.award.isTopWinner) return false;
    if (selectedWinnerTierFilter === 'EXCELLENCE' && item.award.isTopWinner) return false;
    if (q) {
      return matchesSearchQuery(item.photo, searchQuery);
    }
    return true;
  });

  if (filteredWinners.length === 0) {
    container.innerHTML = `
      <div class="archive-empty-state">표시할 수상작이 없습니다. 파일명에 [1등], [대상], [최우수상], [우수상] 태그가 포함된 작품이 이곳에 자동 큐레이션됩니다.</div>
    `;
    return;
  }

  const winnerPhotosList = filteredWinners.map(item => item.photo);

  container.innerHTML = `
    <div class="winners-curation-grid">
      ${filteredWinners.map((item, idx) => {
        const { photo, award, meta } = item;
        const compTitle = cleanOngoingFolderName(photo.folderName || '공모전');
        return `
          <article class="winner-pedestal-card" data-winner-idx="${idx}" tabindex="0" role="button" aria-label="${escapeHtml(meta.pureTitle)} 수상작 크게 보기">
            <div class="winner-pedestal-media">
              <span class="winner-glass-badge">${escapeHtml(award.label)}</span>
              <img src="${photo.thumbUrl}" alt="${escapeHtml(meta.pureTitle)}" loading="lazy" referrerpolicy="no-referrer" />
            </div>
            <div class="winner-pedestal-info">
              <div class="winner-pedestal-header">
                <div>
                  <span class="winner-pedestal-comp" data-comp-jump="${escapeHtml(photo.folderId)}">${escapeHtml(compTitle)} &rarr;</span>
                  <h2 class="winner-pedestal-title">${escapeHtml(meta.pureTitle)}</h2>
                </div>
                <div class="winner-pedestal-author-box">
                  <span class="winner-pedestal-author">${escapeHtml(meta.authorLabel || 'by 작가 미상')}</span>
                  ${meta.cameraLabel ? `<span class="winner-pedestal-camera">📷 ${escapeHtml(meta.cameraLabel)}</span>` : ''}
                </div>
              </div>
            </div>
          </article>
        `;
      }).join('')}
    </div>
  `;

  container.querySelectorAll('.winner-pedestal-card').forEach(card => {
    const idx = Number(card.getAttribute('data-winner-idx'));
    const openWinnerModal = () => {
      filteredPhotos = winnerPhotosList;
      openLightbox(idx);
    };
    card.addEventListener('click', openWinnerModal);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openWinnerModal();
      }
    });
  });

  container.querySelectorAll('[data-comp-jump]').forEach(el => {
    el.addEventListener('click', e => {
      e.stopPropagation();
      const fid = el.getAttribute('data-comp-jump');
      if (fid) openCompetitionDetail(fid);
    });
  });
}

/* ==========================================================================
   7. 구글 시트 CSV 연동 일반 커뮤니티 게시판 & 상세/안내 모달 (로컬 전용 표시)
   ========================================================================== */

// 정식 RFC 4180 CSV 파서 (셀 내부 줄바꿈, 쉼표, 이스케이프 따옴표 완벽 지원)
function parseCSVRows(csvText) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  const text = String(csvText || '').replace(/^\uFEFF/, '');

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(field);
        field = '';
      } else if (ch === '\r' && next === '\n') {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
        i++;
      } else if (ch === '\n' || ch === '\r') {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
      } else {
        field += ch;
      }
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

// 한국어/표준 타임스탬프 문자열을 비교 가능한 밀리초 숫자와 YYYY.MM.DD 표시 문자열로 변환
function parseSheetTimestamp(rawTs, fallbackOrder) {
  const s = String(rawTs || '').trim();
  if (!s) return { timeValue: fallbackOrder, displayDate: '-' };

  // 예: "2026. 11. 19. 오전 12:15:30" 또는 "2026-11-19" 또는 "2026.11.19"
  const m = s.match(/(\d{4})[.\-/]\s*(\d{1,2})[.\-/]\s*(\d{1,2})/);
  if (m) {
    const yyyy = m[1];
    const mm = String(m[2]).padStart(2, '0');
    const dd = String(m[3]).padStart(2, '0');
    const displayDate = `${yyyy}.${mm}.${dd}`;

    let hour = 0;
    let min = 0;
    let sec = 0;
    const timeMatch = s.match(/(오전|오후|AM|PM)?\s*(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/i);
    if (timeMatch) {
      const ampm = (timeMatch[1] || '').toUpperCase();
      hour = parseInt(timeMatch[2], 10);
      min = parseInt(timeMatch[3], 10);
      sec = parseInt(timeMatch[4] || '0', 10);
      if ((ampm === '오후' || ampm === 'PM') && hour < 12) hour += 12;
      if ((ampm === '오전' || ampm === 'AM') && hour === 12) hour = 0;
    }

    const timeValue = new Date(Number(yyyy), Number(mm) - 1, Number(dd), hour, min, sec).getTime();
    return {
      timeValue: !isNaN(timeValue) ? timeValue + fallbackOrder * 0.001 : fallbackOrder,
      displayDate
    };
  }

  const parsed = Date.parse(s);
  if (!isNaN(parsed)) {
    const d = new Date(parsed);
    const displayDate = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
    return { timeValue: parsed + fallbackOrder * 0.001, displayDate };
  }

  return { timeValue: fallbackOrder, displayDate: s };
}

function normalizeUrl(rawUrl) {
  const s = String(rawUrl || '').trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s}`;
}

function parseBoardCsvToPosts(csvText) {
  const rows = parseCSVRows(csvText);
  if (rows.length <= 1) return [];

  // 1행 헤더 인덱스 매핑 (타임스탬프, 작성자, 제목, 내용, 사진 첨부, 참고 링크, 상태)
  const headers = rows[0].map(h => String(h || '').trim());
  const findCol = (keywords, fallbackIdx) => {
    const idx = headers.findIndex(h => keywords.some(k => h.includes(k)));
    return idx !== -1 ? idx : fallbackIdx;
  };

  const colTimestamp = findCol(['타임스탬프', '날짜', '작성일', 'timestamp'], 0);
  const colAuthor = findCol(['작성자', '이름', '닉네임', 'author'], 1);
  const colTitle = findCol(['제목', 'title'], 2);
  const colContent = findCol(['내용', '본문', 'content'], 3);
  // 사진 첨부(col 4)는 무시
  const colLink = findCol(['참고 링크', '참고링크', '링크', 'link'], 5);
  const colStatus = findCol(['상태', 'status'], 6);

  const validItems = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length === 0) continue;

    const status = String(r[colStatus] || '').trim();
    // 상태 열이 '숨김' 또는 '삭제'인 행은 제외
    if (status === '숨김' || status === '삭제') continue;

    const title = String(r[colTitle] || '').trim();
    const content = String(r[colContent] || '').trim();
    const author = String(r[colAuthor] || '').trim() || '익명';
    const rawTs = String(r[colTimestamp] || '').trim();
    const rawLink = String(r[colLink] || '').trim();

    if (!title && !content) continue;

    const { timeValue, displayDate } = parseSheetTimestamp(rawTs, i);

    validItems.push({
      id: `sheet-post-${i}`,
      title: title || '(제목 없음)',
      content,
      author,
      date: displayDate,
      timeValue,
      rowOrder: i,
      linkUrl: normalizeUrl(rawLink)
    });
  }

  // 타임스탬프 오름차순(오래된 글 -> 최신 글)으로 먼저 정렬하여 1번부터 번호 부여
  validItems.sort((a, b) => {
    if (a.timeValue !== b.timeValue) return a.timeValue - b.timeValue;
    return a.rowOrder - b.rowOrder;
  });

  validItems.forEach((item, idx) => {
    item.boardNumber = idx + 1;
  });

  // 최신 글(가장 큰 번호)이 맨 위에 오도록 내림차순 정렬
  validItems.sort((a, b) => b.boardNumber - a.boardNumber);

  return validItems;
}

async function fetchBoardPostsFromSheet() {
  try {
    const cleanCsvUrl = String(CONFIGURED_BOARD_CSV_URL || '').trim();
    if (!cleanCsvUrl || !/^https?:\/\//i.test(cleanCsvUrl)) {
      isBoardLoading = false;
      if (currentMainView === 'tips') renderTipsBoard();
      return;
    }

    isBoardLoading = true;
    if (currentMainView === 'tips') {
      renderTipsBoard();
    }

    const sep = cleanCsvUrl.includes('?') ? '&' : '?';
    const liveCsvUrl = `${cleanCsvUrl}${sep}t=${Date.now()}`;

    const isLocalServer =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    let csvText = '';

    // 1순위: 구글 시트 웹 게시 CSV URL 직접 호출
    try {
      const res = await fetch(liveCsvUrl, { cache: 'no-store' });
      if (res.ok) {
        csvText = await res.text();
      }
    } catch (err) {}

    // 2순위: 로컬 서버 프록시 (/api/board-csv)
    if (!csvText && isLocalServer) {
      try {
        const res = await fetch(`./api/board-csv?t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          csvText = await res.text();
        }
      } catch (err) {}
    }

    // 3순위: 공개 CORS 프록시 폴백
    if (!csvText) {
      try {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(liveCsvUrl)}`;
        const res = await fetch(proxyUrl, { cache: 'no-store' });
        if (res.ok) {
          csvText = await res.text();
        }
      } catch (err) {}
    }

    isBoardLoading = false;
    if (csvText) {
      tipsPosts = parseBoardCsvToPosts(csvText);
      updateFooterLastUpdated(true);
    }

    if (currentMainView === 'tips') {
      renderTipsBoard();
    }
  } catch (outerErr) {
    isBoardLoading = false;
    if (currentMainView === 'tips') {
      renderTipsBoard();
    }
  }
}

function switchMainView(viewName) {
  const validViews = ['gallery', 'competitions', 'competition-detail', 'winners', 'tips'];
  currentMainView = validViews.includes(viewName) ? viewName : 'gallery';

  const galleryContainer = document.getElementById('galleryViewContainer');
  const compsArchiveView = document.getElementById('competitionsArchiveView');
  const compDetailView = document.getElementById('competitionDetailView');
  const winnersView = document.getElementById('winnersHallView');
  const tipsView = document.getElementById('tipsBoardView');
  const folderTabs = document.getElementById('folderCategoryTabs');

  const btnGallery = document.getElementById('navViewGallery');
  const btnComps = document.getElementById('navViewCompetitions');
  const btnWinners = document.getElementById('navViewWinners');
  const btnTips = document.getElementById('navViewTips');
  const searchInput = document.getElementById('searchInput');

  if (galleryContainer) galleryContainer.classList.toggle('hidden', currentMainView !== 'gallery');
  if (folderTabs) folderTabs.classList.toggle('hidden', currentMainView !== 'gallery');
  if (compsArchiveView) compsArchiveView.classList.toggle('hidden', currentMainView !== 'competitions');
  if (compDetailView) compDetailView.classList.toggle('hidden', currentMainView !== 'competition-detail');
  if (winnersView) winnersView.classList.toggle('hidden', currentMainView !== 'winners');
  if (tipsView) tipsView.classList.toggle('hidden', currentMainView !== 'tips');

  if (btnGallery) btnGallery.classList.toggle('active', currentMainView === 'gallery');
  if (btnComps) btnComps.classList.toggle('active', currentMainView === 'competitions' || currentMainView === 'competition-detail');
  if (btnWinners) btnWinners.classList.toggle('active', currentMainView === 'winners');
  if (btnTips) btnTips.classList.toggle('active', currentMainView === 'tips');

  if (currentMainView === 'tips') {
    if (searchInput) searchInput.placeholder = '제목, 내용, 작성자 검색...';
    renderTipsBoard();
  } else if (currentMainView === 'competitions') {
    if (searchInput) searchInput.placeholder = '공모전명, 연도, 참여 작가 검색...';
    renderCompetitionsArchiveView();
  } else if (currentMainView === 'competition-detail') {
    if (searchInput) searchInput.placeholder = '작품, 작가, 카메라 검색...';
    renderCompetitionDetailView(selectedCompetitionId);
  } else if (currentMainView === 'winners') {
    if (searchInput) searchInput.placeholder = '수상작 제목, 작가, 카메라 검색...';
    renderWinnersHallView();
  } else {
    if (searchInput) searchInput.placeholder = '작품, 작가, 카메라 검색...';
    renderOngoingHeroShowcase();
    applyFiltersAndRender();
  }
}

function renderTipsBoard() {
  const grid = document.getElementById('tipsCardGrid');
  if (!grid) return;

  if (isBoardLoading && tipsPosts.length === 0) {
    grid.innerHTML = `
      <div style="text-align: center; padding: 64px 20px; color: var(--text-secondary); border-bottom: 1px solid var(--glass-border);">
        게시글 목록을 불러오는 중입니다...
      </div>
    `;
    return;
  }

  const q = searchQuery.toLowerCase();
  const filtered = tipsPosts.filter(post => {
    if (!q) return true;
    const text = `${post.title} ${post.content} ${post.author}`.toLowerCase();
    return text.includes(q);
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="text-align: center; padding: 64px 20px; color: var(--text-secondary); border-bottom: 1px solid var(--glass-border);">
        등록된 게시글이 없습니다.
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map((post) => {
    return `
      <div class="board-row" data-tip-id="${escapeHtml(post.id)}" tabindex="0" role="listitem" aria-label="${escapeHtml(post.title)} 상세 보기">
        <span class="col-num">${post.boardNumber}</span>
        <div class="col-title">
          <span class="board-row-title-text">${escapeHtml(post.title)}</span>
        </div>
        <div class="board-mobile-meta">
          <span class="col-author">${escapeHtml(post.author)}</span>
          <span class="col-date">${escapeHtml(post.date)}</span>
        </div>
      </div>
    `;
  }).join('');

  grid.querySelectorAll('.board-row').forEach(row => {
    const openPost = () => openTipDetailModal(row.getAttribute('data-tip-id'));
    row.addEventListener('click', openPost);
    row.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openPost();
      }
    });
  });
}

function openTipDetailModal(postId) {
  const post = tipsPosts.find(p => p.id === postId);
  if (!post) return;

  activeTipPostId = postId;
  document.getElementById('tipDetailTitle').textContent = post.title;
  document.getElementById('tipDetailMeta').textContent = `${post.author} · ${post.date}`;
  document.getElementById('tipDetailBody').textContent = post.content;

  const linkWrap = document.getElementById('tipDetailLinkWrap');
  const linkEl = document.getElementById('tipDetailLink');
  if (post.linkUrl && post.linkUrl.trim()) {
    linkEl.href = post.linkUrl;
    linkWrap.classList.remove('hidden');
  } else {
    linkWrap.classList.add('hidden');
  }

  document.getElementById('tipDetailModalBackdrop').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeTipDetailModal() {
  activeTipPostId = null;
  document.getElementById('tipDetailModalBackdrop').classList.add('hidden');
  document.body.style.overflow = '';
}

function openTipWriteModal() {
  const formUrl = String(CONFIGURED_BOARD_FORM_URL || '').trim();
  if (formUrl) {
    window.open(formUrl, '_blank', 'noopener,noreferrer');
    return;
  }
  document.getElementById('tipWriteModalBackdrop').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeTipWriteModal() {
  document.getElementById('tipWriteModalBackdrop').classList.add('hidden');
  document.body.style.overflow = '';
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', () => {
  applyLocaleTexts();
  try {
    initWebGLBackground();
  } catch (e) {}
  setupLightboxTouchGestures();
  loadDriveFolder(CONFIGURED_FOLDER_URL, false);

  const isLocalHost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  // 게시판 메뉴는 수정 중이므로 로컬(localhost/127.0.0.1)에서만 표시하고 외부 배포에서는 숨김
  const navTipsBtn = document.getElementById('navViewTips');
  if (navTipsBtn) {
    if (isLocalHost) {
      navTipsBtn.classList.remove('hidden');
      fetchBoardPostsFromSheet();
    } else {
      navTipsBtn.classList.add('hidden');
    }
  }

  // 스크롤 시 상단 공지 배너 슬림 축소 애니메이션 (scrollY > 40px)
  window.addEventListener('scroll', () => {
    const banner = document.getElementById('ongoingBanner');
    if (!banner || banner.classList.contains('hidden')) return;
    if (window.scrollY > 40) {
      banner.classList.add('is-compact');
    } else {
      banner.classList.remove('is-compact');
    }
  }, { passive: true });

  // 상단 메인 섹션 전환 메뉴 (갤러리 / 공모전 아카이브 / 역대 수상작 / 로컬 전용 게시판)
  document.getElementById('navViewGallery')?.addEventListener('click', () => switchMainView('gallery'));
  document.getElementById('navViewCompetitions')?.addEventListener('click', () => switchMainView('competitions'));
  document.getElementById('navViewWinners')?.addEventListener('click', () => switchMainView('winners'));
  document.getElementById('btnBackToArchive')?.addEventListener('click', () => switchMainView('competitions'));
  if (navTipsBtn) {
    navTipsBtn.addEventListener('click', () => switchMainView('tips'));
  }

  // 게시판 상세 모달 닫기 이벤트
  const tipDetailBackdrop = document.getElementById('tipDetailModalBackdrop');
  const tipDetailDialog = document.getElementById('tipDetailDialog');
  document.getElementById('btnCloseTipDetailTop')?.addEventListener('click', closeTipDetailModal);
  document.getElementById('btnCloseTipDetailBottom')?.addEventListener('click', closeTipDetailModal);
  tipDetailDialog?.addEventListener('click', e => e.stopPropagation());
  tipDetailBackdrop?.addEventListener('click', e => {
    if (e.target === tipDetailBackdrop) closeTipDetailModal();
  });

  // 게시판 작성 안내 모달 이벤트
  const tipWriteBackdrop = document.getElementById('tipWriteModalBackdrop');
  const tipWriteDialog = document.getElementById('tipWriteDialog');
  document.getElementById('btnOpenTipWrite')?.addEventListener('click', openTipWriteModal);
  document.getElementById('btnCloseTipWriteTop')?.addEventListener('click', closeTipWriteModal);
  document.getElementById('btnCancelTipWrite')?.addEventListener('click', closeTipWriteModal);
  tipWriteDialog?.addEventListener('click', e => e.stopPropagation());
  tipWriteBackdrop?.addEventListener('click', e => {
    if (e.target === tipWriteBackdrop) closeTipWriteModal();
  });

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
      if (currentMainView === 'tips') {
        renderTipsBoard();
      } else if (currentMainView === 'competitions') {
        renderCompetitionsArchiveView();
      } else if (currentMainView === 'winners') {
        renderWinnersHallView();
      } else {
        renderOngoingHeroShowcase();
        applyFiltersAndRender();
      }
    });
  }

  // 상단 슬림 공지 배너 클릭 -> 해당 [진행중] 폴더 탭 필터링 및 스크롤
  document.getElementById('btnOngoingBanner').addEventListener('click', () => {
    if (currentOngoingFolder) {
      navigateToOngoingFolder(currentOngoingFolder);
    }
  });

  // 화면 중앙 모달 팝업 닫기 동작 연결 (상단 X 버튼, 하단 닫기 버튼, 배경 오버레이 클릭, ESC 키)
  const btnOngoingViewNow = document.getElementById('btnOngoingViewNow');
  const btnOngoingClose = document.getElementById('btnOngoingClose');
  const btnOngoingCloseTop = document.getElementById('btnOngoingCloseTop');
  const ongoingModalBackdrop = document.getElementById('ongoingModalBackdrop');
  const ongoingPopupCard = document.getElementById('ongoingPopup');

  if (btnOngoingViewNow) {
    btnOngoingViewNow.addEventListener('click', (e) => {
      e.stopPropagation();
      dismissOngoingPopup();
      if (currentOngoingFolder) {
        navigateToOngoingFolder(currentOngoingFolder);
      }
    });
  }

  if (btnOngoingClose) {
    btnOngoingClose.addEventListener('click', (e) => {
      e.stopPropagation();
      dismissOngoingPopup();
    });
  }

  if (btnOngoingCloseTop) {
    btnOngoingCloseTop.addEventListener('click', (e) => {
      e.stopPropagation();
      dismissOngoingPopup();
    });
  }

  if (ongoingPopupCard) {
    ongoingPopupCard.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  if (ongoingModalBackdrop) {
    ongoingModalBackdrop.addEventListener('click', (e) => {
      if (e.target === ongoingModalBackdrop) {
        dismissOngoingPopup();
      }
    });
  }

  // 새로고침(↻) 버튼: 캐시 무시하고 구글 드라이브 최신 폴더명/파일명 및 구글 시트 게시글 즉시 반영
  document.getElementById('btnRefreshGallery').addEventListener('click', () => {
    loadDriveFolder(CONFIGURED_FOLDER_URL, true);
    fetchBoardPostsFromSheet();
  });

  // 다크 / 라이트 테마 토글
  document.getElementById('btnThemeToggle').addEventListener('click', () => {
    const html = document.documentElement;
    const isLight = html.getAttribute('data-theme') === 'light';
    const next = isLight ? 'dark' : 'light';
    html.setAttribute('data-theme', next);
    targetThemeValue = next === 'light' ? 1.0 : 0.0;

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
    const tipDetailBackdrop = document.getElementById('tipDetailModalBackdrop');
    if (e.key === 'Escape' && tipDetailBackdrop && !tipDetailBackdrop.classList.contains('hidden')) {
      closeTipDetailModal();
      return;
    }
    const tipWriteBackdrop = document.getElementById('tipWriteModalBackdrop');
    if (e.key === 'Escape' && tipWriteBackdrop && !tipWriteBackdrop.classList.contains('hidden')) {
      closeTipWriteModal();
      return;
    }
    const modal = document.getElementById('lightboxModal');
    if (modal.classList.contains('hidden')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrevPhoto();
    if (e.key === 'ArrowRight') showNextPhoto();
  });
});
