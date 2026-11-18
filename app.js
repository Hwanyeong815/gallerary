// config.js에서 설정된 GOOGLE_DRIVE_FOLDER_URL 사용
const CONFIGURED_FOLDER_URL =
  (typeof window !== 'undefined' && window.GOOGLE_DRIVE_FOLDER_URL) ||
  'https://drive.google.com/drive/folders/1o3QBRz4f87QC9L-c2wuBADjgb28uUMmw?usp=sharing';

let allPhotos = [];
let folderCategories = [];
let selectedSubfolderId = 'ALL';
let selectedAuthor = 'ALL';
let currentOngoingFolder = null;
let ongoingModalDismissedOnThisLoad = false;
let filteredPhotos = [];
let activePhotoIndex = 0;
let revealObserver = null;
let currentThemeValue = 0.0;
let targetThemeValue = 0.0;
let toastTimer = null;

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
  selectedSubfolderId = folder.id;
  selectedAuthor = 'ALL';
  renderFolderTabs();
  renderAuthorFilter();
  applyFiltersAndRender();

  const gridEl = document.getElementById('photoGrid');
  if (gridEl) {
    gridEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function dismissOngoingPopup() {
  const backdrop = document.getElementById('ongoingModalBackdrop');
  if (!backdrop) return;

  ongoingModalDismissedOnThisLoad = true;
  backdrop.classList.remove('is-visible');
  setTimeout(() => {
    if (!backdrop.classList.contains('is-visible')) {
      backdrop.classList.add('hidden');
    }
  }, 400);
}

function updateOngoingNoticeUI() {
  const banner = document.getElementById('ongoingBanner');
  const bannerText = document.getElementById('ongoingBannerText');
  const backdrop = document.getElementById('ongoingModalBackdrop');
  const popupTitle = document.getElementById('ongoingPopupTitle');

  const ongoingFolder = folderCategories.find(f => isOngoingFolder(f.name)) || null;
  currentOngoingFolder = ongoingFolder;

  if (!ongoingFolder) {
    if (banner) banner.classList.add('hidden');
    if (backdrop) {
      backdrop.classList.remove('is-visible');
      backdrop.classList.add('hidden');
    }
    return;
  }

  const cleanName = cleanOngoingFolderName(ongoingFolder.name);

  if (banner && bannerText) {
    bannerText.innerHTML = `현재 <strong>[${escapeHtml(cleanName)}]</strong> 진행 중입니다 ·`;
    banner.classList.remove('hidden');
  }

  if (backdrop && popupTitle) {
    if (!ongoingModalDismissedOnThisLoad) {
      popupTitle.textContent = `현재 ${cleanName} 진행 중입니다`;
      backdrop.classList.remove('hidden');
      requestAnimationFrame(() => {
        backdrop.classList.add('is-visible');
      });
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

// 파일명에 1등, 우승, 대상, 최우수 키워드 중 하나라도 포함되어 있는지 감지 (대괄호 무관)
function isFirstPrize(filename) {
  return /(?:\[\s*(?:1등|우승|대상|최우수(?:상)?)\s*\]|(?:^|[_\s-])(?:1등|우승|대상|최우수(?:상)?)(?:$|[_\s-]))/i.test(
    stripExtension(filename)
  );
}

// 화면 표시 및 파싱을 위해 [1등], 1등, [우승], 우승, [대상], 대상, [최우수], 최우수 키워드와 앞뒤 언더바/공백을 완전히 제거
function removeAwardKeywords(filename) {
  let s = stripExtension(filename);
  s = s.replace(/\[\s*(?:1등|우승|대상|최우수(?:상)?)\s*\]/gi, '');
  s = s.replace(/(?:^|[_\s-]+)(?:1등|우승|대상|최우수(?:상)?)(?=$|[_\s-]+)/gi, '');
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

// 순수 작품 제목 추출 (언더바 뒤 작품 제목 부분만 추출 + 끝의 중복 (1), (2) 제거)
function extractWorkTitleOnly(filename) {
  const cleaned = removeAwardAndLeadingNumber(filename);
  const underscoreIdx = cleaned.indexOf('_');
  let titlePart = cleaned;
  if (underscoreIdx > 0) {
    titlePart = cleaned.slice(underscoreIdx + 1).replace(/^[_-\s]+/, '').trim() || cleaned;
  }
  return cleanDuplicateTrailingNumber(titlePart);
}

// 진행중 폴더 내 사진들을 정렬 기준(번호 오름차순 -> 업로드/원본 순서 오름차순)으로 정렬하고 고정 번호(1번, 2번...) 부여
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
    if (ongoing) {
      group.sort((a, b) => {
        const numA = extractExplicitOrderNumber(a.name);
        const numB = extractExplicitOrderNumber(b.name);
        if (numA !== null && numB !== null && numA !== numB) {
          return numA - numB;
        }
        if (numA !== null && numB === null) return -1;
        if (numA === null && numB !== null) return 1;
        return (a._originalIdx || 0) - (b._originalIdx || 0);
      });
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

// 사진 객체별로 화면에 표시할 제목과 작가명 반환 (진행중 폴더는 '1번 작품제목' + 'by 익명' 일관 유지)
function getDisplayMeta(photo) {
  const inOngoing = isOngoingFolder(photo.folderName);
  const rawAuthor = extractAuthorFromFilename(photo.name);
  const workTitleOnly = extractWorkTitleOnly(photo.name);
  const fullCleanTitle = cleanDuplicateTrailingNumber(removeAwardAndLeadingNumber(photo.name));

  if (inOngoing) {
    const numPrefix = photo.contestNumber ? `${photo.contestNumber}번 ` : '';
    return {
      title: `${numPrefix}${workTitleOnly}`,
      authorLabel: 'by 익명',
      isAnonymous: true
    };
  }

  return {
    title: fullCleanTitle,
    authorLabel: rawAuthor ? `by ${rawAuthor}` : '',
    isAnonymous: false
  };
}

// 상단 작가 필터 렌더링 (역추적 방지: 진행중 폴더에 속한 사진은 작가 집계 및 필터에서 완전히 제외!)
function renderAuthorFilter() {
  const menu = document.getElementById('authorDropdownMenu');
  const label = document.getElementById('authorFilterLabel');
  const btn = document.getElementById('btnAuthorFilter');
  if (!menu || !label || !btn) return;

  // 역추적 방지: 진행중(isOngoingFolder)이 아닌 일반 마감 폴더의 사진들에서만 작가명을 추출
  const authorCounts = new Map();
  let publicPhotoCount = 0;

  allPhotos.forEach(p => {
    if (isOngoingFolder(p.folderName)) return; // 진행중 폴더 사진은 작가 필터 집계에서 제외
    publicPhotoCount++;
    const author = extractAuthorFromFilename(p.name);
    if (author) {
      authorCounts.set(author, (authorCounts.get(author) || 0) + 1);
    }
  });

  const authors = Array.from(authorCounts.keys());

  if (selectedAuthor !== 'ALL' && !authorCounts.has(selectedAuthor)) {
    selectedAuthor = 'ALL';
  }

  label.textContent = selectedAuthor === 'ALL' ? '전체 작가' : selectedAuthor;
  btn.classList.toggle('has-filter', selectedAuthor !== 'ALL');

  let html = `
    <button type="button" class="author-option-btn ${selectedAuthor === 'ALL' ? 'active' : ''}" data-author="ALL" role="option" aria-selected="${selectedAuthor === 'ALL'}">
      <span>전체 작가</span>
      <span class="author-option-count">${allPhotos.length}</span>
    </button>
  `;

  authors.forEach(author => {
    const count = authorCounts.get(author) || 0;
    const isSelected = selectedAuthor === author;
    html += `
      <button type="button" class="author-option-btn ${isSelected ? 'active' : ''}" data-author="${escapeHtml(author)}" role="option" aria-selected="${isSelected}">
        <span>${escapeHtml(author)}</span>
        <span class="author-option-count">${count}</span>
      </button>
    `;
  });

  menu.innerHTML = html;

  menu.querySelectorAll('.author-option-btn').forEach(optBtn => {
    optBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      selectedAuthor = optBtn.getAttribute('data-author');
      closeAuthorDropdown();
      renderAuthorFilter();
      applyFiltersAndRender();
    });
  });
}

function toggleAuthorDropdown() {
  const wrap = document.getElementById('authorFilterWrap');
  const menu = document.getElementById('authorDropdownMenu');
  const btn = document.getElementById('btnAuthorFilter');
  if (!wrap || !menu || !btn) return;

  const isOpen = !menu.classList.contains('hidden');
  if (isOpen) {
    closeAuthorDropdown();
  } else {
    menu.classList.remove('hidden');
    wrap.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
  }
}

function closeAuthorDropdown() {
  const wrap = document.getElementById('authorFilterWrap');
  const menu = document.getElementById('authorDropdownMenu');
  const btn = document.getElementById('btnAuthorFilter');
  if (!wrap || !menu || !btn) return;

  menu.classList.add('hidden');
  wrap.classList.remove('is-open');
  btn.setAttribute('aria-expanded', 'false');
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

    if (href.includes('/folders/') || chunk.includes('drive/folders/')) {
      subfolders.push({ id, name });
    } else if (!isNonImageFile(name)) {
      files.push({ id, name });
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
      All<span class="folder-tab-count">${allPhotos.length}</span>
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
      applyFiltersAndRender();
    });
  });
}

function applyFiltersAndRender() {
  const matched = allPhotos.filter(p => {
    const matchFolder = selectedSubfolderId === 'ALL' || p.folderId === selectedSubfolderId;
    if (!matchFolder) return false;

    if (selectedAuthor === 'ALL') return true;

    // 역추적 방지: 특정 작가 필터가 선택된 경우, 진행중(블라인드) 폴더의 작품은 절대 노출하지 않음
    if (isOngoingFolder(p.folderName)) return false;
    return extractAuthorFromFilename(p.name) === selectedAuthor;
  });

  // 1등 수상작 우선 배치 + 진행중 폴더 작품은 부여된 번호(1번, 2번...) 오름차순 유지
  filteredPhotos = [...matched].sort((a, b) => {
    const aWin = isFirstPrize(a.name) ? 1 : 0;
    const bWin = isFirstPrize(b.name) ? 1 : 0;
    if (aWin !== bWin) return bWin - aWin;

    if (a.folderId === b.folderId && a.contestNumber && b.contestNumber) {
      return a.contestNumber - b.contestNumber;
    }
    return 0;
  });

  const badge = document.getElementById('photoCountBadge');
  if (badge) {
    const activeFolder = folderCategories.find(f => f.id === selectedSubfolderId);
    const cleanFolder = activeFolder ? cleanOngoingFolderName(activeFolder.name) : '';
    const parts = [];
    if (cleanFolder) parts.push(cleanFolder);
    if (selectedAuthor !== 'ALL') parts.push(`${selectedAuthor} 작가`);
    const prefix = parts.length > 0 ? `${parts.join(' · ')} · ` : '';
    badge.textContent = `${prefix}${filteredPhotos.length}장의 사진`;
  }

  renderPhotoGrid(filteredPhotos);
}

async function loadDriveFolder(folderInput, forceLive = false) {
  const folderId = extractFolderId(folderInput);
  const badge = document.getElementById('photoCountBadge');
  const statusBanner = document.getElementById('statusBanner');
  const refreshBtn = document.getElementById('btnRefreshGallery');

  statusBanner.classList.add('hidden');
  badge.textContent = forceLive ? '최신 목록 동기화 중...' : '컬렉션 동기화 중...';

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

    if (isLocalServer) {
      try {
        const res = await fetch(`./api/folder?id=${encodeURIComponent(folderId)}&t=${Date.now()}`, {
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

    if (photos.length === 0 && !forceLive) {
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
    renderAuthorFilter();
    updateOngoingNoticeUI();

    if (photos.length === 0) {
      document.getElementById('photoGrid').innerHTML = '';
      badge.textContent = '0장의 사진';
      statusBanner.textContent = '폴더에서 사진을 불러오지 못했습니다. config.js의 드라이브 폴더 공유 권한이 "링크가 있는 모든 사용자"인지 확인해 주세요.';
      statusBanner.classList.remove('hidden');
      return;
    }

    applyFiltersAndRender();

    if (forceLive) {
      showAppleToast('최신 목록으로 업데이트되었습니다');
    }
  } catch (err) {
    badge.textContent = '연결 오류';
    statusBanner.textContent = `오류가 발생했습니다: ${err.message}`;
    statusBanner.classList.remove('hidden');
  } finally {
    if (refreshBtn) {
      refreshBtn.classList.remove('is-spinning');
    }
  }
}

/* ==========================================================================
   6. 사진 그리드 렌더링 & 라이트박스 (모바일 터치 스와이프/드래그 닫기 제스처 포함)
   ========================================================================== */
function renderPhotoGrid(photos) {
  const grid = document.getElementById('photoGrid');
  setupScrollRevealObserver();

  grid.innerHTML = photos.map((photo, idx) => {
    const winner = isFirstPrize(photo.name);
    const meta = getDisplayMeta(photo);
    const rawFolder = photo.folderName && photo.folderName !== '기본 폴더' ? photo.folderName : '';
    const folderLabel = rawFolder ? cleanOngoingFolderName(rawFolder) : '';

    return `
      <article
        class="photo-card ${winner ? 'is-winner' : ''}"
        data-index="${idx}"
        tabindex="0"
        role="button"
        aria-label="${escapeHtml(meta.title)} 크게 보기"
        style="transition-delay: ${Math.min(idx * 45, 270)}ms"
      >
        <div class="card-glare" aria-hidden="true"></div>
        <div class="photo-media-wrap">
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
              </div>
              <h3 class="caption-title">${escapeHtml(meta.title)}</h3>
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
  }).join('');

  grid.querySelectorAll('.photo-card').forEach(card => {
    const img = card.querySelector('.photo-thumb');
    const idx = Number(card.getAttribute('data-index'));

    revealObserver.observe(card);
    setTimeout(() => {
      card.style.transitionDelay = '0ms';
    }, 650);

    attachAppleCardInteractions(card);

    const markLoaded = () => card.classList.add('loaded');
    if (img.complete && img.naturalWidth > 0) {
      markLoaded();
    } else {
      img.addEventListener('load', markLoaded);
      img.addEventListener('error', () => {
        const photo = photos[idx];
        const fallbackUrl = `https://lh3.googleusercontent.com/d/${photo.id}=w1000`;
        if (img.src !== fallbackUrl) {
          img.src = fallbackUrl;
        } else {
          markLoaded();
        }
      });
    }

    card.addEventListener('click', () => openLightbox(idx));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(idx);
      }
    });
  });
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
  const resText = document.getElementById('lightboxResolution');
  const ambientBg = document.getElementById('lightboxAmbientBg');

  img.setAttribute('referrerpolicy', 'no-referrer');

  counter.textContent = `${activePhotoIndex + 1} / ${filteredPhotos.length}`;
  title.textContent = meta.title;

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

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', () => {
  initWebGLBackground();
  setupLightboxTouchGestures();
  loadDriveFolder(CONFIGURED_FOLDER_URL, false);

  document.getElementById('btnResetFilter').addEventListener('click', (e) => {
    e.preventDefault();
    selectedSubfolderId = 'ALL';
    selectedAuthor = 'ALL';
    renderFolderTabs();
    renderAuthorFilter();
    applyFiltersAndRender();
  });

  // 상단 작가 필터 드롭다운 토글 및 외부 클릭 시 닫기
  document.getElementById('btnAuthorFilter').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleAuthorDropdown();
  });

  document.addEventListener('click', (e) => {
    const wrap = document.getElementById('authorFilterWrap');
    if (wrap && !wrap.contains(e.target)) {
      closeAuthorDropdown();
    }
  });

  // 상단 슬림 공지 배너 클릭 -> 해당 [진행중] 폴더 탭 필터링 및 스크롤
  document.getElementById('btnOngoingBanner').addEventListener('click', () => {
    if (currentOngoingFolder) {
      navigateToOngoingFolder(currentOngoingFolder);
    }
  });

  // 화면 중앙 모달 팝업 -> [작품 보러가기] / [닫기] 버튼 직접 클릭 시에만 닫힘
  document.getElementById('btnOngoingViewNow').addEventListener('click', () => {
    if (currentOngoingFolder) {
      navigateToOngoingFolder(currentOngoingFolder);
    }
    dismissOngoingPopup();
  });

  document.getElementById('btnOngoingClose').addEventListener('click', () => {
    dismissOngoingPopup();
  });

  // 새로고침(↻) 버튼: 캐시 무시하고 구글 드라이브 최신 폴더명/파일명 즉시 반영
  document.getElementById('btnRefreshGallery').addEventListener('click', () => {
    loadDriveFolder(CONFIGURED_FOLDER_URL, true);
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
    const modal = document.getElementById('lightboxModal');
    if (modal.classList.contains('hidden')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrevPhoto();
    if (e.key === 'ArrowRight') showNextPhoto();
  });
});
