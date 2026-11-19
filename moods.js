/* ==========================================================================
   기분전환: 맨 아래 '기분전환' 버튼을 누를 때마다 사이트 분위기가 차례로 바뀜
   원래 → 윈도우 98 → 해커 터미널 → 중력 → 카메라 뷰파인더 → 미니홈피 → 원래
   어디에도 저장하지 않으므로 새로고침하면 원래대로 돌아옴
   (화면 문구는 app.js의 STRINGS / t() 를 같이 씀)
   ========================================================================== */
(function () {
  const MOODS = ['win98', 'hacker', 'gravity', 'viewfinder', 'homepage'];
  const GALMURI_CSS = 'https://cdn.jsdelivr.net/npm/galmuri@2.40.3/dist/galmuri.css';
  const GAEGU_CSS = 'https://fonts.googleapis.com/css2?family=Gaegu:wght@400;700&display=swap';
  const MATTER_JS = 'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js';

  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  let moodIndex = -1; // -1 = 원래 모습
  let cleanup = null; // 지금 켜진 분위기를 끌 때 실행할 정리 함수
  let refreshTexts = null; // 지금 켜진 분위기의 문구를 다시 쓰는 함수 (한/EN 전환용)
  let pill = null;

  const tr = (key, ...args) => (typeof t === 'function' ? t(key, ...args) : key);
  const toast = msg => { if (typeof showAppleToast === 'function') showAppleToast(msg); };
  const moodName = i => {
    const names = tr('moodNames');
    return Array.isArray(names) ? names[i] : MOODS[i];
  };
  const photoTotal = () => (typeof allPhotos !== 'undefined' && Array.isArray(allPhotos) ? allPhotos.length : 0);
  const esc = str => String(str == null ? '' : str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  /* ---------- 글꼴 · 라이브러리는 그 분위기를 처음 켤 때만 불러옴 ---------- */
  const loading = {};
  function loadStyle(href) {
    if (!loading[href]) {
      loading[href] = new Promise(resolve => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = () => resolve(true);
        link.onerror = () => resolve(false);
        document.head.appendChild(link);
      });
    }
    return loading[href];
  }
  function loadScript(src) {
    if (!loading[src]) {
      loading[src] = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => {
          delete loading[src];
          s.remove();
          reject(new Error('load failed'));
        };
        document.head.appendChild(s);
      });
    }
    return loading[src];
  }

  /* ---------- 전환 ---------- */
  function setMood(index) {
    if (cleanup) {
      try { cleanup(); } catch (e) {}
    }
    cleanup = null;
    refreshTexts = null;
    moodIndex = index;

    const root = document.documentElement;
    if (index < 0 || index >= MOODS.length) {
      moodIndex = -1;
      root.removeAttribute('data-mood');
      removePill();
      toast(tr('moodToastOff'));
      return;
    }

    const mood = MOODS[index];
    root.setAttribute('data-mood', mood);
    renderPill();
    toast(tr('moodToast', moodName(index)));
    const result = SETUPS[mood]();
    cleanup = result.cleanup || null;
    refreshTexts = result.refresh || null;
  }

  function nextMood() {
    setMood(moodIndex + 1 >= MOODS.length ? -1 : moodIndex + 1);
  }

  /* 화면 오른쪽 아래 작은 막대: 지금 분위기 이름 · 다음 · 원래대로 (맨 아래까지 내려가지 않아도 바꿀 수 있게) */
  function renderPill() {
    if (!pill) {
      pill = document.createElement('div');
      pill.className = 'mood-pill';
      pill.setAttribute('role', 'group');
      pill.addEventListener('click', e => {
        const btn = e.target.closest('button[data-act]');
        if (!btn) return;
        const act = btn.getAttribute('data-act');
        if (act === 'next') nextMood();
        else if (act === 'off') setMood(-1);
        else if (act === 'reset' && typeof pill._reset === 'function') pill._reset();
      });
      document.body.appendChild(pill);
    }
    const mood = MOODS[moodIndex];
    pill.setAttribute('aria-label', tr('moodBtn'));
    pill.innerHTML = `
      <span class="mood-pill-name">${esc(moodName(moodIndex))}<span class="mood-pill-step">${moodIndex + 1}/${MOODS.length}</span></span>
      ${mood === 'gravity' ? `<button type="button" data-act="reset">${esc(tr('gravityReset'))}</button>` : ''}
      <button type="button" data-act="next">${esc(tr('moodNext'))} ▸</button>
      <button type="button" data-act="off" class="mood-pill-off" aria-label="${esc(tr('moodBack'))}" title="${esc(tr('moodBack'))}">✕</button>
    `;
  }

  function removePill() {
    if (pill) pill.remove();
    pill = null;
  }

  // app.js의 setLanguage()가 부름
  window.refreshMoodTexts = function () {
    if (moodIndex < 0) return;
    renderPill();
    if (refreshTexts) refreshTexts();
  };

  /* ======================================================================
     1. 윈도우 98: 청록 바탕화면 · 회색 창 · 작업 표시줄 · 시작 메뉴
     ====================================================================== */
  function setupWin98() {
    loadStyle(GALMURI_CSS);
    const root = document.documentElement;

    const bar = document.createElement('div');
    bar.className = 'w98-taskbar';
    bar.innerHTML = `
      <button type="button" class="w98-start" aria-haspopup="true" aria-expanded="false"><span class="w98-logo" aria-hidden="true"></span><span class="w98-start-label"></span></button>
      <span class="w98-task"><span class="w98-task-icon" aria-hidden="true"></span><span class="w98-task-label"></span></span>
      <span class="w98-tray"><span class="w98-clock"></span></span>
    `;
    const menu = document.createElement('div');
    menu.className = 'w98-menu hidden';
    menu.setAttribute('role', 'menu');
    document.body.appendChild(bar);
    document.body.appendChild(menu);

    const startBtn = bar.querySelector('.w98-start');
    const clock = bar.querySelector('.w98-clock');

    const closeMenu = () => {
      menu.classList.add('hidden');
      startBtn.setAttribute('aria-expanded', 'false');
    };
    startBtn.addEventListener('click', e => {
      e.stopPropagation();
      const open = menu.classList.contains('hidden');
      menu.classList.toggle('hidden', !open);
      startBtn.setAttribute('aria-expanded', String(open));
    });
    menu.addEventListener('click', e => {
      const item = e.target.closest('button[data-go]');
      if (!item) return;
      const go = item.getAttribute('data-go');
      closeMenu();
      if (go === 'off') {
        setMood(-1);
      } else if (typeof switchMainView === 'function') {
        switchMainView(go);
        window.scrollTo({ top: 0 });
      }
    });
    const onDocClick = e => {
      if (!menu.contains(e.target) && !startBtn.contains(e.target)) closeMenu();
    };
    document.addEventListener('click', onDocClick);

    const tick = () => {
      const lang = typeof currentLang !== 'undefined' && currentLang === 'en' ? 'en-US' : 'ko-KR';
      clock.textContent = new Date().toLocaleTimeString(lang, { hour: 'numeric', minute: '2-digit' });
    };
    const timer = setInterval(tick, 15000);

    const refresh = () => {
      root.style.setProperty('--mood-win-title', JSON.stringify(tr('winTitle')));
      bar.querySelector('.w98-start-label').textContent = tr('winStart');
      bar.querySelector('.w98-task-label').textContent = tr('winTitle');
      menu.innerHTML = `
        <div class="w98-menu-side" aria-hidden="true"><span>Gallery 98</span></div>
        <div class="w98-menu-items">
          <button type="button" role="menuitem" data-go="gallery">🖼️ ${esc(tr('navGallery'))}</button>
          <button type="button" role="menuitem" data-go="competitions">📁 ${esc(tr('navContests'))}</button>
          <button type="button" role="menuitem" data-go="mini">📂 ${esc(tr('navMini'))}</button>
          <hr />
          <button type="button" role="menuitem" data-go="off">⏻ ${esc(tr('winShutdown'))}</button>
        </div>
      `;
      tick();
    };
    refresh();

    return {
      refresh,
      cleanup() {
        clearInterval(timer);
        document.removeEventListener('click', onDocClick);
        bar.remove();
        menu.remove();
        root.style.removeProperty('--mood-win-title');
      }
    };
  }

  /* ======================================================================
     2. 해커 터미널: 접속 화면 → 검은 바탕 초록 글자 · 첫머리에 글자 비
     ====================================================================== */
  function setupHacker() {
    loadStyle(GALMURI_CSS);
    const timers = [];
    let rainTimer = null;

    const scan = document.createElement('div');
    scan.className = 'hk-scanlines';
    scan.setAttribute('aria-hidden', 'true');
    document.body.appendChild(scan);

    // 접속 화면: 한 줄씩 찍히고 잠깐 뒤 사라짐 (누르면 바로 넘어감)
    const boot = document.createElement('div');
    boot.className = 'hk-boot';
    boot.setAttribute('aria-hidden', 'true');
    document.body.appendChild(boot);
    const lines = tr('hackerBoot');
    const bootLines = Array.isArray(lines) ? lines : [];
    const endBoot = () => {
      boot.classList.add('is-done');
      timers.push(setTimeout(() => boot.remove(), 400));
    };
    boot.addEventListener('click', endBoot);
    if (reducedMotion) {
      boot.innerHTML = `${bootLines.map(esc).join('\n')}\n<span class="hk-caret"></span>`;
      timers.push(setTimeout(endBoot, 900));
    } else {
      bootLines.forEach((line, i) => {
        timers.push(setTimeout(() => {
          boot.innerHTML = `${bootLines.slice(0, i + 1).map(esc).join('\n')}\n<span class="hk-caret"></span>`;
        }, 120 + i * 330));
      });
      timers.push(setTimeout(endBoot, 120 + bootLines.length * 330 + 450));
    }

    // 첫머리(먹색 띠)에만 초록 글자 비
    const hero = document.querySelector('.hero-stage');
    let canvas = null;
    if (hero && !reducedMotion) {
      canvas = document.createElement('canvas');
      canvas.className = 'hk-rain';
      canvas.setAttribute('aria-hidden', 'true');
      hero.prepend(canvas);
      const ctx = canvas.getContext('2d');
      const glyphs = '01アイウエオカキクケコサシスセソ갤러리사진빛그림자ㄱㄴㄷㄹㅁㅂㅅ#$%&*'.split('');
      const size = 16;
      let drops = [];
      const resize = () => {
        canvas.width = hero.clientWidth;
        canvas.height = hero.clientHeight;
        drops = Array.from({ length: Math.ceil(canvas.width / size) }, () => Math.floor(Math.random() * -40));
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      };
      resize();
      window.addEventListener('resize', resize);
      rainTimer = setInterval(() => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.09)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = `${size}px monospace`;
        drops.forEach((y, i) => {
          const ch = glyphs[(Math.random() * glyphs.length) | 0];
          ctx.fillStyle = Math.random() > 0.96 ? '#d6ffe0' : '#1fdc56';
          ctx.fillText(ch, i * size, y * size);
          drops[i] = y * size > canvas.height && Math.random() > 0.975 ? 0 : y + 1;
        });
      }, 70);
      canvas._resize = resize;
    }

    return {
      cleanup() {
        timers.forEach(clearTimeout);
        if (rainTimer) clearInterval(rainTimer);
        if (canvas) {
          window.removeEventListener('resize', canvas._resize);
          canvas.remove();
        }
        boot.remove();
        scan.remove();
      }
    };
  }

  /* ======================================================================
     3. 중력: 화면에 보이던 메뉴 · 제목 · 사진이 바닥으로 떨어짐. 잡아서 던질 수 있음
        (Matter.js 물리 엔진, 사진을 그냥 누르면 크게 보기)
     ====================================================================== */
  function setupGravity() {
    let cancelled = false;
    let stop = null;

    const start = () => {
      if (cancelled) return;
      if (stop) stop();
      stop = startGravity();
    };
    if (pill) pill._reset = start;

    loadScript(MATTER_JS).then(() => {
      if (cancelled) return;
      start();
      toast(tr('gravityHint'));
    }).catch(() => {
      if (!cancelled) toast(tr('moodLoadFail'));
    });

    return {
      refresh() {
        if (pill) pill._reset = start;
      },
      cleanup() {
        cancelled = true;
        if (stop) stop();
        stop = null;
      }
    };
  }

  const GRAVITY_SELECTOR = [
    '.nav-brand', '.nav-switch-btn', '.folder-tab-btn', '.search-pill', '.nav-icon-btn',
    '.hero-eyebrow', '.hero-title .word', '.hero-subtitle > span',
    '.photo-card', '.load-more-btn', '.status-banner',
    '.archive-page-title', '.archive-page-subtitle', '.comp-filter-chip', '.comp-year-title', '.comp-archive-card',
    '.comp-back-btn', '.comp-detail-title', '.comp-detail-desc', '.detail-stat-item', '.comp-section-title',
    '.minimal-footer .footer-item', '.mood-btn'
  ].join(', ');

  function startGravity() {
    const M = window.Matter;
    const { Engine, Runner, Bodies, Body, Composite, Mouse, MouseConstraint, Events, Query } = M;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // 화면 안에 보이는 것만 (다른 요소 안에 든 것은 빼고) 최대 70개
    const picked = [];
    document.querySelectorAll(GRAVITY_SELECTOR).forEach(el => {
      if (picked.length >= 70) return;
      if (picked.some(p => p.contains(el))) return;
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return;
      if (r.bottom <= 0 || r.top >= vh || r.right <= 0 || r.left >= vw) return;
      picked.push(el);
    });

    const layer = document.createElement('div');
    layer.className = 'gravity-layer';
    document.body.appendChild(layer);
    document.documentElement.classList.add('gravity-on');

    const engine = Engine.create({ gravity: { x: 0, y: 1.1 } });
    const items = [];

    picked.forEach(el => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const wrap = document.createElement('div');
      wrap.className = 'gravity-item';
      wrap.style.width = `${r.width}px`;
      wrap.style.height = `${r.height}px`;
      // 원래 자리에서 물려받던 글자 모양을 그대로 옮겨 줌
      ['color', 'fontFamily', 'fontSize', 'fontWeight', 'letterSpacing', 'lineHeight', 'textAlign'].forEach(prop => {
        wrap.style[prop] = cs[prop];
      });
      const clone = el.cloneNode(true);
      clone.removeAttribute('id');
      clone.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
      clone.setAttribute('aria-hidden', 'true');
      clone.classList.add('in-view', 'loaded');
      wrap.appendChild(clone);
      layer.appendChild(wrap);

      const body = Bodies.rectangle(r.left + r.width / 2, r.top + r.height / 2, r.width, r.height, {
        restitution: 0.3,
        friction: 0.35,
        frictionAir: 0.012,
        chamfer: { radius: Math.min(6, r.width / 4, r.height / 4) }
      });
      // 줄 맞춰 그대로 내려앉지 않도록 조금씩 비틀고 옆으로 밀어 줌
      Body.setAngle(body, (Math.random() - 0.5) * 0.12);
      Body.setVelocity(body, { x: (Math.random() - 0.5) * 5, y: -Math.random() * 3 });
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.06);
      items.push({ el, wrap, body, w: r.width, h: r.height, prevVisibility: el.style.visibility });
      el.style.visibility = 'hidden';
    });

    const wallOpts = { isStatic: true };
    const T = 200;
    Composite.add(engine.world, [
      Bodies.rectangle(vw / 2, vh + T / 2, vw * 3, T, wallOpts),
      Bodies.rectangle(-T / 2, vh / 2, T, vh * 4, wallOpts),
      Bodies.rectangle(vw + T / 2, vh / 2, T, vh * 4, wallOpts),
      Bodies.rectangle(vw / 2, -vh - T / 2, vw * 3, T, wallOpts),
      ...items.map(it => it.body)
    ]);

    const mouse = Mouse.create(layer);
    ['wheel', 'mousewheel', 'DOMMouseScroll'].forEach(type => layer.removeEventListener(type, mouse.mousewheel));
    const drag = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2, render: { visible: false } } });
    Composite.add(engine.world, drag);

    // 그냥 누른 사진은 크게 보기 (끌어서 던진 경우는 제외)
    let down = null;
    const onDown = e => {
      const p = e.changedTouches ? e.changedTouches[0] : e;
      down = { x: p.clientX, y: p.clientY, at: Date.now() };
      layer.classList.add('is-dragging');
    };
    const onUp = e => {
      layer.classList.remove('is-dragging');
      if (!down) return;
      const p = e.changedTouches ? e.changedTouches[0] : e;
      const moved = Math.hypot(p.clientX - down.x, p.clientY - down.y);
      const quick = Date.now() - down.at < 350;
      down = null;
      if (moved > 6 || !quick) return;
      const hits = Query.point(items.map(it => it.body), { x: p.clientX, y: p.clientY });
      const hit = hits.length ? items.find(it => it.body === hits[hits.length - 1]) : null;
      if (hit && hit.el.classList.contains('photo-card')) hit.el.click();
    };
    layer.addEventListener('mousedown', onDown);
    layer.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('mouseup', onUp);
    layer.addEventListener('touchend', onUp);

    Events.on(engine, 'afterUpdate', () => {
      for (const it of items) {
        const { x, y } = it.body.position;
        it.wrap.style.transform = `translate3d(${(x - it.w / 2).toFixed(1)}px, ${(y - it.h / 2).toFixed(1)}px, 0) rotate(${it.body.angle.toFixed(4)}rad)`;
      }
    });

    const runner = Runner.create();
    Runner.run(runner, engine);

    // 화면 너비가 바뀌면 벽 위치가 어긋나므로 다시 떨어뜨림
    let resizeTimer = null;
    const onResize = () => {
      if (Math.abs(window.innerWidth - vw) < 40) return;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { if (pill && pill._reset) pill._reset(); }, 300);
    };
    window.addEventListener('resize', onResize);

    return function stop() {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mouseup', onUp);
      Runner.stop(runner);
      Events.off(engine);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
      items.forEach(it => { it.el.style.visibility = it.prevVisibility || ''; });
      layer.remove();
      document.documentElement.classList.remove('gravity-on');
    };
  }

  /* ======================================================================
     4. 카메라 뷰파인더: 모서리 표시 · 3분할 선 · 초점 상자 · 녹화 시간 · 노출 값
        사진 위에 올리면 초점이 사진에 맞고, 누르면 셔터가 깜빡임
     ====================================================================== */
  function setupViewfinder() {
    const ui = document.createElement('div');
    ui.className = 'vf-ui';
    ui.setAttribute('aria-hidden', 'true');
    ui.innerHTML = `
      <div class="vf-thirds"></div>
      <span class="vf-corner tl"></span><span class="vf-corner tr"></span>
      <span class="vf-corner bl"></span><span class="vf-corner br"></span>
      <div class="vf-bar">
        <span class="vf-rec"><i></i><b class="vf-rec-label"></b></span>
        <span class="vf-time">00:00:00:00</span>
        <span class="vf-sep"></span>
        <span class="vf-val vf-mode">M</span>
        <span class="vf-val vf-shutter">1/125</span>
        <span class="vf-val vf-aperture">F2.8</span>
        <span class="vf-val vf-iso">ISO 400</span>
        <span class="vf-val vf-ev">±0.0</span>
        <span class="vf-shots">[ 0 ]</span>
        <span class="vf-batt"><i></i></span>
      </div>
    `;
    const focus = document.createElement('div');
    focus.className = 'vf-focus';
    focus.setAttribute('aria-hidden', 'true');
    const flash = document.createElement('div');
    flash.className = 'vf-flash';
    flash.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ui);
    document.body.appendChild(focus);
    document.body.appendChild(flash);

    const $ = sel => ui.querySelector(sel);
    const startedAt = performance.now();
    const pad = n => String(n).padStart(2, '0');
    const timeTimer = setInterval(() => {
      const ms = performance.now() - startedAt;
      const totalSec = Math.floor(ms / 1000);
      const frames = Math.floor((ms % 1000) / (1000 / 24));
      $('.vf-time').textContent = `${pad(Math.floor(totalSec / 3600))}:${pad(Math.floor(totalSec / 60) % 60)}:${pad(totalSec % 60)}:${pad(frames)}`;
    }, 1000 / 12);

    // 사진마다 노출 값이 다르게 (사진 id로 정해서 같은 사진은 늘 같은 값)
    const SHUTTERS = ['1/60', '1/125', '1/250', '1/500', '1/1000', '1/2000'];
    const APERTURES = ['F1.8', 'F2.8', 'F4', 'F5.6', 'F8', 'F11'];
    const ISOS = ['ISO 100', 'ISO 200', 'ISO 400', 'ISO 800', 'ISO 1600'];
    const EVS = ['-0.7', '-0.3', '±0.0', '+0.3', '+0.7'];
    const hash = str => [...String(str)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
    const setExposure = id => {
      const h = hash(id || 'idle');
      $('.vf-shutter').textContent = SHUTTERS[h % SHUTTERS.length];
      $('.vf-aperture').textContent = APERTURES[(h >> 3) % APERTURES.length];
      $('.vf-iso').textContent = ISOS[(h >> 6) % ISOS.length];
      $('.vf-ev').textContent = EVS[(h >> 9) % EVS.length];
    };
    setExposure('idle');

    const CARD_SEL = '.photo-card:not(.is-skeleton), .comp-archive-card, .ongoing-preview-item';
    let lockedCard = null;
    let pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let raf = null;

    const place = () => {
      raf = null;
      if (lockedCard && document.body.contains(lockedCard)) {
        const media = lockedCard.querySelector('.photo-media-wrap, .comp-card-cover-wrap') || lockedCard;
        const r = media.getBoundingClientRect();
        focus.style.width = `${r.width}px`;
        focus.style.height = `${r.height}px`;
        focus.style.transform = `translate3d(${r.left}px, ${r.top}px, 0)`;
      } else {
        const size = 72;
        focus.style.width = `${size}px`;
        focus.style.height = `${size}px`;
        focus.style.transform = `translate3d(${pointer.x - size / 2}px, ${pointer.y - size / 2}px, 0)`;
      }
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(place); };

    const onMove = e => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      pointer = { x: e.clientX, y: e.clientY };
      const card = e.target instanceof Element ? e.target.closest(CARD_SEL) : null;
      if (card !== lockedCard) {
        lockedCard = card;
        focus.classList.toggle('is-locked', Boolean(card));
        if (card) {
          focus.classList.remove('is-hunting');
          void focus.offsetWidth;
          focus.classList.add('is-hunting');
          setExposure(card.getAttribute('data-photo-id') || card.getAttribute('data-comp-id'));
        }
      }
      schedule();
    };
    const onTouch = e => {
      const card = e.target instanceof Element ? e.target.closest(CARD_SEL) : null;
      lockedCard = card;
      focus.classList.toggle('is-locked', Boolean(card));
      if (card) setExposure(card.getAttribute('data-photo-id') || card.getAttribute('data-comp-id'));
      schedule();
    };
    const onClick = e => {
      if (!(e.target instanceof Element) || !e.target.closest(CARD_SEL)) return;
      flash.classList.remove('is-on');
      void flash.offsetWidth;
      flash.classList.add('is-on');
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('touchstart', onTouch, { passive: true });
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    document.addEventListener('click', onClick, true);
    schedule();

    const refresh = () => {
      $('.vf-rec-label').textContent = tr('viewfinderRec');
      $('.vf-shots').textContent = `[ ${photoTotal()} ]`;
    };
    refresh();
    const shotsTimer = setInterval(() => { $('.vf-shots').textContent = `[ ${photoTotal()} ]`; }, 3000);

    return {
      refresh,
      cleanup() {
        clearInterval(timeTimer);
        clearInterval(shotsTimer);
        if (raf) cancelAnimationFrame(raf);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('touchstart', onTouch);
        window.removeEventListener('scroll', schedule);
        window.removeEventListener('resize', schedule);
        document.removeEventListener('click', onClick, true);
        ui.remove();
        focus.remove();
        flash.remove();
      }
    };
  }

  /* ======================================================================
     5. 미니홈피 (2000년대 개인 홈페이지 느낌): 방문자 수 · 오늘의 기분 · 배경음악 줄 ·
        폴라로이드 사진 · 마우스를 따라 반짝이는 별
     ====================================================================== */
  function setupHomepage() {
    loadStyle(GALMURI_CSS);
    loadStyle(GAEGU_CSS);

    const top = document.createElement('div');
    top.className = 'hp-topbar';
    top.setAttribute('aria-hidden', 'true');
    top.innerHTML = `
      <span class="hp-count"></span>
      <span class="hp-mood"></span>
      <span class="hp-bgm">
        <span class="hp-eq"><i></i><i></i><i></i><i></i></span>
        <span class="hp-bgm-track"><span class="hp-bgm-text"></span></span>
      </span>
      <span class="hp-hello"></span>
    `;
    const nav = document.querySelector('.global-nav');
    if (nav) nav.after(top);
    else document.body.prepend(top);

    // 반짝이 마우스 자국
    const STARS = ['✦', '✧', '★', '♡', '✩'];
    const COLORS = ['#ff8fc7', '#ffc94d', '#8fd3ff', '#b79cff', '#7ee0b0'];
    let lastSpark = 0;
    let live = 0;
    const onMove = e => {
      if (e.pointerType !== 'mouse' || reducedMotion) return;
      const now = performance.now();
      if (now - lastSpark < 45 || live > 24) return;
      lastSpark = now;
      const s = document.createElement('span');
      s.className = 'hp-sparkle';
      s.textContent = STARS[(Math.random() * STARS.length) | 0];
      s.style.left = `${e.clientX + (Math.random() * 14 - 7)}px`;
      s.style.top = `${e.clientY + (Math.random() * 14 - 7)}px`;
      s.style.color = COLORS[(Math.random() * COLORS.length) | 0];
      s.style.fontSize = `${10 + Math.random() * 10}px`;
      live += 1;
      s.addEventListener('animationend', () => { s.remove(); live -= 1; });
      document.body.appendChild(s);
    };
    if (finePointer) window.addEventListener('pointermove', onMove, { passive: true });

    const refresh = () => {
      const d = new Date();
      const today = 7 + ((d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate()) % 53);
      const total = 3000 + photoTotal() * 123 + today;
      const fmt = n => n.toLocaleString(typeof currentLang !== 'undefined' && currentLang === 'en' ? 'en-US' : 'ko-KR');
      top.querySelector('.hp-count').innerHTML = esc(tr('cyTodayTotal', fmt(today), fmt(total)))
        .replace(/(\d[\d,]*)/g, '<b>$1</b>');
      top.querySelector('.hp-mood').textContent = tr('cyMood');
      top.querySelector('.hp-bgm-text').textContent = tr('cyBgm');
      top.querySelector('.hp-hello').textContent = tr('cyHello');
    };
    refresh();

    return {
      refresh,
      cleanup() {
        window.removeEventListener('pointermove', onMove);
        document.querySelectorAll('.hp-sparkle').forEach(s => s.remove());
        top.remove();
      }
    };
  }

  const SETUPS = {
    win98: setupWin98,
    hacker: setupHacker,
    gravity: setupGravity,
    viewfinder: setupViewfinder,
    homepage: setupHomepage
  };

  /* ---------- 버튼 연결 ---------- */
  function init() {
    const btn = document.getElementById('btnMood');
    if (btn) btn.addEventListener('click', nextMood);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
