/* ==========================================================================
   기분전환: 맨 아래 '기분전환' 버튼을 누르면 분위기 고르기 창이 열림
   고른 분위기는 어디에도 저장하지 않으므로 새로고침하면 원래대로 돌아옴
   분위기 목록: 윈도우 98 · 해커 터미널 · 중력 · 카메라 뷰파인더 · 미니홈피 ·
               거꾸로 · 우주 공간 · 커뮤니티 게시판 · 암실 · 김 서린 창문 · 미술관 경매 · 첫눈 · 8비트
   (메뉴 이름 같은 공통 문구는 app.js의 t()를, 분위기 문구는 아래 MOOD_TEXT를 씀)
   ========================================================================== */
(function () {
  const MOODS = [
    'win98', 'hacker', 'gravity', 'viewfinder', 'homepage',
    'upside', 'space', 'board', 'darkroom', 'fog', 'museum', 'snow', 'pixel', 'vn'
  ];
  const ICONS = {
    win98: '🪟', hacker: '💻', gravity: '🍎', viewfinder: '📷', homepage: '💌',
    upside: '🙃', space: '🚀', board: '💬', darkroom: '🔴', fog: '🌧️', museum: '🖼️', snow: '❄️', pixel: '👾', vn: '💕',
    random: '🎲', normal: '↩️'
  };
  const GALMURI_CSS = 'https://cdn.jsdelivr.net/npm/galmuri@2.40.3/dist/galmuri.css';
  const GAEGU_CSS = 'https://fonts.googleapis.com/css2?family=Gaegu:wght@400;700&display=swap';
  const MATTER_JS = 'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js';

  const MOOD_TEXT = {
    ko: {
      names: {
        win98: '윈도우 98', hacker: '해커 터미널', gravity: '중력', viewfinder: '카메라 뷰파인더', homepage: '미니홈피',
        upside: '거꾸로', space: '우주 공간', board: '커뮤니티 게시판', darkroom: '암실', fog: '김 서린 창문',
        museum: '미술관 경매', snow: '첫눈', pixel: '8비트', vn: '미연시', random: '아무거나', normal: '원래대로'
      },
      descs: {
        win98: '회색 창과 작업 표시줄', hacker: '검은 화면 초록 글자', gravity: '다 떨어진다, 잡아서 던지기',
        viewfinder: '초점 맞추고 찰칵', homepage: '2000년대 감성 홈피', upside: '세상이 뒤집혔다',
        space: '별 사이를 떠다니는 사진', board: '사진이 게시글이 된다', darkroom: '빨간 불 아래 현상 중',
        fog: '문질러서 닦아 보기', museum: '추정가 38억', snow: '액자 위에 눈이 쌓인다', pixel: '도트로 깨진 사진',
        vn: '마오 · 소라 · 후드가 사진을 소개해요',
        random: '뭐가 나올지 몰라요', normal: '처음 모습으로'
      },
      pickerTitle: '기분전환',
      pickerSub: '골라서 사이트 분위기를 바꿔 보세요. 새로고침하면 원래대로 돌아와요.',
      current: '지금',
      change: '바꾸기',
      close: '닫기',
      toast: name => `기분전환: ${name}`,
      toastOff: '원래 분위기로 돌아왔어요',
      luckyToast: name => `🎲 10번에 한 번 당첨! 오늘은 '${name}' (오른쪽 아래 ✕로 원래대로)`,
      weatherSnow: seoul => `${seoul ? '지금 서울에' : '지금 계신 곳에'} 눈이 와요 ❄️ 사이트에도 눈이 내려요`,
      weatherRain: seoul => `${seoul ? '지금 서울에' : '지금 계신 곳에'} 비가 와요 🌧️ 사이트에도 비가 내려요`,
      loadFail: '효과를 불러오지 못했어요. 인터넷 연결을 확인해 주세요.',
      gravityHint: '사진을 잡아서 던져 보세요',
      gravityReset: '다시 떨어뜨리기',
      hackerBoot: ['> 갤러리 서버 접속 중...', '> 접근 권한 확인... 승인', '> 사진 복호화 중... 100%', '> 환영합니다, 관람객님'],
      winTitle: '갤러리 - 탐색기',
      winStart: '시작',
      winShutdown: '시스템 종료 (원래대로)',
      rec: 'REC',
      hpCount: (today, total) => `TODAY ${today} | TOTAL ${total}`,
      hpMood: '오늘의 기분: 감성충만',
      hpBgm: '♪ 배경음악: 잔잔한 피아노 (재생 중)',
      hpHello: '방문해 주셔서 감사합니다 ^^',
      upsideHint: '세상이 뒤집혔어요. 클릭은 그대로 돼요',
      spaceDist: n => ` · 지구에서 ${n}광년`,
      constellation: name => `${name}자리`,
      darkroomHint: '사진이 천천히 현상돼요. 마우스를 올리면 불이 켜져요',
      fogHint: '창문을 문질러 보세요 (마우스를 움직이면 닦여요)',
      museumSale: ' · 오늘 밤 8시 특별 경매',
      museumMedium: year => `디지털 프린트, ${year}`,
      museumPrice: n => `추정가 ₩${n.toLocaleString('ko-KR')}`,
      museumSold: '낙찰',
      snowHint: '사진에 마우스를 올리면 쌓인 눈이 털려요',
      pixelScore: n => ` · HI-SCORE ${String(n).padStart(6, '0')}`,
      pixelStart: '▶ PRESS START',
      vn: {
        names: { mao: '마오', sora: '소라', hood: '후드' },
        choices: { big: '이 사진 크게 볼래', praise: '칭찬해 주기 ♥', next: '다음 사진 보여 줘' },
        affinity: '호감도',
        save: '세이브 슬롯이 가득 찼어요… 대신 사진은 갤러리에 전부 저장돼 있어요!',
        hint: '화면을 누르거나 스페이스를 누르면 다음 대사로 넘어가요',
        lines: {
          mao: {
            intro: ['어서 와요, 선배! 오늘은 저희가 사진 구경 시켜 줄게요!'],
            own: ['이거 제 사진이에요! {topic} 주제 때 후지 중형으로 찍었어요. 무거웠지만 그만한 가치가 있죠?', '짠! 마오 작품이에요. {topic}… 이번엔 꽤 자신 있었다고요!'],
            ownWin: ['후후, 이건 제가 우승한 사진! 소라 선배를 이긴 날이라 절대 못 잊어요!'],
            sora: ['소라 선배 사진이네요… 분하지만 인정. 하늘 색감은 진짜 못 이기겠어요.', '소라 선배는 니콘 하나로 어떻게 이렇게 찍는 거지…?'],
            soraWin: ['또 소라 선배 우승작… 다음엔 꼭 이길 거예요. 진짜로!'],
            hood: ['후드 선배 사진이다! 평소엔 안 보이다가 이런 걸 툭 내놓는다니까요.'],
            hoodWin: ['후드 선배는 한 번 나오면 바로 우승이라니까요. 반칙이에요!'],
            other: ['{author} 님 사진이에요! 저도 이 구도 따라 해 봐야지~', '{author} 님은 {topic} 주제를 이렇게 풀었구나. 오오…!'],
            ongoing: ['이건 지금 투표 중인 작품이에요. 누가 찍었는지는… 비밀! 히히.'],
            flavor: ['참고로 오늘도 카메라 세 대 들고 왔어요. 어깨가 좀… 아프네요.', '야시카로 찍은 필름은 아직 현상 중이에요. 기대해 주세요!', '저 소마대전 한 번도 안 빠졌어요! 개근상 같은 거 없나요?'],
            thanks: ['헤헤, 칭찬받았다! 오늘 하루 종일 기분 좋을 거예요!']
          },
          sora: {
            intro: ['어서 와. 오늘은 우리가 사진을 안내해 줄게. 천천히 봐.'],
            own: ['내 사진이네. {topic} 주제였지. Z6III로 하늘 톤 맞추느라 꽤 기다렸어.', '이건 내가 찍은 거야. 빛이 딱 좋은 순간이었거든.'],
            ownWin: ['이건 우승작이야. …뭐, 당연한 결과지만. 후훗.'],
            mao: ['마오 사진이구나. 열정만큼은 동아리 최고야. 나도 방심 못 하겠는걸?', '카메라를 세 대나 들고 다니더니… 결과물은 확실하네, 마오.'],
            maoWin: ['이번엔 마오가 이겼지. 인정할게. …다음은 없겠지만.'],
            hood: ['후드 사진… 말수는 적어도 사진은 늘 많은 걸 말해.'],
            hoodWin: ['후드는 가끔 나와서 이렇게 가져가 버린다니까. 무서운 아이야.'],
            other: ['{author}의 사진이야. 빛을 읽는 눈이 좋네.', '{topic} 주제를 이렇게 해석했구나, {author}. 좋은 시선이야.'],
            ongoing: ['투표 중인 작품이니까 누가 찍었는지는 아직 말 못 해. 너는 몇 번에 투표할 거야?'],
            flavor: ['좋은 사진은 장비보다 기다림이야. 이 장면도 그랬을 거야.', '하늘을 찍을 땐 노출을 살짝 낮춰 봐. 색이 깊어져.'],
            thanks: ['…칭찬은 익숙하지만, 네가 해 주니까 조금 다르네.']
          },
          hood: {
            intro: ['…왔구나. …사진, 같이 볼래?'],
            own: ['…이거, 내 거. {topic}. 소니로 찍었어.', '…내 사진. 오래 기다렸어. 빛이 들어올 때까지.'],
            ownWin: ['…우승했었지. 햇빛이 좋았어. 그게 다야.'],
            mao: ['…마오. 카메라 세 대 들고 다니는 애. …사진은 좋아.'],
            maoWin: ['…마오가 이겼네. 축하해. (작게 박수)'],
            sora: ['…소라 선배. 역시 하늘은 잘 찍어.'],
            soraWin: ['…또 소라 선배. 놀랍지도 않아.'],
            other: ['…{author}. 이거, 좋네.', '…{topic}. 이렇게 찍을 수도 있구나.'],
            ongoing: ['…투표 중. 누군지는 비밀.'],
            flavor: ['…(하품) 아, 미안. 계속 봐.', '…필름은 니콘으로 찍어. 수동이라 좋아.'],
            thanks: ['…! …고, 고마워.']
          }
        }
      },
      board: {
        title: '각자의 프레임 갤러리',
        info: '사진 찍는 사람들 모임 · 매니저 웰컴',
        tabAll: '전체글',
        tabBest: '개념글',
        cols: ['번호', '제목', '글쓴이', '조회', '추천'],
        noticeTag: '공지',
        notice: '사진 파일 이름은 작가 이름으로 올려 주세요 (예: 소라.jpg)',
        noticeBy: '운영자',
        photoTag: '사진',
        bestTag: '개념',
        anon: 'ㅇㅇ',
        reco: '추천',
        unreco: '비추',
        empty: '글이 없습니다.',
        titles: [
          '{t} 찍어 봄', '{t} 출품합니다', '이거 잘 나온 거 맞냐?', '폰카로 찍음 ㅇㅇ', '보정 하나도 안 함 (진짜임)',
          '{t} 주제 생각보다 어렵네', '구도 평가 좀', '오늘 건진 사진', '날씨가 다 했다', '이게 내 최선이다'
        ],
        ongoingTitle: n => `${n}번 출품작`,
        comments: [
          '구도 지렸다', '이게 폰카라고?', '색감 미쳤네', '주제랑 딱 맞는 듯', 'ㄹㅇ 감성 있음',
          '이거 우승각인데', '보정 뭐 씀?', '사진 잘 찍네 ㄷㄷ', '저장해 감', '와 분위기 좋다'
        ]
      }
    },
    en: {
      names: {
        win98: 'Windows 98', hacker: 'Hacker terminal', gravity: 'Gravity', viewfinder: 'Camera viewfinder', homepage: 'Retro homepage',
        upside: 'Upside down', space: 'Outer space', board: 'Forum board', darkroom: 'Darkroom', fog: 'Foggy window',
        museum: 'Museum auction', snow: 'First snow', pixel: '8-bit', vn: 'Dating sim', random: 'Surprise me', normal: 'Back to normal'
      },
      descs: {
        win98: 'Gray windows and a taskbar', hacker: 'Green text on black', gravity: 'Everything falls, throw it around',
        viewfinder: 'Focus and click', homepage: '2000s personal homepage', upside: 'The world flipped',
        space: 'Photos floating among stars', board: 'Photos become forum posts', darkroom: 'Developing under red light',
        fog: 'Wipe the glass to see', museum: 'Estimate: $2.9M', snow: 'Snow piles on the frames', pixel: 'Pixelated photos',
        vn: 'Mao, Sora and Hood show you the photos',
        random: 'No idea what you’ll get', normal: 'The usual look'
      },
      pickerTitle: 'Mood swap',
      pickerSub: 'Pick a mood for the site. Refresh to go back.',
      current: 'Now',
      change: 'Change',
      close: 'Close',
      toast: name => `Mood: ${name}`,
      toastOff: 'Back to the usual look',
      luckyToast: name => `🎲 1-in-10 surprise: ${name} (✕ at the bottom right to go back)`,
      weatherSnow: seoul => `It’s snowing ${seoul ? 'in Seoul' : 'where you are'} right now ❄️ so it’s snowing here too`,
      weatherRain: seoul => `It’s raining ${seoul ? 'in Seoul' : 'where you are'} right now 🌧️ so it’s raining here too`,
      loadFail: 'Couldn’t load the effect. Check your connection.',
      gravityHint: 'Grab a photo and throw it',
      gravityReset: 'Drop again',
      hackerBoot: ['> Connecting to gallery server...', '> Checking access... granted', '> Decrypting photos... 100%', '> Welcome, visitor'],
      winTitle: 'Gallery - Explorer',
      winStart: 'Start',
      winShutdown: 'Shut down (back to normal)',
      rec: 'REC',
      hpCount: (today, total) => `TODAY ${today} | TOTAL ${total}`,
      hpMood: 'Mood of the day: all the feels',
      hpBgm: '♪ BGM: soft piano (playing)',
      hpHello: 'Thanks for stopping by ^^',
      upsideHint: 'The world flipped. Clicking still works',
      spaceDist: n => ` · ${n} light-years from Earth`,
      constellation: name => `Constellation ${name}`,
      darkroomHint: 'Photos develop slowly. Hover to turn the light on',
      fogHint: 'Wipe the window (move the mouse to clear it)',
      museumSale: ' · Special auction tonight at 8',
      museumMedium: year => `Digital print, ${year}`,
      museumPrice: n => `Estimate $${Math.round(n / 1300).toLocaleString('en-US')}`,
      museumSold: 'Sold',
      snowHint: 'Hover a photo to shake the snow off',
      pixelScore: n => ` · HI-SCORE ${String(n).padStart(6, '0')}`,
      pixelStart: '▶ PRESS START',
      vn: {
        names: { mao: 'Mao', sora: 'Sora', hood: 'Hood' },
        choices: { big: 'Show this one bigger', praise: 'Give a compliment ♥', next: 'Next photo, please' },
        affinity: 'Affection',
        save: 'Save slots are full… but every photo is saved in the gallery!',
        hint: 'Click or press Space to continue',
        lines: {
          mao: {
            intro: ['Welcome! Today we’re giving you the photo tour!'],
            own: ['This one’s mine! Shot it on the Fuji medium format for {topic}. Heavy, but worth it, right?', 'Ta-da! A Mao original. I was pretty confident about {topic}!'],
            ownWin: ['Hehe, this is the one that won! The day I beat Sora. Never forgetting it!'],
            sora: ['Sora’s photo… annoying, but fine. Nobody beats her skies.', 'How does Sora do this with just one Nikon…?'],
            soraWin: ['Another Sora win… I’ll beat her next time. For real!'],
            hood: ['A Hood photo! Never around, then drops something like this.'],
            hoodWin: ['Hood shows up once and wins. That’s cheating!'],
            other: ['This is {author}’s! I’m stealing this composition~', 'So that’s how {author} took on {topic}. Ooh…!'],
            ongoing: ['This one’s still up for a vote. Who shot it? …Secret! Hehe.'],
            flavor: ['I brought three cameras again today. My shoulders… hurt.', 'My Yashica film is still being developed. Stay tuned!', 'I haven’t missed a single round! Is there a perfect-attendance award?'],
            thanks: ['Hehe, a compliment! I’ll be happy all day!']
          },
          sora: {
            intro: ['Welcome. We’ll show you around the photos today. Take your time.'],
            own: ['Mine. The {topic} round. I waited a while to get the sky tones right on the Z6III.', 'I took this one. The light was just right.'],
            ownWin: ['This one won. …Well, of course. Hehe.'],
            mao: ['Mao’s photo. Nobody in the club has more passion. I can’t let my guard down.', 'All those cameras… and the results show, Mao.'],
            maoWin: ['Mao won this one. I’ll admit it. …It won’t happen again.'],
            hood: ['Hood’s photo… quiet, but the pictures always say a lot.'],
            hoodWin: ['Hood shows up now and then and just takes it. Scary kid.'],
            other: ['This is {author}’s. A good eye for light.', 'So that’s how you read {topic}, {author}. Nice.'],
            ongoing: ['It’s still being voted on, so I can’t say who took it. Which number are you voting for?'],
            flavor: ['Good photos come from patience more than gear. This one too, I bet.', 'For skies, try a little less exposure. The color gets deeper.'],
            thanks: ['…I’m used to compliments, but it feels different from you.']
          },
          hood: {
            intro: ['…You came. …Want to look at photos together?'],
            own: ['…This is mine. {topic}. Shot on the Sony.', '…My photo. I waited a long time for the light.'],
            ownWin: ['…It won. The sunlight was nice. That’s all.'],
            mao: ['…Mao. The one with three cameras. …Nice photo.'],
            maoWin: ['…Mao won. Congrats. (quiet clapping)'],
            sora: ['…Sora. She’s good at skies.'],
            soraWin: ['…Sora again. Not surprised.'],
            other: ['…{author}. This is nice.', '…{topic}. You can shoot it like this, huh.'],
            ongoing: ['…Being voted on. Who took it is a secret.'],
            flavor: ['…(yawn) Oh, sorry. Keep looking.', '…I shoot film on the Nikon. Manual. I like it.'],
            thanks: ['…! …Th-thanks.']
          }
        }
      },
      board: {
        title: 'Frames of Our Own board',
        info: 'A club for people who take photos · Manager 웰컴',
        tabAll: 'All posts',
        tabBest: 'Best',
        cols: ['No.', 'Title', 'Author', 'Views', 'Likes'],
        noticeTag: 'Notice',
        notice: 'Please name photo files after the photographer (e.g. 소라.jpg)',
        noticeBy: 'Admin',
        photoTag: 'Photo',
        bestTag: 'Best',
        anon: 'anon',
        reco: 'Like',
        unreco: 'Dislike',
        empty: 'No posts.',
        titles: [
          'Tried shooting {t}', 'My entry for {t}', 'Did this come out ok?', 'Shot on my phone', 'Zero editing (for real)',
          '{t} is harder than it looks', 'Rate my composition', 'Today’s keeper', 'The weather did all the work', 'This is my best'
        ],
        ongoingTitle: n => `Entry No. ${n}`,
        comments: [
          'Composition is insane', 'This is a phone shot?', 'Those colors', 'Fits the theme perfectly', 'So moody',
          'This one wins', 'What did you edit with?', 'Nice shot', 'Saved', 'Love the vibe'
        ]
      }
    }
  };

  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  let moodIndex = -1; // -1 = 원래 모습
  let cleanup = null; // 지금 켜진 분위기를 끌 때 실행할 정리 함수
  let refreshTexts = null; // 지금 켜진 분위기의 문구를 다시 쓰는 함수 (한/EN 전환용)
  let pill = null;
  let pickerEl = null;
  let pickerOpener = null;
  let weatherAutoIndex = null; // 날씨 때문에 저절로 켜진 분위기
  const WEATHER_OFF_KEY = 'gallery-weather-off';
  const WEATHER_CACHE_KEY = 'gallery-weather';

  const lang = () => (typeof currentLang !== 'undefined' && currentLang === 'en' ? 'en' : 'ko');
  const L = (key, ...args) => {
    const table = MOOD_TEXT[lang()];
    const entry = key in table ? table[key] : MOOD_TEXT.ko[key];
    return typeof entry === 'function' ? entry(...args) : entry;
  };
  const tr = (key, ...args) => (typeof t === 'function' ? t(key, ...args) : key);
  const toast = msg => { if (typeof showAppleToast === 'function') showAppleToast(msg); };
  const moodName = key => L('names')[key] || key;
  const photoTotal = () => (typeof allPhotos !== 'undefined' && Array.isArray(allPhotos) ? allPhotos.length : 0);
  const esc = str => String(str == null ? '' : str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  // 사진 id로 정하는 '늘 같은' 난수 (조회수 · 경매가 같은 가짜 숫자가 새로고침해도 그대로)
  const hash = str => [...String(str)].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 2166136261);
  const findPhoto = id => (typeof allPhotos !== 'undefined' ? allPhotos.find(p => p.id === id) : null);

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

  /* 사진 카드가 새로 그려질 때마다(목차 · 검색 · 더보기 · 화면 전환) 알려 줌 */
  function watchCards(onChange) {
    let queued = false;
    const run = () => {
      queued = false;
      onChange([...document.querySelectorAll('.photo-card:not(.is-skeleton)')]);
    };
    const mo = new MutationObserver(muts => {
      const touched = muts.some(m => [...m.addedNodes].some(n =>
        n.nodeType === 1 && (n.classList.contains('photo-card') || n.classList.contains('comp-archive-card') || n.querySelector('.photo-card, .comp-archive-card'))
      ));
      if (touched && !queued) {
        queued = true;
        setTimeout(run, 0);
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    run();
    return () => mo.disconnect();
  }

  // 화면에 보이는 사진 카드와 사진 칸 위치
  function visibleCardRects() {
    return [...document.querySelectorAll('.photo-card:not(.is-skeleton)')]
      .map(card => {
        const media = card.querySelector('.photo-media-wrap') || card;
        return { card, rect: media.getBoundingClientRect() };
      })
      .filter(({ rect }) => rect.width > 0 && rect.bottom > -40 && rect.top < window.innerHeight + 40);
  }

  // 화면 크기에 맞춘 캔버스 (선명하도록 화면 배율 반영, 너무 크면 1.5배까지만)
  function makeCanvas(className, onResize) {
    const canvas = document.createElement('canvas');
    canvas.className = className;
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const state = { canvas, ctx, w: 0, h: 0, dpr: 1 };
    const resize = () => {
      state.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      state.w = window.innerWidth;
      state.h = window.innerHeight;
      canvas.width = Math.round(state.w * state.dpr);
      canvas.height = Math.round(state.h * state.dpr);
      ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
      if (onResize) onResize(state);
    };
    resize();
    window.addEventListener('resize', resize);
    state.destroy = () => {
      window.removeEventListener('resize', resize);
      canvas.remove();
    };
    return state;
  }

  // 화면이 안 보일 때는 멈추는 애니메이션 반복
  function animate(step) {
    let raf = null;
    let stopped = false;
    let last = performance.now();
    const loop = now => {
      if (stopped) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      step(dt, now);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
    };
  }

  /* ======================================================================
     전환 · 고르기 창 · 오른쪽 아래 막대
     ====================================================================== */
  function setMood(index, options = {}) {
    // 날씨로 저절로 켜진 분위기를 직접 끄거나 바꾸면, 이번 방문 동안은 날씨로 다시 켜지 않음
    if (weatherAutoIndex !== null && index !== weatherAutoIndex) {
      weatherAutoIndex = null;
      try { sessionStorage.setItem(WEATHER_OFF_KEY, '1'); } catch (e) {}
    }
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
      toast(L('toastOff'));
      return;
    }

    const mood = MOODS[index];
    root.setAttribute('data-mood', mood);
    renderPill();
    toast(L('toast', moodName(mood)));
    const result = SETUPS[mood](options) || {};
    cleanup = result.cleanup || null;
    refreshTexts = result.refresh || null;
  }

  function pick(key) {
    if (key === 'normal') {
      if (moodIndex >= 0) setMood(-1);
      return;
    }
    if (key === 'random') {
      const choices = MOODS.map((m, i) => i).filter(i => i !== moodIndex);
      setMood(choices[Math.floor(Math.random() * choices.length)]);
      return;
    }
    const index = MOODS.indexOf(key);
    if (index >= 0 && index !== moodIndex) setMood(index);
  }

  function pickerTile(key) {
    const isCurrent = (key === 'normal' && moodIndex < 0) || MOODS[moodIndex] === key;
    return `
      <button type="button" class="mood-tile ${isCurrent ? 'is-current' : ''} ${key === 'random' || key === 'normal' ? 'is-special' : ''}" data-pick="${key}">
        <span class="mood-tile-icon" aria-hidden="true">${ICONS[key]}</span>
        <span class="mood-tile-name">${esc(moodName(key))}</span>
        <span class="mood-tile-desc">${esc(L('descs')[key] || '')}</span>
        ${isCurrent ? `<span class="mood-tile-now">${esc(L('current'))}</span>` : ''}
      </button>
    `;
  }

  function openPicker(opener) {
    closePicker(false);
    pickerOpener = opener || document.activeElement;
    pickerEl = document.createElement('div');
    pickerEl.className = 'mood-picker-backdrop';
    pickerEl.innerHTML = `
      <div class="mood-picker" role="dialog" aria-modal="true" aria-labelledby="moodPickerTitle">
        <div class="mood-picker-head">
          <h2 id="moodPickerTitle" class="mood-picker-title">${esc(L('pickerTitle'))}</h2>
          <p class="mood-picker-sub">${esc(L('pickerSub'))}</p>
          <button type="button" class="mood-picker-x" data-close aria-label="${esc(L('close'))}">✕</button>
        </div>
        <div class="mood-picker-grid">
          ${['random', 'normal', ...MOODS].map(pickerTile).join('')}
        </div>
      </div>
    `;
    pickerEl.addEventListener('click', e => {
      if (e.target === pickerEl || e.target.closest('[data-close]')) {
        closePicker();
        return;
      }
      const tile = e.target.closest('[data-pick]');
      if (!tile) return;
      const key = tile.getAttribute('data-pick');
      closePicker(false);
      pick(key);
    });
    document.body.appendChild(pickerEl);
    document.documentElement.classList.add('mood-picker-open');
    const first = pickerEl.querySelector('.mood-tile.is-current') || pickerEl.querySelector('.mood-tile');
    if (first) first.focus({ preventScroll: true });
  }

  function closePicker(restoreFocus = true) {
    if (!pickerEl) return;
    pickerEl.remove();
    pickerEl = null;
    document.documentElement.classList.remove('mood-picker-open');
    if (restoreFocus && pickerOpener && document.body.contains(pickerOpener)) pickerOpener.focus({ preventScroll: true });
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && pickerEl) {
      e.stopPropagation();
      closePicker();
    }
  }, true);

  /* 화면 오른쪽 아래 작은 막대: 지금 분위기 · 바꾸기(고르기 창) · 원래대로 */
  function renderPill() {
    if (!pill) {
      pill = document.createElement('div');
      pill.className = 'mood-pill';
      pill.setAttribute('role', 'group');
      pill.addEventListener('click', e => {
        const btn = e.target.closest('button[data-act]');
        if (!btn) return;
        const act = btn.getAttribute('data-act');
        if (act === 'pick') openPicker(btn);
        else if (act === 'off') setMood(-1);
        else if (act === 'reset' && typeof pill._reset === 'function') pill._reset();
      });
      document.body.appendChild(pill);
    }
    const mood = MOODS[moodIndex];
    const reset = pill._reset;
    pill.setAttribute('aria-label', tr('moodBtn'));
    pill.innerHTML = `
      <span class="mood-pill-name"><span aria-hidden="true">${ICONS[mood]}</span> ${esc(moodName(mood))}</span>
      ${mood === 'gravity' ? `<button type="button" data-act="reset">${esc(L('gravityReset'))}</button>` : ''}
      <button type="button" data-act="pick" aria-haspopup="dialog">${esc(L('change'))}</button>
      <button type="button" data-act="off" class="mood-pill-off" aria-label="${esc(moodName('normal'))}" title="${esc(moodName('normal'))}">✕</button>
    `;
    pill._reset = reset;
  }

  function removePill() {
    if (pill) pill.remove();
    pill = null;
  }

  // app.js의 setLanguage()가 부름
  window.refreshMoodTexts = function () {
    if (pickerEl) openPicker(pickerOpener);
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
      } else if (go === 'moods') {
        openPicker(startBtn);
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
      clock.textContent = new Date().toLocaleTimeString(lang() === 'en' ? 'en-US' : 'ko-KR', { hour: 'numeric', minute: '2-digit' });
    };
    const timer = setInterval(tick, 15000);

    const refresh = () => {
      root.style.setProperty('--mood-win-title', JSON.stringify(L('winTitle')));
      bar.querySelector('.w98-start-label').textContent = L('winStart');
      bar.querySelector('.w98-task-label').textContent = L('winTitle');
      menu.innerHTML = `
        <div class="w98-menu-side" aria-hidden="true"><span>Gallery 98</span></div>
        <div class="w98-menu-items">
          <button type="button" role="menuitem" data-go="gallery">🖼️ ${esc(tr('navGallery'))}</button>
          <button type="button" role="menuitem" data-go="competitions">📁 ${esc(tr('navContests'))}</button>
          <button type="button" role="menuitem" data-go="mini">📂 ${esc(tr('navMini'))}</button>
          <button type="button" role="menuitem" data-go="moods">🎨 ${esc(L('pickerTitle'))}</button>
          <hr />
          <button type="button" role="menuitem" data-go="off">⏻ ${esc(L('winShutdown'))}</button>
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
    const bootLines = L('hackerBoot');
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

    // 첫머리(제목 띠)에만 초록 글자 비
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
      toast(L('gravityHint'));
    }).catch(() => {
      if (!cancelled) toast(L('loadFail'));
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
    const setExposure = id => {
      const h = hash(id || 'idle');
      $('.vf-shutter').textContent = SHUTTERS[h % SHUTTERS.length];
      $('.vf-aperture').textContent = APERTURES[(h >>> 3) % APERTURES.length];
      $('.vf-iso').textContent = ISOS[(h >>> 6) % ISOS.length];
      $('.vf-ev').textContent = EVS[(h >>> 9) % EVS.length];
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
      $('.vf-rec-label').textContent = L('rec');
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
      const fmt = n => n.toLocaleString(lang() === 'en' ? 'en-US' : 'ko-KR');
      top.querySelector('.hp-count').innerHTML = esc(L('hpCount', fmt(today), fmt(total)))
        .replace(/(\d[\d,]*)/g, '<b>$1</b>');
      top.querySelector('.hp-mood').textContent = L('hpMood');
      top.querySelector('.hp-bgm-text').textContent = L('hpBgm');
      top.querySelector('.hp-hello').textContent = L('hpHello');
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

  /* ======================================================================
     6. 거꾸로: 화면이 위아래로 뒤집힘 (보던 자리는 그대로, 클릭은 그대로 됨)
        큰 덩어리의 순서를 거꾸로 하고 덩어리마다 180° 돌리면 화면 전체를 뒤집은 것과 같음
        → 알림 · 크게 보기 · 고르기 창 같은 떠 있는 것은 뒤집히지 않아서 계속 쓸 수 있음
     ====================================================================== */
  function setupUpside() {
    const root = document.documentElement;
    const mirrorScroll = () => {
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      window.scrollTo(0, Math.max(0, max - window.scrollY));
    };
    mirrorScroll();
    if (!reducedMotion) root.classList.add('upside-anim');
    const timer = setTimeout(() => root.classList.remove('upside-anim'), 1000);
    toast(L('upsideHint'));

    return {
      cleanup() {
        clearTimeout(timer);
        root.classList.remove('upside-anim');
        // 원래대로 돌아간 뒤에도 보던 자리가 화면에 남도록
        setTimeout(mirrorScroll, 0);
      }
    };
  }

  /* ======================================================================
     7. 우주 공간: 워프로 들어가서 별밭 위를 떠다니는 사진
        같은 작가 사진에 마우스를 올리면 별자리처럼 이어짐 ('소라자리')
     ====================================================================== */
  function setupSpace() {
    const root = document.documentElement;
    root.style.setProperty('--space-dist', JSON.stringify(L('spaceDist', photoTotal() || 0)));

    let stars = [];
    let warp = reducedMotion ? 0 : 1.3; // 남은 워프 시간(초)
    let shooting = null;
    let nextShoot = 4;
    const sky = makeCanvas('space-sky', s => {
      const count = Math.min(650, Math.round((s.w * s.h) / 2300));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * s.w,
        y: Math.random() * s.h,
        z: Math.random() * 0.8 + 0.2, // 가까울수록 크고 빠르게 움직임
        tw: Math.random() * Math.PI * 2
      }));
    });
    const { ctx } = sky;

    const draw = (dt, now) => {
      const { w, h } = sky;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      if (warp > 0) {
        // 워프: 가운데에서 바깥으로 별이 길게 늘어나며 지나감
        warp -= dt;
        const k = Math.max(0, warp) / 1.3;
        ctx.lineCap = 'round';
        stars.forEach(st => {
          const dx = st.x - cx;
          const dy = st.y - cy;
          const stretch = 1 + k * 0.9 * st.z;
          ctx.strokeStyle = `rgba(200, 225, 255, ${0.35 + 0.6 * st.z})`;
          ctx.lineWidth = st.z * 1.6;
          ctx.beginPath();
          ctx.moveTo(cx + dx / stretch, cy + dy / stretch);
          ctx.lineTo(cx + dx * (1 + k * 0.15), cy + dy * (1 + k * 0.15));
          ctx.stroke();
        });
        return;
      }
      // 별밭: 깜빡이고, 스크롤하면 가까운 별이 더 많이 움직임
      const scroll = window.scrollY;
      stars.forEach(st => {
        const y = ((st.y - scroll * st.z * 0.25) % h + h) % h;
        const a = 0.45 + 0.55 * Math.abs(Math.sin(st.tw + now / 900 * st.z));
        ctx.fillStyle = `rgba(225, 235, 255, ${a * (0.4 + st.z * 0.6)})`;
        const r = st.z * 1.3;
        ctx.fillRect(st.x - r / 2, y - r / 2, r, r);
      });
      // 가끔 별똥별
      nextShoot -= dt;
      if (!shooting && nextShoot <= 0) {
        shooting = { x: Math.random() * w * 0.7 + w * 0.2, y: Math.random() * h * 0.35, life: 0 };
        nextShoot = 5 + Math.random() * 6;
      }
      if (shooting) {
        shooting.life += dt;
        const p = shooting.life / 0.9;
        const x = shooting.x - p * 260;
        const y = shooting.y + p * 120;
        const grad = ctx.createLinearGradient(x, y, x + 90, y - 42);
        grad.addColorStop(0, `rgba(255, 255, 255, ${1 - p})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 90, y - 42);
        ctx.stroke();
        if (p >= 1) shooting = null;
      }
    };
    const stopAnim = reducedMotion ? (draw(0, 0), () => {}) : animate(draw);

    // 별자리: 같은 작가 사진끼리 선으로 잇기
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'space-lines');
    svg.setAttribute('aria-hidden', 'true');
    document.body.appendChild(svg);
    let hoverAuthor = '';
    let hoverCard = null;
    const drawLines = () => {
      svg.innerHTML = '';
      if (!hoverAuthor) return;
      const nodes = visibleCardRects()
        .filter(({ card }) => card.getAttribute('data-author') === hoverAuthor)
        .map(({ card, rect }) => ({ card, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }));
      if (nodes.length < 2) return;
      const path = nodes.map((n, i) => `${i ? 'L' : 'M'}${n.x.toFixed(1)} ${n.y.toFixed(1)}`).join(' ');
      const line = document.createElementNS(svgNS, 'path');
      line.setAttribute('d', path);
      line.setAttribute('class', 'space-line');
      svg.appendChild(line);
      nodes.forEach(n => {
        const dot = document.createElementNS(svgNS, 'circle');
        dot.setAttribute('cx', n.x);
        dot.setAttribute('cy', n.y);
        dot.setAttribute('r', n.card === hoverCard ? 5 : 3.5);
        dot.setAttribute('class', 'space-star');
        svg.appendChild(dot);
      });
      const at = nodes.find(n => n.card === hoverCard) || nodes[0];
      const label = document.createElementNS(svgNS, 'text');
      label.setAttribute('x', at.x + 10);
      label.setAttribute('y', at.y - 10);
      label.setAttribute('class', 'space-label');
      label.textContent = `✦ ${L('constellation', hoverAuthor)}`;
      svg.appendChild(label);
    };
    const onOver = e => {
      const card = e.target instanceof Element ? e.target.closest('.photo-card') : null;
      const author = card ? card.getAttribute('data-author') || '' : '';
      if (card === hoverCard) return;
      hoverCard = card;
      hoverAuthor = author;
      drawLines();
    };
    const onScroll = () => { if (hoverAuthor) drawLines(); };
    document.addEventListener('pointerover', onOver);
    window.addEventListener('scroll', onScroll, { passive: true });

    return {
      refresh() {
        root.style.setProperty('--space-dist', JSON.stringify(L('spaceDist', photoTotal() || 0)));
        drawLines();
      },
      cleanup() {
        stopAnim();
        sky.destroy();
        svg.remove();
        document.removeEventListener('pointerover', onOver);
        window.removeEventListener('scroll', onScroll);
        root.style.removeProperty('--space-dist');
      }
    };
  }

  /* ======================================================================
     8. 커뮤니티 게시판: 갤러리 사진이 게시글 목록이 됨
        우승작은 '개념글', 조회 · 추천 · 댓글은 사진마다 정해진 가짜 숫자
        (특정 사이트를 흉내 내지 않은 일반 익명 게시판 모양)
     ====================================================================== */
  function setupBoard() {
    const grid = document.getElementById('photoGrid');
    const container = grid ? grid.parentElement : null;
    if (!grid || !container) return {};

    const board = document.createElement('div');
    board.className = 'bd-board';
    container.insertBefore(board, grid);

    let tab = 'all';
    const openRows = new Set();
    const votes = {};

    const topicOf = photo => {
      const group = typeof getFolderGroupName === 'function' ? getFolderGroupName(photo.folderName) : '';
      const short = typeof getFolderShortName === 'function' ? getFolderShortName(photo.folderName) : '';
      return short.replace(/\d+\s*차/, '').split(group).join(' ').replace(/\s{2,}/g, ' ').trim() || short;
    };

    const postOf = (photo, i, total) => {
      const B = L('board');
      const h = hash(photo.id);
      const meta = typeof getDisplayMeta === 'function' ? getDisplayMeta(photo) : { isAnonymous: false, headline: photo.name };
      const award = typeof getPhotoAward === 'function' && !meta.isAnonymous ? getPhotoAward(photo) : null;
      const best = Boolean(award && award.isTopWinner);
      const title = meta.isAnonymous
        ? B.ongoingTitle(photo.contestNumber || i + 1)
        : B.titles[h % B.titles.length].replace('{t}', topicOf(photo));
      const author = meta.isAnonymous ? `${B.anon}(${(h % 200) + 1}.${(h >>> 8) % 250})` : (meta.authorLabel || B.anon);
      const views = 40 + (h % 2400) + (best ? 1800 : 0);
      const likes = (h >>> 5) % 60 + (best ? 120 : 0) + (votes[photo.id] || 0);
      const comments = (h >>> 11) % 14;
      return { photo, num: 3000 + total - i, title, author, views, likes, comments, best, h };
    };

    const render = () => {
      const B = L('board');
      const list = (grid._paged && grid._paged.photos) || [];
      const posts = list.map((p, i) => postOf(p, i, list.length));
      const shown = tab === 'best' ? posts.filter(p => p.best) : posts;

      const row = post => {
        const open = openRows.has(post.photo.id);
        const cmts = B.comments;
        const commentHtml = open ? `
          <div class="bd-comments">
            ${Array.from({ length: Math.min(3, Math.max(1, post.comments)) }, (_, k) => {
              const ch = hash(post.photo.id + k);
              return `<p class="bd-comment"><b>${esc(B.anon)}(${(ch % 200) + 1}.${(ch >>> 8) % 250})</b> ${esc(cmts[ch % cmts.length])}</p>`;
            }).join('')}
            <div class="bd-votes">
              <button type="button" class="bd-vote" data-vote="up" data-id="${esc(post.photo.id)}">👍 ${esc(B.reco)} ${post.likes}</button>
              <button type="button" class="bd-vote is-down" data-vote="down" data-id="${esc(post.photo.id)}">👎 ${esc(B.unreco)}</button>
            </div>
          </div>` : '';
        return `
          <li class="bd-row ${post.best ? 'is-best' : ''}">
            <span class="bd-num">${post.num}</span>
            <span class="bd-title">
              <span class="bd-tag ${post.best ? 'is-best' : ''}">${esc(post.best ? B.bestTag : B.photoTag)}</span>
              <button type="button" class="bd-open" data-open="${esc(post.photo.id)}">
                <img class="bd-thumb" src="${esc(post.photo.thumbUrl)}" alt="" loading="lazy" referrerpolicy="no-referrer" />
                <span class="bd-title-text">${esc(post.title)}</span>
              </button>
              <button type="button" class="bd-cmt" data-cmt="${esc(post.photo.id)}" aria-expanded="${open}">[${post.comments}]</button>
            </span>
            <span class="bd-author">${esc(post.author)}</span>
            <span class="bd-views">${post.views.toLocaleString()}</span>
            <span class="bd-likes">${post.likes}</span>
            ${commentHtml}
          </li>
        `;
      };

      board.innerHTML = `
        <div class="bd-head">
          <h2 class="bd-name">${esc(B.title)}</h2>
          <p class="bd-info">${esc(B.info)}</p>
        </div>
        <div class="bd-tabs" role="tablist">
          <button type="button" class="bd-tab ${tab === 'all' ? 'active' : ''}" data-tab="all">${esc(B.tabAll)}</button>
          <button type="button" class="bd-tab ${tab === 'best' ? 'active' : ''}" data-tab="best">${esc(B.tabBest)}</button>
        </div>
        <ul class="bd-list">
          <li class="bd-row bd-cols" aria-hidden="true">${B.cols.map((c, k) => `<span class="${['bd-num', 'bd-title', 'bd-author', 'bd-views', 'bd-likes'][k]}">${esc(c)}</span>`).join('')}</li>
          <li class="bd-row is-notice">
            <span class="bd-num"><span class="bd-tag is-notice">${esc(B.noticeTag)}</span></span>
            <span class="bd-title"><span class="bd-title-text">${esc(B.notice)}</span></span>
            <span class="bd-author">${esc(B.noticeBy)}</span>
            <span class="bd-views">-</span>
            <span class="bd-likes">-</span>
          </li>
          ${shown.length ? shown.map(row).join('') : `<li class="bd-row bd-empty">${esc(B.empty)}</li>`}
        </ul>
      `;
    };

    board.addEventListener('click', e => {
      const tabBtn = e.target.closest('[data-tab]');
      if (tabBtn) {
        tab = tabBtn.getAttribute('data-tab');
        render();
        return;
      }
      const openBtn = e.target.closest('[data-open]');
      if (openBtn) {
        const list = (grid._paged && grid._paged.photos) || [];
        const idx = list.findIndex(p => p.id === openBtn.getAttribute('data-open'));
        if (idx >= 0 && typeof openLightbox === 'function') {
          filteredPhotos = list;
          lightboxShowAwards = false;
          openLightbox(idx);
        }
        return;
      }
      const cmtBtn = e.target.closest('[data-cmt]');
      if (cmtBtn) {
        const id = cmtBtn.getAttribute('data-cmt');
        if (openRows.has(id)) openRows.delete(id);
        else openRows.add(id);
        render();
        return;
      }
      const vote = e.target.closest('[data-vote]');
      if (vote) {
        const id = vote.getAttribute('data-id');
        votes[id] = (votes[id] || 0) + (vote.getAttribute('data-vote') === 'up' ? 1 : -1);
        render();
      }
    });

    // 목차 · 검색으로 사진 목록이 바뀌면 게시판도 다시 씀
    let queued = false;
    const mo = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      setTimeout(() => { queued = false; render(); }, 0);
    });
    mo.observe(grid, { childList: true });
    render();

    return {
      refresh: render,
      cleanup() {
        mo.disconnect();
        board.remove();
      }
    };
  }

  /* ======================================================================
     9. 암실: 빨간 안전등 아래 사진이 하얀 인화지에서 천천히 현상됨
        필름 테두리 · 프레임 번호 · 집게. 마우스를 올리면 불이 켜져 원래 색
     ====================================================================== */
  function setupDarkroom() {
    const lamp = document.createElement('div');
    lamp.className = 'dr-lamp';
    lamp.setAttribute('aria-hidden', 'true');
    const grain = document.createElement('div');
    grain.className = 'dr-grain';
    grain.setAttribute('aria-hidden', 'true');
    document.body.appendChild(lamp);
    document.body.appendChild(grain);
    toast(L('darkroomHint'));
    return {
      cleanup() {
        lamp.remove();
        grain.remove();
      }
    };
  }

  /* ======================================================================
     10. 김 서린 창문: 화면 앞 유리에 김이 서려 있고 빗방울이 흘러내림
         마우스(또는 손가락)로 문지르면 그 자리가 닦이고, 시간이 지나면 다시 김이 서림
     ====================================================================== */
  function setupFog(options = {}) {
    const isLight = () => document.documentElement.getAttribute('data-theme') === 'light';
    // 실제로 비가 와서 켜진 경우: 김은 옅게, 빗방울 위주 (사진이 잘 보이게)
    const thin = options.weather === 'rain' ? 0.42 : 1;

    // 유리 무늬(김 + 작은 물방울 결)는 한 번만 그려 두고, 닦은 자리(mask)만 매번 빼서 보여 줌
    // mask: 닦은 정도 (진할수록 맑음). 시간이 지나면 옅어져서 다시 김이 서림
    const texture = document.createElement('canvas');
    const mask = document.createElement('canvas');
    const tctx = texture.getContext('2d');
    const mctx = mask.getContext('2d');

    const paintTexture = s => {
      texture.width = s.canvas.width;
      texture.height = s.canvas.height;
      mask.width = s.canvas.width;
      mask.height = s.canvas.height;
      tctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
      mctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
      tctx.fillStyle = isLight() ? `rgba(226, 233, 238, ${0.86 * thin})` : `rgba(150, 162, 172, ${0.72 * thin})`;
      tctx.fillRect(0, 0, s.w, s.h);
      for (let i = 0; i < (s.w * s.h) / 900; i++) {
        tctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.18 * thin})`;
        tctx.beginPath();
        tctx.arc(Math.random() * s.w, Math.random() * s.h, Math.random() * 1.6 + 0.4, 0, Math.PI * 2);
        tctx.fill();
      }
    };
    const glass = makeCanvas('fog-glass', paintTexture);
    const rain = makeCanvas('fog-rain');
    let dirty = true;

    const wipe = (x, y, r, strength = 1) => {
      const g = mctx.createRadialGradient(x, y, r * 0.35, x, y, r);
      g.addColorStop(0, `rgba(0, 0, 0, ${strength})`);
      g.addColorStop(1, 'rgba(0, 0, 0, 0)');
      mctx.globalCompositeOperation = 'source-over';
      mctx.fillStyle = g;
      mctx.beginPath();
      mctx.arc(x, y, r, 0, Math.PI * 2);
      mctx.fill();
      dirty = true;
    };

    const render = () => {
      if (!dirty) return;
      dirty = false;
      const { ctx, canvas } = glass;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = 'copy';
      ctx.drawImage(texture, 0, 0);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.drawImage(mask, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    };

    let last = null;
    const onMove = e => {
      const x = e.clientX;
      const y = e.clientY;
      const r = e.pointerType === 'touch' ? 40 : 48;
      if (last) {
        const dist = Math.hypot(x - last.x, y - last.y);
        const steps = Math.min(30, Math.ceil(dist / (r / 3)));
        for (let i = 1; i <= steps; i++) {
          wipe(last.x + ((x - last.x) * i) / steps, last.y + ((y - last.y) * i) / steps, r);
        }
      } else {
        wipe(x, y, r);
      }
      last = { x, y };
      if (reducedMotion) render();
    };
    const onLeave = () => { last = null; };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);

    // 닦은 자리에 천천히 다시 김이 서림 (닦은 정도를 조금씩 지움)
    const refog = setInterval(() => {
      mctx.save();
      mctx.setTransform(1, 0, 0, 1, 0, 0);
      mctx.globalCompositeOperation = 'destination-out';
      mctx.fillStyle = `rgba(0, 0, 0, ${reducedMotion ? 0.02 : 0.035})`;
      mctx.fillRect(0, 0, mask.width, mask.height);
      mctx.restore();
      dirty = true;
      if (reducedMotion) render();
    }, 140);

    // 빗방울: 흘러내리면서 지나간 자리를 닦음
    let drops = [];
    const spawn = top => ({
      x: Math.random() * rain.w,
      y: top ? -20 - Math.random() * rain.h * 0.5 : Math.random() * rain.h,
      r: 1.6 + Math.random() * 2.4,
      v: 30 + Math.random() * 120,
      wob: Math.random() * Math.PI * 2
    });
    const resetDrops = () => {
      drops = Array.from({ length: Math.round(rain.w / 45) }, () => spawn(false));
    };
    resetDrops();
    window.addEventListener('resize', resetDrops);

    render();
    const stopAnim = reducedMotion ? () => {} : animate((dt, now) => {
      const { ctx, w, h } = rain;
      ctx.clearRect(0, 0, w, h);
      const dropColor = isLight() ? 'rgba(120, 140, 160, 0.55)' : 'rgba(220, 235, 245, 0.6)';
      drops.forEach((d, i) => {
        d.y += d.v * dt * (0.6 + Math.random() * 0.8);
        d.x += Math.sin(now / 400 + d.wob) * 0.15;
        wipe(d.x, d.y, d.r * 1.8, 0.5);
        ctx.fillStyle = dropColor;
        ctx.beginPath();
        ctx.ellipse(d.x, d.y, d.r, d.r * 1.35, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(d.x - d.r * 0.35, d.y - d.r * 0.4, d.r * 0.35, 0, Math.PI * 2);
        ctx.fill();
        if (d.y > h + 10) drops[i] = spawn(true);
      });
      render();
    });

    if (!options.weather) toast(L('fogHint'));

    return {
      cleanup() {
        clearInterval(refog);
        stopAnim();
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('resize', resetDrops);
        document.documentElement.removeEventListener('pointerleave', onLeave);
        glass.destroy();
        rain.destroy();
      }
    };
  }

  /* ======================================================================
     11. 미술관 경매: 금색 액자 · 흰 매트 · 작품 설명표에 가짜 추정가, 몇 점은 '낙찰' 빨간 점
     ====================================================================== */
  function setupMuseum() {
    const root = document.documentElement;
    const year = new Date().getFullYear();

    const label = cards => {
      cards.forEach(card => {
        const caption = card.querySelector('.card-caption');
        if (!caption) return;
        const h = hash(card.getAttribute('data-photo-id') || card.getAttribute('data-file') || '');
        const price = (12 + (h % 970)) * 10000000;
        const sold = h % 10 < 3;
        card.classList.toggle('mu-sold', sold);
        caption.setAttribute('data-medium', L('museumMedium', year));
        caption.setAttribute('data-price', `${L('museumPrice', price)}${sold ? ` · ${L('museumSold')}` : ''}`);
      });
    };
    const stopWatch = watchCards(label);
    const refresh = () => {
      root.style.setProperty('--museum-sale', JSON.stringify(L('museumSale')));
      label([...document.querySelectorAll('.photo-card:not(.is-skeleton)')]);
    };
    refresh();

    return {
      refresh,
      cleanup() {
        stopWatch();
        root.style.removeProperty('--museum-sale');
        document.querySelectorAll('.photo-card').forEach(card => {
          card.classList.remove('mu-sold');
          const caption = card.querySelector('.card-caption');
          if (caption) {
            caption.removeAttribute('data-medium');
            caption.removeAttribute('data-price');
          }
        });
      }
    };
  }

  /* ======================================================================
     12. 첫눈: 눈이 내리고 사진 액자 윗변에 조금씩 쌓임. 마우스를 올리면 털림
     ====================================================================== */
  function setupSnow(options = {}) {
    const piles = new Map(); // 사진 카드 → 쌓인 높이(px)
    const MAX_PILE = 16;
    let flakes = [];
    const spawn = (s, top) => ({
      x: Math.random() * s.w,
      y: top ? -10 - Math.random() * 60 : Math.random() * s.h,
      r: 1.2 + Math.random() * 2.6,
      v: 22 + Math.random() * 46,
      sway: Math.random() * Math.PI * 2
    });
    const sky = makeCanvas('snow-sky', s => {
      flakes = Array.from({ length: Math.min(170, Math.round(s.w / 8)) }, () => spawn(s, false));
    });

    let targets = [];
    const updateTargets = () => { targets = visibleCardRects(); };
    updateTargets();
    const targetTimer = setInterval(updateTargets, 400);
    window.addEventListener('scroll', updateTargets, { passive: true });

    const setPile = (card, value) => {
      piles.set(card, value);
      card.style.setProperty('--snow', `${value.toFixed(1)}px`);
    };

    const stopAnim = reducedMotion ? () => {} : animate((dt, now) => {
      const { ctx, w, h } = sky;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      // 밝은 모드에서는 흰 바탕에 묻히지 않게 눈송이 가장자리를 옅게 그림
      const outline = document.documentElement.getAttribute('data-theme') === 'light';
      ctx.strokeStyle = 'rgba(110, 135, 165, 0.5)';
      ctx.lineWidth = 0.8;
      flakes.forEach((f, i) => {
        const prevY = f.y;
        f.y += f.v * dt;
        f.x += Math.sin(now / 900 + f.sway) * 0.35;
        // 액자 윗변에 닿으면 쌓임
        for (const { card, rect } of targets) {
          const top = rect.top - (piles.get(card) || 0);
          if (f.x > rect.left && f.x < rect.right && prevY < top && f.y >= top) {
            setPile(card, Math.min(MAX_PILE, (piles.get(card) || 0) + f.r * 0.09));
            flakes[i] = f.temp ? Object.assign(f, { dead: true }) : spawn(sky, true);
            return;
          }
        }
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
        if (outline) ctx.stroke();
        if (f.y > h + 10) flakes[i] = f.temp ? Object.assign(f, { dead: true }) : spawn(sky, true);
      });
      // 털려서 잠깐 생긴 눈은 땅에 닿으면 없앰
      if (flakes.some(f => f.dead)) flakes = flakes.filter(f => !f.dead);
    });

    // 마우스를 올리면 쌓인 눈이 털림
    const onOver = e => {
      const card = e.target instanceof Element ? e.target.closest('.photo-card') : null;
      if (!card || !piles.get(card)) return;
      const rect = (card.querySelector('.photo-media-wrap') || card).getBoundingClientRect();
      const amount = Math.round(piles.get(card) * 3);
      for (let k = 0; k < amount && flakes.length < 260; k++) {
        flakes.push({ x: rect.left + Math.random() * rect.width, y: rect.top + 2 + Math.random() * 6, r: 1 + Math.random() * 2, v: 60 + Math.random() * 80, sway: Math.random() * 6, temp: true });
      }
      setPile(card, 0);
    };
    document.addEventListener('pointerover', onOver);
    if (!options.weather) toast(L('snowHint'));

    return {
      cleanup() {
        stopAnim();
        clearInterval(targetTimer);
        window.removeEventListener('scroll', updateTargets);
        document.removeEventListener('pointerover', onOver);
        sky.destroy();
        document.querySelectorAll('.photo-card').forEach(card => card.style.removeProperty('--snow'));
      }
    };
  }

  /* ======================================================================
     13. 8비트: 사진이 도트로 깨져 보이고, 누르면 동전 +100, 점수판이 올라감
         (작은 미리보기를 확대해서 도트로 보이게 함. 크게 보기는 원래 화질)
     ====================================================================== */
  function setupPixel() {
    loadStyle(GALMURI_CSS);
    const root = document.documentElement;
    let score = photoTotal() * 1000;
    const setScore = () => root.style.setProperty('--pixel-score', JSON.stringify(L('pixelScore', score)));
    setScore();
    root.style.setProperty('--pixel-start', JSON.stringify(L('pixelStart')));

    const lowRes = src => String(src).replace(/([?&]sz=)w\d+/, '$1w56');
    const pixelate = () => {
      document.querySelectorAll('.photo-thumb, .comp-card-cover').forEach(img => {
        if (img.dataset.hiSrc) return;
        const src = img.getAttribute('src') || '';
        if (!/[?&]sz=w\d+/.test(src)) return;
        img.dataset.hiSrc = src;
        img.setAttribute('src', lowRes(src));
      });
    };
    const stopWatch = watchCards(pixelate);

    const onClick = e => {
      if (!(e.target instanceof Element) || !e.target.closest('.photo-card:not(.is-skeleton)')) return;
      score += 100;
      setScore();
      const coin = document.createElement('span');
      coin.className = 'px-coin';
      coin.textContent = '+100';
      coin.style.left = `${e.clientX}px`;
      coin.style.top = `${e.clientY}px`;
      coin.addEventListener('animationend', () => coin.remove());
      document.body.appendChild(coin);
    };
    document.addEventListener('click', onClick, true);

    return {
      refresh() {
        setScore();
        root.style.setProperty('--pixel-start', JSON.stringify(L('pixelStart')));
      },
      cleanup() {
        stopWatch();
        document.removeEventListener('click', onClick, true);
        document.querySelectorAll('.px-coin').forEach(c => c.remove());
        document.querySelectorAll('[data-hi-src]').forEach(img => {
          img.setAttribute('src', img.dataset.hiSrc);
          delete img.dataset.hiSrc;
        });
        root.style.removeProperty('--pixel-score');
        root.style.removeProperty('--pixel-start');
      }
    };
  }

  /* ======================================================================
     14. 미연시: 갤러리 사진이 배경, 대사가 넘어갈 때마다 마오 · 소라 · 후드 중 한 명이 등장
         대사는 사진 정보로 만듦 (누가 찍었나 · 우승했나 · 투표 중인가). 투표 중인 작품은 작가를 숨김
         가끔 선택지(크게 보기 · 칭찬하기 · 다음), 위쪽에 호감도, AUTO · SKIP · SAVE
     ====================================================================== */
  const VN_CHARS = {
    mao: { img: './vn/mao.webp', color: '#ff8a3d', koName: '마오' },
    sora: { img: './vn/sora.webp', color: '#4aa3e8', koName: '소라' },
    hood: { img: './vn/hood.webp', color: '#9096ab', koName: '후드' }
  };
  const VN_KEYS = Object.keys(VN_CHARS);
  const VN_SPOTS = ['left', 'center', 'right'];

  function setupVN() {
    const root = document.documentElement;
    const V = () => L('vn');
    const pickOne = list => list[Math.floor(Math.random() * list.length)];

    // 사진 순서: 지금 갤러리 목록(없으면 전체)을 섞어서
    const source = (document.getElementById('photoGrid') || {})._paged;
    const base = (source && source.photos && source.photos.length ? source.photos : (typeof allPhotos !== 'undefined' ? allPhotos : [])).slice();
    for (let i = base.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [base[i], base[j]] = [base[j], base[i]];
    }
    const photos = base;
    let photoIdx = -1;

    const stage = document.createElement('div');
    stage.className = 'vn-stage';
    stage.innerHTML = `
      <div class="vn-bg"></div>
      <div class="vn-hud">
        <div class="vn-hearts"></div>
        <div class="vn-menu">
          <button type="button" data-vn="auto">AUTO</button>
          <button type="button" data-vn="skip">SKIP</button>
          <button type="button" data-vn="save">SAVE</button>
        </div>
      </div>
      <p class="vn-caption"></p>
      <img class="vn-sprite" alt="" draggable="false" />
      <div class="vn-box" aria-live="polite">
        <div class="vn-name"></div>
        <p class="vn-text"></p>
        <span class="vn-next" aria-hidden="true">▼</span>
        <div class="vn-choices hidden"></div>
      </div>
    `;
    document.body.appendChild(stage);
    root.classList.add('vn-on');
    VN_KEYS.forEach(k => { const im = new Image(); im.src = VN_CHARS[k].img; });

    const $ = sel => stage.querySelector(sel);
    const bg = $('.vn-bg');
    const sprite = $('.vn-sprite');
    const nameEl = $('.vn-name');
    const textEl = $('.vn-text');
    const nextEl = $('.vn-next');
    const choicesEl = $('.vn-choices');
    const captionEl = $('.vn-caption');

    const affinity = { mao: 0, sora: 0, hood: 0 };
    let speaker = null;
    let spot = 'center';
    let full = '';
    let typing = null;
    let autoOn = false;
    let skipOn = false;
    let autoTimer = null;
    let step = 0;
    let waitingChoice = false;

    const renderHearts = () => {
      $('.vn-hearts').innerHTML = `<span class="vn-hearts-label">${esc(V().affinity)}</span>` + VN_KEYS.map(k => `
        <span class="vn-heart" data-char="${k}" style="--c:${VN_CHARS[k].color}">
          <b>${esc(V().names[k])}</b><i aria-hidden="true">♥</i><em>${affinity[k]}</em>
        </span>`).join('');
    };

    // 배경: 사진 전체가 보이게 가운데 놓고, 남는 자리는 같은 사진을 흐리게 깔아서 채움
    const showPhoto = photo => {
      const url = photo.fullUrl || photo.thumbUrl;
      const slide = document.createElement('div');
      slide.className = 'vn-slide';
      slide.innerHTML = `<img class="vn-fill" alt="" referrerpolicy="no-referrer" /><img class="vn-photo" alt="" referrerpolicy="no-referrer" />`;
      const [fill, main] = slide.querySelectorAll('img');
      fill.src = photo.thumbUrl || url;
      main.src = url;
      bg.appendChild(slide);
      requestAnimationFrame(() => slide.classList.add('is-in'));
      [...bg.children].slice(0, -2).forEach(old => old.remove());
      setTimeout(() => { [...bg.children].slice(0, -1).forEach(old => old.classList.add('is-out')); }, 30);

      const meta = typeof getDisplayMeta === 'function' ? getDisplayMeta(photo) : { isAnonymous: true };
      const round = typeof getFolderFullName === 'function' ? getFolderFullName(photo.folderName) : '';
      captionEl.textContent = [round, meta.isAnonymous ? meta.title : meta.authorLabel].filter(Boolean).join(' · ');

      const next = photos[(photoIdx + 1) % photos.length];
      if (next) { const im = new Image(); im.referrerPolicy = 'no-referrer'; im.src = next.fullUrl || next.thumbUrl; }
    };

    // 사진에 맞는 대사 고르기
    const topicOf = photo => {
      const group = typeof getFolderGroupName === 'function' ? getFolderGroupName(photo.folderName) : '';
      const short = typeof getFolderShortName === 'function' ? getFolderShortName(photo.folderName) : '';
      return short.replace(/\d+\s*차/, '').split(group).join(' ').replace(/\s{2,}/g, ' ').trim() || short;
    };
    const lineFor = (who, photo) => {
      const lines = V().lines[who];
      const meta = typeof getDisplayMeta === 'function' ? getDisplayMeta(photo) : { isAnonymous: true };
      if (meta.isAnonymous) return pickOne(lines.ongoing);
      if (Math.random() < 0.18) return pickOne(lines.flavor);
      const author = meta.authorLabel || '';
      const award = typeof getPhotoAward === 'function' ? getPhotoAward(photo) : null;
      const won = Boolean(award && award.isTopWinner);
      const authorKey = VN_KEYS.find(k => VN_CHARS[k].koName === author);
      let pool;
      if (authorKey === who) pool = won ? lines.ownWin : lines.own;
      else if (authorKey) pool = (won && lines[`${authorKey}Win`]) || lines[authorKey];
      else pool = author ? lines.other : lines.flavor;
      const shownAuthor = authorKey ? V().names[authorKey] : author;
      return pickOne(pool).replace(/\{author\}/g, shownAuthor).replace(/\{topic\}/g, topicOf(photo));
    };

    const clearAuto = () => { if (autoTimer) clearTimeout(autoTimer); autoTimer = null; };
    const scheduleAuto = () => {
      clearAuto();
      if (!(autoOn || skipOn) || waitingChoice) return;
      autoTimer = setTimeout(advance, skipOn ? 450 : 2400);
    };

    const finishTyping = () => {
      if (typing) clearInterval(typing);
      typing = null;
      textEl.textContent = full;
      nextEl.classList.remove('is-hidden');
      scheduleAuto();
    };

    const say = (who, text, newSpot = true) => {
      clearAuto();
      if (who !== speaker || newSpot) {
        const spots = VN_SPOTS.filter(s => who !== speaker || s !== spot);
        spot = pickOne(spots);
        sprite.classList.remove('is-in');
        void sprite.offsetWidth;
        sprite.src = VN_CHARS[who].img;
        sprite.dataset.spot = spot;
        sprite.alt = V().names[who];
        sprite.classList.add('is-in');
      }
      speaker = who;
      nameEl.textContent = V().names[who];
      nameEl.style.setProperty('--c', VN_CHARS[who].color);
      full = text;
      textEl.textContent = '';
      nextEl.classList.add('is-hidden');
      if (typing) clearInterval(typing);
      if (reducedMotion || skipOn) {
        finishTyping();
        return;
      }
      let i = 0;
      const chars = [...text];
      typing = setInterval(() => {
        i += 1;
        textEl.textContent = chars.slice(0, i).join('');
        if (i >= chars.length) finishTyping();
      }, 32);
    };

    const nextPhotoLine = () => {
      if (!photos.length) return;
      photoIdx = (photoIdx + 1) % photos.length;
      const photo = photos[photoIdx];
      showPhoto(photo);
      // 대사가 넘어갈 때마다 아무나 한 명 (방금 말한 사람은 되도록 피함)
      const who = pickOne(VN_KEYS.filter(k => k !== speaker)) || pickOne(VN_KEYS);
      say(who, lineFor(who, photo));
    };

    const showChoices = () => {
      waitingChoice = true;
      clearAuto();
      const C = V().choices;
      choicesEl.innerHTML = ['big', 'praise', 'next'].map(k => `<button type="button" class="vn-choice" data-choice="${k}">${esc(C[k])}</button>`).join('');
      choicesEl.classList.remove('hidden');
      nextEl.classList.add('is-hidden');
      const first = choicesEl.querySelector('button');
      if (first) first.focus({ preventScroll: true });
    };

    const hideChoices = () => {
      waitingChoice = false;
      choicesEl.classList.add('hidden');
      choicesEl.innerHTML = '';
    };

    const heartPop = who => {
      const target = stage.querySelector(`.vn-heart[data-char="${who}"]`);
      if (!target) return;
      target.classList.remove('is-pop');
      void target.offsetWidth;
      target.classList.add('is-pop');
    };

    function advance() {
      if (waitingChoice) return;
      if (typing) {
        finishTyping();
        return;
      }
      step += 1;
      if (step % 5 === 0 && photoIdx >= 0) {
        showChoices();
        return;
      }
      nextPhotoLine();
    }

    const onChoice = key => {
      hideChoices();
      if (key === 'big') {
        const photo = photos[photoIdx];
        if (photo && typeof openLightbox === 'function') {
          filteredPhotos = photos;
          lightboxShowAwards = false;
          openLightbox(photoIdx);
        }
        say(speaker, pickOne(V().lines[speaker].flavor), false);
      } else if (key === 'praise') {
        affinity[speaker] += 1;
        renderHearts();
        heartPop(speaker);
        say(speaker, pickOne(V().lines[speaker].thanks), false);
      } else {
        nextPhotoLine();
      }
    };

    const lightboxOpen = () => {
      const lb = document.getElementById('lightboxModal');
      return lb && !lb.classList.contains('hidden');
    };

    stage.addEventListener('click', e => {
      const menu = e.target.closest('[data-vn]');
      if (menu) {
        const act = menu.getAttribute('data-vn');
        if (act === 'auto') {
          autoOn = !autoOn;
          menu.classList.toggle('is-on', autoOn);
          if (autoOn && !typing) scheduleAuto();
          if (!autoOn) clearAuto();
        } else if (act === 'skip') {
          skipOn = !skipOn;
          menu.classList.toggle('is-on', skipOn);
          if (skipOn) { if (typing) finishTyping(); else scheduleAuto(); } else clearAuto();
        } else if (act === 'save') {
          toast(V().save);
        }
        return;
      }
      const choice = e.target.closest('[data-choice]');
      if (choice) {
        onChoice(choice.getAttribute('data-choice'));
        return;
      }
      advance();
    });

    const onKey = e => {
      if (pickerEl || lightboxOpen()) return;
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if ((e.key === ' ' || e.key === 'Enter') && !(waitingChoice && tag === 'BUTTON')) {
        e.preventDefault();
        advance();
      }
    };
    document.addEventListener('keydown', onKey);

    renderHearts();
    // 시작: 첫 사진과 함께 인사
    if (photos.length) {
      photoIdx = 0;
      showPhoto(photos[0]);
    }
    const first = pickOne(VN_KEYS);
    say(first, pickOne(V().lines[first].intro));
    setTimeout(() => toast(V().hint), 2900);

    return {
      refresh() {
        renderHearts();
        if (speaker) nameEl.textContent = V().names[speaker];
        if (waitingChoice) showChoices();
      },
      cleanup() {
        clearAuto();
        if (typing) clearInterval(typing);
        document.removeEventListener('keydown', onKey);
        root.classList.remove('vn-on');
        stage.remove();
      }
    };
  }

  const SETUPS = {
    win98: setupWin98,
    hacker: setupHacker,
    gravity: setupGravity,
    viewfinder: setupViewfinder,
    homepage: setupHomepage,
    upside: setupUpside,
    space: setupSpace,
    board: setupBoard,
    darkroom: setupDarkroom,
    fog: setupFog,
    museum: setupMuseum,
    snow: setupSnow,
    pixel: setupPixel,
    vn: setupVN
  };

  /* ---------- 페이지를 열 때 10번에 한 번은 아무 분위기나 저절로 켜짐 ----------
     주소 뒤에 ?mood=space 처럼 붙이면 그 분위기로, ?mood=random 이면 무작위로 바로 열림 */
  const LUCKY_CHANCE = 0.1;

  // 사진이 화면에 다 그려진 뒤에 켜야 중력 · 미술관 같은 분위기가 사진에 제대로 걸림
  function whenPhotosReady(callback) {
    const started = Date.now();
    const check = () => {
      const ready = document.querySelector('#photoGrid .photo-card:not(.is-skeleton)') ||
        !document.getElementById('statusBanner')?.classList.contains('hidden');
      if (ready || Date.now() - started > 8000) callback();
      else setTimeout(check, 200);
    };
    check();
  }

  /* ---------- 날씨: 방문한 사람이 있는 곳에 눈 · 비가 오면 사이트에도 ----------
     무료 · 키 없음: 대략적인 위치(도시 정도)는 접속 주소로 get.geojs.io → ipwho.is 순서로 찾고,
     못 찾으면 서울. 날씨는 Open-Meteo. 위치는 소수 둘째 자리(1km 정도)까지만 보냄.
     한 번 확인하면 30분 동안은 다시 묻지 않음 (이번 방문 동안 브라우저에 기억)
     주소 뒤에 ?weather=snow 또는 ?weather=rain 을 붙이면 그 날씨인 것처럼 시험해 볼 수 있음 */
  const SEOUL = { lat: 37.57, lon: 126.98, seoul: true };
  const SNOW_CODES = new Set([71, 73, 75, 77, 85, 86]);
  const RAIN_CODES = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99]);

  async function fetchJson(url, ms = 2500) {
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = setTimeout(() => { if (ctrl) ctrl.abort(); }, ms);
    try {
      const res = await fetch(url, { signal: ctrl ? ctrl.signal : undefined, cache: 'no-store' });
      return res.ok ? await res.json() : null;
    } catch (e) {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  async function findVisitorPlace() {
    const geo = await fetchJson('https://get.geojs.io/v1/ip/geo.json');
    if (geo && isFinite(parseFloat(geo.latitude)) && isFinite(parseFloat(geo.longitude))) {
      return { lat: parseFloat(geo.latitude), lon: parseFloat(geo.longitude), seoul: false };
    }
    const who = await fetchJson('https://ipwho.is/');
    if (who && who.success !== false && isFinite(who.latitude) && isFinite(who.longitude)) {
      return { lat: Number(who.latitude), lon: Number(who.longitude), seoul: false };
    }
    return SEOUL;
  }

  async function readWeather() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(WEATHER_CACHE_KEY) || 'null');
      if (saved && Date.now() - saved.at < 30 * 60 * 1000) return saved;
    } catch (e) {}

    const place = await findVisitorPlace();
    const url = 'https://api.open-meteo.com/v1/forecast' +
      `?latitude=${place.lat.toFixed(2)}&longitude=${place.lon.toFixed(2)}` +
      '&current=weather_code,rain,showers,snowfall&timezone=auto';
    const data = await fetchJson(url);
    const now = data && data.current;
    let kind = 'unknown';
    if (now) {
      if (SNOW_CODES.has(now.weather_code) || now.snowfall > 0) kind = 'snow';
      else if (RAIN_CODES.has(now.weather_code) || now.rain > 0 || now.showers > 0) kind = 'rain';
      else kind = 'clear';
    }
    const result = { kind, seoul: place.seoul, at: Date.now() };
    if (kind !== 'unknown') {
      try { sessionStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(result)); } catch (e) {}
    }
    return result;
  }

  /* ---------- 페이지를 열 때: 눈 · 비가 오면 그 날씨로, 아니면 10번에 한 번은 아무 분위기나 ----------
     주소 뒤에 ?mood=space 처럼 붙이면 그 분위기로, ?mood=random 이면 무작위로 바로 열림 */
  function autoMoodOnLoad() {
    let params = null;
    try { params = new URLSearchParams(window.location.search); } catch (e) {}
    const forced = params ? params.get('mood') || '' : '';
    const testWeather = params ? params.get('weather') || '' : '';

    if (forced) {
      whenPhotosReady(() => {
        if (moodIndex >= 0 || pickerEl) return;
        const index = MOODS.indexOf(forced);
        if (index >= 0) setMood(index);
        else pick('random');
      });
      return;
    }

    let weatherOff = false;
    try { weatherOff = sessionStorage.getItem(WEATHER_OFF_KEY) === '1'; } catch (e) {}
    let weatherPromise;
    if (testWeather === 'snow' || testWeather === 'rain') {
      weatherPromise = Promise.resolve({ kind: testWeather, seoul: false });
    } else if (weatherOff) {
      weatherPromise = Promise.resolve(null);
    } else {
      weatherPromise = readWeather().catch(() => null);
    }
    const lucky = Math.random() < LUCKY_CHANCE;

    whenPhotosReady(async () => {
      // 날씨 확인이 늦으면 4초까지만 기다림
      const weather = await Promise.race([weatherPromise, new Promise(r => setTimeout(() => r(null), 4000))]);
      if (moodIndex >= 0 || pickerEl) return; // 그사이 직접 골랐으면 건드리지 않음

      if (weather && (weather.kind === 'snow' || weather.kind === 'rain')) {
        setMood(MOODS.indexOf(weather.kind === 'snow' ? 'snow' : 'fog'), { weather: weather.kind });
        weatherAutoIndex = moodIndex;
        const message = L(weather.kind === 'snow' ? 'weatherSnow' : 'weatherRain', weather.seoul);
        setTimeout(() => { if (moodIndex === weatherAutoIndex) toast(message); }, 2800);
        return;
      }

      if (lucky) {
        pick('random');
        if (moodIndex >= 0) {
          const name = moodName(MOODS[moodIndex]);
          setTimeout(() => { if (moodIndex >= 0) toast(L('luckyToast', name)); }, 3000);
        }
      }
    });
  }

  /* ---------- 버튼 연결: 기분전환 → 고르기 창 ---------- */
  function init() {
    const btn = document.getElementById('btnMood');
    if (btn) btn.addEventListener('click', () => openPicker(btn));
    autoMoodOnLoad();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
