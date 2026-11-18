// config.js에서 설정된 GOOGLE_DRIVE_FOLDER_URL 사용
const CONFIGURED_FOLDER_URL =
  (typeof window !== 'undefined' && window.GOOGLE_DRIVE_FOLDER_URL) ||
  'https://drive.google.com/drive/folders/1o3QBRz4f87QC9L-c2wuBADjgb28uUMmw?usp=sharing';

// 사용자 브라우저 언어(Locale) 기반 다국어(i18n) 매핑 (한국어 기본, 해외 접속 시 영문 전환)
const IS_KOREAN = typeof navigator !== 'undefined'
  ? String(navigator.language || 'ko').toLowerCase().startsWith('ko')
  : true;

const I18N = {
  allTab: IS_KOREAN ? '전체' : 'ALL',
  liveBadge: IS_KOREAN ? '진행중' : 'LIVE',
  heroEyebrow: IS_KOREAN ? '전시 아카이브' : 'ARCHIVE',
  firstPrizeBadge: IS_KOREAN ? '1등' : '1ST',
  footerLeft: IS_KOREAN ? '각자의 프레임 — 사진 아카이브' : 'Gallery Archive',
  footerRight: IS_KOREAN ? '구글 드라이브 실시간 연동 갤러리' : 'Synchronized with Google Drive'
};

function applyLocaleTexts() {
  const eyebrow = document.getElementById('heroEyebrow');
  const liveBadgeText = document.getElementById('ongoingLiveBadgeText');
  const footerLeft = document.getElementById('footerLeftText');
  const footerRight = document.getElementById('footerRightText');

  if (eyebrow) eyebrow.textContent = I18N.heroEyebrow;
  if (liveBadgeText) liveBadgeText.textContent = I18N.liveBadge;
  if (footerLeft) footerLeft.textContent = I18N.footerLeft;
  if (footerRight) footerRight.textContent = I18N.footerRight;
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

// 메인 섹션 전환 및 정보·꿀팁 게시판 상태
const STORAGE_KEY_TIPS = 'gallery_archive_tips_posts_v2';
let currentMainView = 'gallery'; // 'gallery' | 'tips'
let selectedTipCategory = 'ALL';
let activeTipPostId = null;

const DEFAULT_TIPS_POSTS = [
  {
    id: 'tip-lunar-sea',
    category: '기타',
    title: '부천 달의바다 현상소 | C-41 무료 현상·스캔 베타테스터 모집',
    content: `부천 달의바다 현상소에서 다음 주부터 35mm 컬러 네거티브 필름 현상·스캔 테스트를 진행합니다. 코닥 컬러 현상 약품의 성능이 어느 시점부터 떨어지는지 확인하고, AGO 프로세서의 처리 속도를 측정하기 위한 테스트입니다.

- 모집 수량: 총 50롤
- 대상 필름: 35mm C-41 컬러 네거티브 필름
- 현상: AGO 프로세서 + 코닥 컬러 현상 약품
- 스캔: 노리츠 자동 모드
- 비용: 현상·스캔 무료 / 필름 원본 회수 시 3,000원

필름이 5롤 모일 때마다 현상하므로 결과를 받아보기까지 시간이 걸릴 수 있습니다. 약품의 성능을 확인하는 테스트인 만큼 스캔 결과의 색이 평소와 다를 수 있습니다. 가능하면 유효기간이 지나지 않은 신선한 필름으로 참여해 주세요.

총 50롤의 테스트가 끝나면 이벤트를 종료합니다.

달의바다 현상소
경기 부천시 원미구 장말로 173 지층`,
    author: '데이/부산/FE2',
    date: '2026.11.19',
    imageUrl: '',
    linkUrl: ''
  },
  {
    id: 'tip-1',
    category: '촬영팁',
    title: '야간 장노출 촬영 시 빛 갈라짐과 노이즈를 동시에 잡는 조리개 세팅법',
    content: `야경 촬영에서 가로등이나 교량의 조명을 깔끔한 빛 갈라짐(Sunburst)으로 표현하려면 조리개를 f/8에서 f/11 사이로 조여주는 것이 가장 이상적입니다.\n\n조리개를 f/16 이상 과도하게 조이면 회절 현상(Diffraction)으로 인해 오히려 전체적인 해상력이 저하될 수 있습니다. ISO는 베이스 감도(ISO 64~100)로 고정하고, 삼각대 위에서 손떨림 방지(IBIS) 기능을 오프(OFF)한 뒤 2초 셀프 타이머나 릴리즈를 사용해 미세 진동을 차단해 보세요.\n\n하이라이트 클리핑을 방지하기 위해 노출 보정을 -0.7 EV 정도로 약간 언더로 촬영한 뒤 암부를 복원하면 훨씬 깊이 있는 밤하늘 계조를 얻을 수 있습니다.`,
    author: '웰컴',
    date: '2026.11.15',
    imageUrl: 'https://drive.google.com/thumbnail?id=1wCeT3U1kWUsxkzATavQMImhhXDCMfmsm&sz=w1200',
    linkUrl: 'https://www.sony.co.kr'
  },
  {
    id: 'tip-2',
    category: '보정팁',
    title: '라이트룸에서 필름 그레인과 무채색 모노크롬 톤 커브 만드는 3단계 공식',
    content: `디지털 원본 사진을 깊이 있는 흑백(Monochrome) 아카이브 톤으로 전환할 때는 단순히 채도를 빼는 것보다 포인트 커브(Tone Curve)의 양 끝단을 제어하는 것이 핵심입니다.\n\n1단계: 톤 커브의 가장 왼쪽 아래 블랙 포인트를 살짝 위로 들어 올려(Output 8~12) 순수 블랙을 매트한 다크 차콜로 부드럽게 눌러줍니다.\n2단계: 색상 혼합(B&W Mix) 패널에서 블루 채널의 명도를 -20 낮춰 하늘과 그림자의 무게감을 살리고, 오렌지/옐로우 채널을 +15 올려 인물이나 피사체의 하이라이트를 분리합니다.\n3단계: 효과(Effects) 탭에서 입자(Grain) 크기를 25, 거칠기를 40 내외로 추가하면 클래식 인화지 같은 질감이 완성됩니다.`,
    author: '마오',
    date: '2026.11.14',
    imageUrl: 'https://drive.google.com/thumbnail?id=1mpH4TEr5tgpA6PV2F4qwV5jI3q0ROn4M&sz=w1200',
    linkUrl: ''
  },
  {
    id: 'tip-3',
    category: '장비·소품',
    title: '겨울철 영하의 설경 출사 시 배터리 방전 방지와 결로 현상 대처 노하우',
    content: `기온이 영하로 떨어지는 겨울철 새벽 출사에서는 리튬이온 배터리의 전압 강하가 급격히 일어납니다. 여분의 배터리는 반드시 외투 안주머니나 핫팩과 가까운 파우치에 보관해 온도를 유지해 주세요.\n\n가장 주의해야 할 점은 추운 야외에서 촬영을 마치고 따뜻한 실내나 차량으로 바로 들어올 때 발생하는 '결로 현상'입니다. 카메라와 렌즈 표면에 물방울이 맺히면 내부 회로 손상이나 렌즈 곰팡이의 원인이 됩니다.\n\n실내에 들어오기 전 야외에서 미리 지퍼백에 카메라를 넣고 밀봉한 뒤, 실내 온도에 30분 이상 천천히 적응시키면 온도 차로 인한 습기가 지퍼백 겉면에만 맺혀 장비를 안전하게 보호할 수 있습니다.`,
    author: '아카이브큐레이터',
    date: '2026.11.12',
    imageUrl: '',
    linkUrl: ''
  },
  {
    id: 'tip-4',
    category: '촬영팁',
    title: '역광 인물 및 겨울 풍경 스냅에서 플레어를 감성적인 레이어로 활용하기',
    content: `해가 낮게 뜨는 겨울 오후 3~4시 무렵에는 피사체 뒤쪽 대각선 45도 방향에서 들어오는 사광과 역광을 적극적으로 활용해 보세요.\n\n렌즈 후드를 잠시 분리하고 태양 빛이 렌즈 전면 유리에 살짝 스치도록 앵글을 미세 조정하면, 인위적인 후보정으로는 만들기 어려운 자연스러운 고스트와 헤이즈(Haze)가 프레임 전체를 감싸 안습니다.\n\n이때 측광 모드는 스팟 측광 또는 하이라이트 중점 측광으로 설정해 빛이 닿는 윤곽선(Rim Light)이 하얗게 날아가지 않도록 제어하는 것이 포인트입니다.`,
    author: '시선기록자',
    date: '2026.11.10',
    imageUrl: 'https://drive.google.com/thumbnail?id=1FMYxY8mqg-YrTw--S16tw-PeIZ1Sjt-3&sz=w1200',
    linkUrl: ''
  },
  {
    id: 'tip-5',
    category: '장비·소품',
    title: '단렌즈 하나로 스트리트 스냅 구도를 정돈하는 35mm vs 50mm 화각 선택 가이드',
    content: `거리 스냅이나 일상 기록에서 줌렌즈 대신 단렌즈 하나만 마운트하고 나가면 발걸음 자체가 줌링이 되어 피사체와의 거리감이 훨씬 일정해집니다.\n\n35mm 화각은 피사체와 주변 공간의 맥락(Context)을 함께 담아내기에 최적화된 스토리텔링 화각이며, 50mm 화각은 불필요한 배경 요소를 덜어내고 시선이 머무는 주제를 압축적으로 강조할 때 유리합니다.\n\n자신이 평소 사진을 찍을 때 배경의 분위기를 먼저 보는지, 아니면 피사체의 디테일과 형태를 먼저 보는지에 따라 메인 단렌즈 화각을 결정해 보세요.`,
    author: '모노크롬',
    date: '2026.11.08',
    imageUrl: '',
    linkUrl: ''
  },
  {
    id: 'tip-6',
    category: '기타',
    title: '공모전 출품 전 반드시 체크해야 할 색공간(sRGB) 설정과 파일 네이밍 팁',
    content: `웹 갤러리나 온라인 사진 공모전에 작품을 출품할 때 Adobe RGB 색공간 그대로 내보내면 일반 브라우저나 모바일 화면에서 채도가 빠지고 물 빠진 색감으로 보일 수 있습니다.\n\n내보내기(Export) 설정에서 색공간(Color Space)을 반드시 표준 'sRGB IEC61966-2.1'로 지정하고, 긴 변 기준 2048px~3000px 해상도로 저장하면 화질 손실 없이 가장 선명하게 웹에 게시됩니다.\n\n출품 시 파일명은 '작가명_작품제목_카메라기종.jpg' 규칙을 지켜 업로드해 주시면 아카이브 시스템에서 자동으로 인식하여 전시됩니다.`,
    author: '운영진',
    date: '2026.11.05',
    imageUrl: 'https://drive.google.com/thumbnail?id=1CelZTVIxJzi5ZJmNWT2bQGxxGxNKOWKU&sz=w1200',
    linkUrl: ''
  }
];

let tipsPosts = [];

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

// 순수 작품 제목 추출 (언더바 뒤 작품 제목 부분만 추출 + 진행중 익명 투표 시 카메라 기종 숨김 + 끝의 중복 (1), (2) 제거)
function extractWorkTitleOnly(filename, hideCamera = false) {
  const cleaned = removeAwardAndLeadingNumber(filename);
  const withoutParen = cleanDuplicateTrailingNumber(cleaned);
  const parts = withoutParen.split('_').map(s => s.trim()).filter(Boolean);

  if (parts.length >= 3 && hideCamera) {
    // 작가명_작품제목_카메라기종 형태에서 진행중 폴더는 순수 작품제목만 노출
    return parts.slice(1, -1).join(' ');
  }
  if (parts.length >= 2) {
    return parts.slice(1).join('_');
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

// 사진 객체별로 화면에 표시할 제목, 순번 배지, 작가명 반환
function getDisplayMeta(photo) {
  const inOngoing = isOngoingFolder(photo.folderName);
  const rawAuthor = extractAuthorFromFilename(photo.name);
  const pureWorkTitle = extractWorkTitleOnly(photo.name, inOngoing);
  const fullCleanTitle = cleanDuplicateTrailingNumber(removeAwardAndLeadingNumber(photo.name));

  if (inOngoing) {
    const numLabel = photo.contestNumber ? `${photo.contestNumber}번` : '';
    const combinedTitle = numLabel ? `${numLabel} ${pureWorkTitle}` : pureWorkTitle;
    return {
      title: combinedTitle,
      pureTitle: pureWorkTitle,
      numLabel: numLabel,
      authorLabel: 'by 익명',
      isAnonymous: true
    };
  }

  return {
    title: fullCleanTitle,
    pureTitle: fullCleanTitle,
    numLabel: '',
    authorLabel: rawAuthor ? `by ${rawAuthor}` : '',
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
    // All 탭에서는 발광 테두리 효과를 끄고, 특정 공모전 폴더 탭을 선택했을 때만 발광 테두리 적용
    const showWinnerGlow = winner && selectedSubfolderId !== 'ALL';
    const meta = getDisplayMeta(photo);
    const rawFolder = photo.folderName && photo.folderName !== '기본 폴더' ? photo.folderName : '';
    const folderLabel = rawFolder ? cleanOngoingFolderName(rawFolder) : '';
    const numBadgeHtml = meta.numLabel
      ? `<span class="vote-num-badge">${escapeHtml(meta.numLabel)}</span>`
      : '';

    return `
      <article
        class="photo-card ${showWinnerGlow ? 'is-winner' : ''}"
        data-index="${idx}"
        tabindex="0"
        role="button"
        aria-label="${escapeHtml(meta.title)} 크게 보기"
        style="transition-delay: ${Math.min(idx * 45, 270)}ms"
      >
        <div class="card-glare" aria-hidden="true"></div>
        <div class="photo-media-wrap">
          ${winner ? `<span class="winner-glass-badge">${escapeHtml(I18N.firstPrizeBadge)}</span>` : ''}
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
   7. 정보·꿀팁 게시판 렌더링 & 상세/작성 모달 + 메인 뷰 전환
   ========================================================================== */
function loadTipsPosts() {
  try {
    localStorage.removeItem('gallery_archive_tips_posts_v1');
    const saved = localStorage.getItem(STORAGE_KEY_TIPS);
    const parsed = saved ? JSON.parse(saved) : [...DEFAULT_TIPS_POSTS];
    tipsPosts = parsed.filter(p => p && p.title !== 'ㅁㄴㅇ');
  } catch (e) {
    tipsPosts = [...DEFAULT_TIPS_POSTS];
  }
}

function saveTipsPosts() {
  try {
    localStorage.setItem(STORAGE_KEY_TIPS, JSON.stringify(tipsPosts));
  } catch (e) {}
}

function switchMainView(viewName) {
  currentMainView = viewName === 'tips' ? 'tips' : 'gallery';

  const galleryContainer = document.getElementById('galleryViewContainer');
  const tipsView = document.getElementById('tipsBoardView');
  const folderTabs = document.getElementById('folderCategoryTabs');
  const btnGallery = document.getElementById('navViewGallery');
  const btnTips = document.getElementById('navViewTips');
  const searchInput = document.getElementById('searchInput');

  if (currentMainView === 'tips') {
    if (galleryContainer) galleryContainer.classList.add('hidden');
    if (folderTabs) folderTabs.classList.add('hidden');
    if (tipsView) tipsView.classList.remove('hidden');
    if (btnGallery) btnGallery.classList.remove('active');
    if (btnTips) btnTips.classList.add('active');
    if (searchInput) searchInput.placeholder = '제목, 내용, 작성자 검색...';
    renderTipsBoard();
  } else {
    if (tipsView) tipsView.classList.add('hidden');
    if (galleryContainer) galleryContainer.classList.remove('hidden');
    if (folderTabs) folderTabs.classList.remove('hidden');
    if (btnTips) btnTips.classList.remove('active');
    if (btnGallery) btnGallery.classList.add('active');
    if (searchInput) searchInput.placeholder = '작품, 작가, 카메라 검색...';
    applyFiltersAndRender();
  }
}

function renderTipsBoard() {
  const grid = document.getElementById('tipsCardGrid');
  if (!grid) return;

  const q = searchQuery.toLowerCase();
  const filtered = tipsPosts.filter(post => {
    if (!q) return true;
    const text = `${post.title} ${post.content} ${post.author}`.toLowerCase();
    return text.includes(q);
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="text-align: center; padding: 64px 20px; color: var(--text-secondary); border-bottom: 1px solid var(--glass-border);">
        조건에 맞는 게시글이 없습니다.
      </div>
    `;
    return;
  }

  const total = filtered.length;
  grid.innerHTML = filtered.map((post, idx) => {
    const rowNum = total - idx;
    const hasPhoto = Boolean(post.imageUrl && post.imageUrl.trim());
    const photoIconHtml = hasPhoto ? `
      <span class="board-attach-icon" title="사진 첨부됨" aria-label="사진 첨부됨">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
      </span>
    ` : '';

    return `
      <div class="board-row" data-tip-id="${escapeHtml(post.id)}" tabindex="0" role="listitem" aria-label="${escapeHtml(post.title)} 상세 보기">
        <span class="col-num">${rowNum}</span>
        <div class="col-title">
          <span class="board-row-title-text">${escapeHtml(post.title)}</span>
          ${photoIconHtml}
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

  const imgWrap = document.getElementById('tipDetailImageWrap');
  const imgEl = document.getElementById('tipDetailImage');
  if (post.imageUrl && post.imageUrl.trim()) {
    imgEl.src = post.imageUrl;
    imgEl.alt = post.title;
    imgWrap.classList.remove('hidden');
  } else {
    imgEl.src = '';
    imgWrap.classList.add('hidden');
  }

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
  document.getElementById('tipWriteForm').reset();
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
  loadTipsPosts();
  initWebGLBackground();
  setupLightboxTouchGestures();
  loadDriveFolder(CONFIGURED_FOLDER_URL, false);

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

  // 상단 갤러리 / 정보·꿀팁 섹션 전환 메뉴
  const navGalleryBtn = document.getElementById('navViewGallery');
  const navTipsBtn = document.getElementById('navViewTips');
  if (navGalleryBtn) {
    navGalleryBtn.addEventListener('click', () => switchMainView('gallery'));
  }
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

  // 게시판 작성 모달 이벤트
  const tipWriteBackdrop = document.getElementById('tipWriteModalBackdrop');
  const tipWriteDialog = document.getElementById('tipWriteDialog');
  document.getElementById('btnOpenTipWrite')?.addEventListener('click', openTipWriteModal);
  document.getElementById('btnCloseTipWriteTop')?.addEventListener('click', closeTipWriteModal);
  document.getElementById('btnCancelTipWrite')?.addEventListener('click', closeTipWriteModal);
  tipWriteDialog?.addEventListener('click', e => e.stopPropagation());
  tipWriteBackdrop?.addEventListener('click', e => {
    if (e.target === tipWriteBackdrop) closeTipWriteModal();
  });

  document.getElementById('tipWriteForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const now = new Date();
    const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
    const newPost = {
      id: `tip-${Date.now()}`,
      author: document.getElementById('tipInputAuthor').value.trim(),
      title: document.getElementById('tipInputTitle').value.trim(),
      content: document.getElementById('tipInputContent').value.trim(),
      imageUrl: document.getElementById('tipInputImage').value.trim(),
      linkUrl: document.getElementById('tipInputLink').value.trim(),
      date: dateStr
    };
    tipsPosts.unshift(newPost);
    saveTipsPosts();
    closeTipWriteModal();
    renderTipsBoard();
    showAppleToast('새로운 게시글이 등록되었습니다');
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
      } else {
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
