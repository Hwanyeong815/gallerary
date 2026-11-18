const DEFAULT_FOLDER_URL = 'https://drive.google.com/drive/folders/1o3QBRz4f87QC9L-c2wuBADjgb28uUMmw?usp=sharing';
const STORAGE_KEY_LIKES = 'atelier_drive_likes_v1';

let allPhotos = [];
let folderCategories = []; // [{ id, name }]
let selectedSubfolderId = 'ALL';
let searchQuery = '';
let filteredPhotos = [];
let activePhotoIndex = 0;
let likesMap = {};

function loadLikes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LIKES);
    likesMap = raw ? JSON.parse(raw) : {};
  } catch (e) {
    likesMap = {};
  }
}

function saveLikes() {
  try {
    localStorage.setItem(STORAGE_KEY_LIKES, JSON.stringify(likesMap));
  } catch (e) {}
}

function getLikeInfo(photoId) {
  if (!likesMap[photoId]) {
    likesMap[photoId] = { count: 0, liked: false };
  }
  return likesMap[photoId];
}

function toggleLike(photoId) {
  const info = getLikeInfo(photoId);
  if (info.liked) {
    info.liked = false;
    info.count = Math.max(0, info.count - 1);
  } else {
    info.liked = true;
    info.count += 1;
  }
  saveLikes();
  updateTotalLikesUI();
  renderPhotoGrid(filteredPhotos);

  const currentModalPhoto = filteredPhotos[activePhotoIndex];
  if (currentModalPhoto && currentModalPhoto.id === photoId) {
    updateLightboxLikeUI(photoId);
  }
}

function updateTotalLikesUI() {
  const total = allPhotos.reduce((sum, p) => sum + getLikeInfo(p.id).count, 0);
  const badge = document.getElementById('totalLikesBadge');
  if (badge) badge.textContent = `♥ ${total}`;
}

function formatExhibitTitle(filename) {
  return String(filename || 'Untitled')
    .replace(/\.(jpg|jpeg|png|webp|gif|bmp|avif|heic|tif|tiff)$/i, '')
    .replace(/[_-]+/g, ' ')
    .trim() || 'Untitled Work';
}

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
  let html = '';
  for (let i = 0; i < count; i++) {
    const num = String(i + 1).padStart(2, '0');
    html += `
      <div class="photo-card">
        <div class="frame-outer">
          <div class="photo-thumb-wrap">
            <div class="skeleton-shimmer">
              <div class="spinner-ring"></div>
              <span>하위 폴더 및 작품을 스캔하는 중...</span>
            </div>
          </div>
        </div>
        <div class="photo-plaque">
          <div class="plaque-left">
            <span class="exhibit-num">EXHIBIT NO. ${num}</span>
            <span class="photo-name" style="color: var(--text-muted);">Loading Archive...</span>
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

// embeddedfolderview HTML에서 하위 폴더와 이미지 파일을 분리 파싱
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

// 단일 폴더의 embeddedfolderview HTML을 무료 공개 프록시로 가져오기
async function fetchSingleFolderEmbedHtml(folderId) {
  const embedUrl = `https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(folderId)}#grid`;
  const proxyUrls = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(embedUrl)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(embedUrl)}`,
    `https://corsproxy.io/?${encodeURIComponent(embedUrl)}`
  ];

  for (const pUrl of proxyUrls) {
    try {
      const res = await fetch(pUrl);
      if (!res.ok) continue;
      const html = await res.text();
      if (html && html.includes('flip-entry')) return html;
    } catch (e) {}
  }

  try {
    const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(embedUrl)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.contents) return data.contents;
    }
  } catch (e) {}

  return '';
}

// GitHub Pages 등 정적 호스팅에서 하위 폴더까지 재귀적으로 파싱
async function fetchFolderTreeViaPublicEmbed(rootFolderId, maxDepth = 3) {
  const photos = [];
  const folders = [];
  const visited = new Set();

  async function traverse(folderId, folderName, depth) {
    if (visited.has(folderId) || depth > maxDepth) return;
    visited.add(folderId);

    const html = await fetchSingleFolderEmbedHtml(folderId);
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
          thumbUrl: `https://drive.google.com/thumbnail?id=${file.id}&sz=w800`,
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

// 하위 폴더 탭 렌더링
function renderFolderTabs() {
  const tabsContainer = document.getElementById('folderCategoryTabs');
  if (!tabsContainer) return;

  if (folderCategories.length <= 1 && folderCategories[0]?.name === '기본 폴더') {
    tabsContainer.innerHTML = '';
    return;
  }

  let html = `
    <button type="button" class="folder-tab-btn ${selectedSubfolderId === 'ALL' ? 'active' : ''}" data-folder-id="ALL">
      <span>전체 폴더</span>
      <span class="folder-tab-count">(${allPhotos.length})</span>
    </button>
  `;

  folderCategories.forEach(folder => {
    const count = allPhotos.filter(p => p.folderId === folder.id).length;
    html += `
      <button type="button" class="folder-tab-btn ${selectedSubfolderId === folder.id ? 'active' : ''}" data-folder-id="${folder.id}">
        <span>📁 ${escapeHtml(folder.name)}</span>
        <span class="folder-tab-count">(${count})</span>
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
  filteredPhotos = allPhotos.filter(p => {
    const matchFolder = selectedSubfolderId === 'ALL' || p.folderId === selectedSubfolderId;
    const matchQuery = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery) ||
      (p.folderName && p.folderName.toLowerCase().includes(searchQuery));
    return matchFolder && matchQuery;
  });

  const badge = document.getElementById('photoCountBadge');
  if (badge) badge.textContent = `${filteredPhotos.length} Works`;

  renderPhotoGrid(filteredPhotos);
}

async function loadDriveFolder(folderInput, forceLive = false) {
  const folderId = extractFolderId(folderInput);
  const badge = document.getElementById('photoCountBadge');
  const statusBanner = document.getElementById('statusBanner');
  const folderLink = document.getElementById('openDriveFolderLink');

  statusBanner.classList.add('hidden');
  badge.textContent = 'Scanning...';
  folderLink.href = `https://drive.google.com/drive/folders/${folderId}?usp=sharing`;
  selectedSubfolderId = 'ALL';

  renderSkeletonGrid(6);

  try {
    let photos = [];
    let folders = [];

    // 1순위: 로컬 서버(/api/folder)가 켜져 있으면 사용
    try {
      const res = await fetch(`/api/folder?id=${encodeURIComponent(folderId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.ok && Array.isArray(data.photos) && data.photos.length > 0) {
          photos = data.photos;
          folders = Array.isArray(data.folders) ? data.folders : [];
        }
      }
    } catch (localErr) {}

    // 2순위: GitHub Pages 배포 시 생성된 정적 drive-cache.json 확인
    if (photos.length === 0 && !forceLive) {
      try {
        const cacheRes = await fetch(`drive-cache.json?t=${Date.now()}`);
        if (cacheRes.ok) {
          const cacheData = await cacheRes.json();
          if (cacheData.ok && cacheData.folderId === folderId && Array.isArray(cacheData.photos) && cacheData.photos.length > 0) {
            photos = cacheData.photos;
            folders = Array.isArray(cacheData.folders) ? cacheData.folders : [];
          }
        }
      } catch (cacheErr) {}
    }

    // 3순위: 브라우저에서 직접 공개 임베드 뷰 재귀 파싱 (하위 폴더 포함)
    if (photos.length === 0) {
      const result = await fetchFolderTreeViaPublicEmbed(folderId);
      photos = result.photos;
      folders = result.folders;
    }

    allPhotos = photos;
    folderCategories = folders;
    updateTotalLikesUI();
    renderFolderTabs();

    if (photos.length === 0) {
      document.getElementById('photoGrid').innerHTML = '';
      badge.textContent = '0 Works';
      statusBanner.textContent = '폴더(및 하위 폴더)에서 사진을 찾지 못했습니다. 구글 드라이브 폴더 공유 권한이 "링크가 있는 모든 사용자"로 설정되어 있는지 확인해 주세요.';
      statusBanner.classList.remove('hidden');
      return;
    }

    applyFiltersAndRender();
  } catch (err) {
    badge.textContent = 'Error';
    statusBanner.textContent = `오류가 발생했습니다: ${err.message}`;
    statusBanner.classList.remove('hidden');
  }
}

function renderPhotoGrid(photos) {
  const grid = document.getElementById('photoGrid');

  grid.innerHTML = photos.map((photo, idx) => {
    const num = String(idx + 1).padStart(2, '0');
    const cleanTitle = formatExhibitTitle(photo.name);
    const likeInfo = getLikeInfo(photo.id);
    const showFolderBadge = photo.folderName && photo.folderName !== '기본 폴더';

    return `
      <article class="photo-card" data-index="${idx}" tabindex="0" role="button" aria-label="${escapeHtml(cleanTitle)} 감상하기">
        <div class="frame-outer">
          <div class="photo-thumb-wrap">
            <div class="skeleton-shimmer">
              <div class="spinner-ring"></div>
              <span>작품 로딩 중...</span>
            </div>
            <img
              class="photo-thumb"
              src="${photo.thumbUrl}"
              alt="${escapeHtml(cleanTitle)}"
              loading="lazy"
              referrerpolicy="no-referrer"
            />
            <div class="thumb-hover-overlay">
              <span class="zoom-pill">크게 감상하기 ⤢</span>
            </div>
          </div>
        </div>
        <div class="photo-plaque">
          <div class="plaque-left">
            <span class="exhibit-num">
              EXHIBIT NO. ${num}
              ${showFolderBadge ? `<span class="folder-badge-pill">📁 ${escapeHtml(photo.folderName)}</span>` : ''}
            </span>
            <h3 class="photo-name" title="${escapeHtml(photo.name)}">${escapeHtml(cleanTitle)}</h3>
          </div>
          <button type="button" class="card-like-btn ${likeInfo.liked ? 'liked' : ''}" data-like-id="${photo.id}" title="이 작품 추천하기">
            <span>♥</span>
            <span>${likeInfo.count}</span>
          </button>
        </div>
      </article>
    `;
  }).join('');

  grid.querySelectorAll('.card-like-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      toggleLike(btn.getAttribute('data-like-id'));
    });
  });

  grid.querySelectorAll('.photo-card').forEach(card => {
    const img = card.querySelector('.photo-thumb');
    const idx = Number(card.getAttribute('data-index'));

    const markLoaded = () => card.classList.add('loaded');
    if (img.complete && img.naturalWidth > 0) {
      markLoaded();
    } else {
      img.addEventListener('load', markLoaded);
      img.addEventListener('error', () => {
        const photo = photos[idx];
        const fallbackUrl = `https://lh3.googleusercontent.com/d/${photo.id}=w800`;
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
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  renderFilmstrip();
  updateLightboxContent();
}

function renderFilmstrip() {
  const strip = document.getElementById('lightboxFilmstrip');
  strip.innerHTML = filteredPhotos.map((p, idx) => `
    <div class="film-thumb ${idx === activePhotoIndex ? 'active' : ''}" data-idx="${idx}">
      <img src="${p.thumbUrl}" alt="${escapeHtml(p.name)}" referrerpolicy="no-referrer" />
    </div>
  `).join('');

  strip.querySelectorAll('.film-thumb').forEach(el => {
    el.addEventListener('click', () => {
      activePhotoIndex = Number(el.getAttribute('data-idx'));
      updateLightboxContent();
    });
  });
}

function updateLightboxLikeUI(photoId) {
  const info = getLikeInfo(photoId);
  const btn = document.getElementById('btnLightboxLike');
  const text = document.getElementById('lightboxLikeText');
  const count = document.getElementById('lightboxLikeCount');

  if (info.liked) {
    btn.classList.add('liked');
    text.textContent = '추천됨';
  } else {
    btn.classList.remove('liked');
    text.textContent = '추천';
  }
  count.textContent = info.count;
}

function updateLightboxContent() {
  const photo = filteredPhotos[activePhotoIndex];
  if (!photo) return;

  const img = document.getElementById('lightboxImage');
  const spinner = document.getElementById('lightboxSpinner');
  const counter = document.getElementById('lightboxCounter');
  const title = document.getElementById('lightboxTitle');
  const resText = document.getElementById('lightboxResolution');
  const driveLink = document.getElementById('lightboxDriveLink');
  const ambientBg = document.getElementById('lightboxAmbientBg');

  img.setAttribute('referrerpolicy', 'no-referrer');

  const num = String(activePhotoIndex + 1).padStart(2, '0');
  const tot = String(filteredPhotos.length).padStart(2, '0');
  counter.textContent = `${num} / ${tot}`;
  title.textContent = formatExhibitTitle(photo.name);

  const folderPrefix = photo.folderName && photo.folderName !== '기본 폴더'
    ? `[📁 ${photo.folderName}] `
    : '';
  resText.textContent = `${folderPrefix}${photo.name}`;
  driveLink.href = photo.driveUrl;
  ambientBg.style.backgroundImage = `url('${photo.thumbUrl}')`;

  updateLightboxLikeUI(photo.id);

  document.querySelectorAll('.film-thumb').forEach((el, idx) => {
    el.classList.toggle('active', idx === activePhotoIndex);
  });

  img.classList.remove('loaded');
  spinner.classList.remove('hidden');

  img.onload = () => {
    spinner.classList.add('hidden');
    img.classList.add('loaded');
    if (img.naturalWidth && img.naturalHeight) {
      resText.textContent = `${folderPrefix}${photo.name} · ${img.naturalWidth} × ${img.naturalHeight}px`;
    }
  };

  img.onerror = () => {
    const fallbackFull = `https://lh3.googleusercontent.com/d/${photo.id}=w1600`;
    if (img.src !== fallbackFull) {
      img.src = fallbackFull;
    } else {
      spinner.classList.add('hidden');
      img.classList.add('loaded');
    }
  };

  img.src = photo.fullUrl;
  img.alt = photo.name;
}

function closeLightbox() {
  document.getElementById('lightboxModal').classList.add('hidden');
  document.getElementById('lightboxImage').src = '';
  document.body.style.overflow = '';
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

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', () => {
  loadLikes();
  const input = document.getElementById('folderUrlInput');
  loadDriveFolder(input.value || DEFAULT_FOLDER_URL);

  document.querySelectorAll('.seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.documentElement.setAttribute('data-frame', btn.getAttribute('data-style-mode'));
    });
  });

  document.getElementById('btnThemeToggle').addEventListener('click', () => {
    const html = document.documentElement;
    const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', next);
    document.getElementById('themeIcon').textContent = next === 'dark' ? '🌙' : '☀️';
    document.getElementById('themeLabel').textContent = next === 'dark' ? '다크 갤러리' : '화이트 미술관';
  });

  document.getElementById('btnToggleFolderDrawer').addEventListener('click', () => {
    document.getElementById('folderDrawer').classList.toggle('hidden');
  });

  document.getElementById('folderForm').addEventListener('submit', e => {
    e.preventDefault();
    loadDriveFolder(input.value);
    document.getElementById('folderDrawer').classList.add('hidden');
  });

  document.getElementById('btnRefreshGallery').addEventListener('click', () => {
    loadDriveFolder(input.value, true);
  });

  document.getElementById('searchInput').addEventListener('input', e => {
    searchQuery = e.target.value.trim().toLowerCase();
    applyFiltersAndRender();
  });

  document.getElementById('btnLightboxLike').addEventListener('click', () => {
    const photo = filteredPhotos[activePhotoIndex];
    if (photo) toggleLike(photo.id);
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
