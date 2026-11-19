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
      luckyToast: name => `🎲 기분전환 당첨! 오늘은 '${name}' (오른쪽 아래 ✕로 원래대로)`,
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
        // 처음 들어왔을 때: 신입 부원에게 셋이 차례로 인사
        introCast: [
          ['mao', '어서 와요, 신입 부원! 저는 사진부 부장 마오예요. 와 줘서 정말 고마워요!'],
          ['sora', '신입이에요? 저는 소라. 마오 부장 혼자 두면 불안해서 같이 안내할게요.'],
          ['hood', '…후드예요. 사진 설명은 정리해 왔어요. 천천히 보세요, 신입 씨.'],
          ['mao', '자, 그럼 우리 부원들 사진 구경하러 가요! 화면을 누르면 다음으로 넘어가요.']
        ],
        lines: {
          mao: {
            own: [
              '이거 제가 찍은 거예요… 아직 잘 모르지만, 찍을 때 정말 행복했어요. 신입 부원도 이런 날이 올 거예요.',
              '제 사진이에요! {topic} 주제라서 열심히 돌아다녔어요. 부장인데 부끄럽지 않게요!',
              '두 달 동안 1200장 찍었는데요, 이게 제일 마음에 들어요. 신입 부원도 일단 많이 찍어 봐요!',
              '이 사진 찍으려고 같은 자리에 세 번 갔어요. 사진은 발로 찍는 거래요. 헤헤.',
              '사실 이거 색이 자신 없어서 흑백으로 바꿀까 엄청 고민했어요. 그냥 둔 게 다행이죠?',
              '이날 비가 조금 왔는데 카메라 괜찮을까 걱정하면서 찍었어요. 다행히 멀쩡해요!',
              '{topic} 주제 듣자마자 바로 나갔어요. 부장이 제일 먼저 내야 다들 따라오니까요!',
              '인스타에서 본 구도를 따라 해 본 거예요. 따라 하다 보면 내 것도 생긴대요!'
            ],
            ownWin: [
              '제가… 이겼어요? 정말요? 소라가 엄청 잘 찍었는데… 다들 고마워요!',
              '이건 제 우승작이에요. 부장이라고 봐준 거 아니죠…? 아니라고 해 주세요!',
              '신입 부원, 이거 꼭 보여 주고 싶었어요. 소라한테 이긴 날 찍은 거예요!',
              '우승이라니… 공지에 제 이름 쓰는 게 너무 쑥스러웠어요. 헤헤.',
              '이 사진 덕분에 소마대전 스코어가 한 점 줄었어요! 신입 부원, 응원해 줘요!',
              '우승작이에요! 상품은 작았지만, 기분은 엄청 컸어요.'
            ],
            sora: [
              '소라 사진이에요. 와… 하늘 색이 어떻게 이렇게 나오지? 나중에 몰래 물어봐야겠다.',
              '소라는 잔소리가 좀 많지만… 사진은 정말 잘 찍어요. 이건 비밀이에요!',
              '신입 부원, 소라한테 배우면 금방 늘 거예요. 잔소리는… 조금 각오해야 하지만요.',
              '소라는 투덜거리면서도 결국 끝까지 찍어 와요. 진짜 대단해요.',
              '이 사진 보고 저 바로 따라 나갔다가… 그냥 하늘만 찍고 왔어요. 왜 다르지?',
              '소라 사진은 보정을 거의 안 한 것 같은데 색이 예뻐요. 비결이 뭘까요?'
            ],
            soraWin: [
              '소라가 또 이겼네요. 괜찮아요, 잘 찍었으니까요! …그래도 다음엔 저도 이기고 싶어요.',
              '소마대전이 원래 소라랑 저랑 대결이거든요. 스코어는… 묻지 말아 줘요.',
              '소라가 이긴 날은 단톡방이 조용해요. 제가 조용하거든요… 헤헤.',
              '인정할 건 인정해야죠! 이 사진은 저도 투표했어요. 비밀이에요.'
            ],
            hood: [
              '후드 사진이에요. 조용히 와서 이렇게 멋진 걸 찍어 오다니… 정말 대단해요.',
              '사실 저 후드 사진 보면서 구도 많이 배웠어요. 고마워, 후드!',
              '후드는 노출을 미리 계산해 온대요. 저는… 일단 찍고 봐요. 헤헤.',
              '후드는 필름도 찍는대요. 현상 나오는 거 같이 기다려 주고 싶어요!',
              '후드가 사진 올리는 날은 단톡방이 갑자기 조용해져요. 다들 감상하느라요.',
              '후드 사진엔 늘 빛이 예쁘게 들어와 있어요. 시간을 잘 고르는 것 같아요.'
            ],
            hoodWin: [
              '후드가 우승했던 사진이에요! 우리 부원들 다 너무 잘해서… 부장으로서 뿌듯해요.',
              '후드는 자주 안 나오는데, 나오면 이렇게 1등이에요. 신입 부원도 기대할게요!',
              '후드 우승했을 때 제가 박수 이모티콘을 백 개 보냈어요. 너무 많았나…?',
              '이 사진 처음 봤을 때 진짜 숨 참았어요. 신입 부원도 그렇죠?'
            ],
            other: [
              '{author} 님 사진이에요! 우와… 저도 이렇게 찍어 보고 싶어요.',
              '{author} 님은 {topic} 주제를 이렇게 담았구나… 정말 좋다.',
              '신입 부원, {author} 님 사진 꼭 기억해 둬요. 저도 여기서 많이 배워요.',
              '{topic} 주제 때 다들 이렇게 다르게 찍어 와서, 보는 재미가 있어요!',
              '{author} 님 사진 보면 {topic} 주제가 이렇게 넓었나 싶어요!',
              '와… {author} 님은 이걸 어떻게 발견했을까요? 저는 그냥 지나쳤을 거예요.',
              '{author} 님 이 사진, 단톡방에 올라왔을 때 다들 감탄했어요!',
              '신입 부원, 이런 사진 보면 찍고 싶어지지 않아요? 저는 벌써 나가고 싶어요!'
            ],
            ongoing: [
              '이건 지금 투표 중인 작품이라 누가 찍었는지는 비밀이에요. 아, 투표… 한 번만 부탁드려도 될까요?',
              '투표 중인 사진이에요! 신입 부원도 투표할 수 있어요. 해 주면 저 정말 기쁠 거예요.',
              '누가 찍었는지 맞혀 볼래요? …아, 투표 끝날 때까지는 정답 못 알려 줘요!',
              '투표 마감 전에 꼭이요! 신입 부원 한 표도 소중해요.',
              '이 사진, 저도 누가 찍었는지 몰라요… 사실 알아요. 그래도 비밀!',
              '투표는 톡게시판에서 해요. 모르겠으면 저한테 물어봐요!'
            ],
            tips: [
              '신입 부원, 공지 한 번씩만 꼭 봐 줘요! 닉네임 양식도 거기 있어요.',
              '소마대전은 미니 공모전이에요. 주제가 나오면 한 장씩 내면 돼요. 부담 갖지 말고요!',
              '공식 사진전에서 1등 하면 방 대표 커버 사진이 돼요. 신입 부원 사진이 걸리면 좋겠다!',
              '사진 공유도 좋고, 카메라 이야기도 좋고, 그냥 수다도 좋아요. 편하게 와요!',
              '출사 모임도 가끔 해요! 신입 부원도 시간 되면 같이 가요.',
              '인스타 계정 있으면 톡게시판 댓글에 공유해 줘요. 서로 구경해요!',
              '활동이 너무 없으면… 방 규칙상 내보내게 될 수도 있어요. 그러니까 자주 와요! 진짜로요.',
              '우리 사진들은 온라인 갤러리에도 모아 두고 있어요. 지금 보고 있는 여기요!'
            ],
            flavor: [
              '인성은 렌즈 크기에 비례한대요! …제가 한 말이에요. 아니에요?',
              '조리개 숫자를 높이면 뒤까지 선명해진다… 맞나요? 아직 공부 중이에요.',
              '오늘의 좋은 말! 느려도 괜찮아, 포기하지만 않으면. 사진도 그렇대요.',
              '맡겨 둔 필름이 아직 현상 중이에요. 두근두근!',
              '카메라를 세 대나 들고 다녀서 어깨가 아파요… 그래도 다 소중해요.',
              '모르는 건 그냥 물어봐요! 저도 맨날 물어봐요. 부장인데도요.',
              '삼각대를 사서 들고 갈지 아직도 고민 중이에요. 무거운 건 이미 많은데…',
              '셔터 속도 4천 이상은 아직 한 번도 안 써 봤어요. 언젠가 써 볼 거예요!',
              '화이트밸런스가 안 맞으면 하얀색이 하얀색이 아니래요. 신기하죠?',
              '저 처음엔 보케가 뭔지도 몰랐어요. 지금은… 조금 알아요!',
              '카메라가 비 조금 맞아도 괜찮겠죠…? 저 매번 걱정해요.',
              '사진 잘 찍는 사람 보면 "저런 게 사진쟁이지!" 하고 외치게 돼요.'
            ],
            // 칭찬받을 때: 1번째 → 2번째 → 3번째 순서로, 다른 부원이 끼어드는 짧은 장면
            praise: [
              [['mao', '정말요? 헤헤… 칭찬받으니까 오늘 하루 종일 행복할 것 같아요.'], ['sora', '신입, 마오 부장 너무 띄워 주지 마요. 그러다 또 카메라 사요.'], ['mao', '안 사요! …아마도요.']],
              [['mao', '또 칭찬해 줘요? 신입 부원 덕분에 부장 할 맛 나요!'], ['hood', '…마오 부장, 얼굴 빨개졌어요.'], ['mao', '아, 아니에요! 조, 조명 때문이에요!']],
              [['mao', '세 번이나…! 신입 부원, 혹시 저 감동시키러 온 거예요?'], ['sora', '마오 부장 울어요. 손수건 준비하세요.'], ['mao', '안 울어요! …고마워요, 진짜로. 우리 사진부 와 줘서.']]
            ],
            praiseMore: [
              [['mao', '헤헤… 이러다 신입 부원한테 부장 자리 뺏기겠어요.'], ['hood', '…그건 좀 이르지 않을까요.']],
              [['mao', '칭찬은 언제 들어도 좋아요! 신입 부원 최고!'], ['sora', '…둘이 아주 신났네요.']],
              [['mao', '신입 부원 칭찬 노트 만들어야겠어요. 오늘 벌써 몇 번째지?'], ['hood', '…제가 세고 있어요. 정리해 둘게요.']]
            ]
          },
          sora: {
            own: [
              '제 사진이에요. {topic} 주제였죠. 하늘 톤 맞추느라 한참 기다렸다고요.',
              '흐린 날은 햇빛도 그림자도 없어서 못 찍어요. 그래서 이날은 해 나올 때까지 버텼어요.',
              '신입, 이거 보정 많이 한 거 아니에요. 찍을 때 제대로 찍는 게 먼저예요.',
              '이 장면 하나 찍으려고 해 뜨기 전부터 나가 있었어요. 신입은 따라 하지 마요. 힘들어요.',
              '이거 수업 끝나고 찍은 거예요. 해가 짧아져서 진짜 빠듯했어요.',
              '삼각대 없이 숨 참고 찍었어요. 신입, 흔들리면 다시 찍어요. 핑계 없어요.',
              '그림자 하나 찍으려고 소품까지 샀어요. 만오천 원이요. 흑흑.',
              '제대로 찍은 건 100장도 안 돼요. 그중 하나예요. 신입, 버리는 것도 실력이에요.'
            ],
            ownWin: [
              '제 우승작이에요. …자꾸 이기니까 저도 헷갈려요. 마오 부장, 분발 좀 해요.',
              '또 제가 이겼네요. 소마대전 스코어요? 마오 부장 앞에선 말 안 할게요.',
              '신입, 이게 우승작이에요. 잘 봐 둬요. 구도, 빛, 타이밍. 셋 다 맞아야 해요.',
              '가장 자신 있는 사진은 아니었는데 이겼어요. 그러니까 신입도 일단 내요.',
              '스코어 또 벌어졌네요. 마오 부장, 오늘은 위로 안 해 줄 거예요.',
              '우승은 좋은데, 다음엔 신입이 저를 이기면 더 좋겠어요. 진심이에요.'
            ],
            mao: [
              '마오 부장 사진이네요. …잘 나왔네요. 근데 마오 부장, 또 카메라 산 건 아니죠? 제발요.',
              '마오 부장, 이건 좋아요. 근데 다음엔 수평 좀 맞춰요. 잔소리 아니에요, 조언이에요.',
              '신입, 마오 부장 사진은 열정으로 찍은 거예요. 기술은… 저한테 배워요.',
              '마오 부장, 이거 흑백으로 바꿀까 고민했죠? 안 바꾼 거 잘했어요.',
              '마오 부장 사진은 매번 늘어요. …그건 인정해요. 장비 말고 실력이요.',
              '신입, 마오 부장이 모르는 거 물어보면 대신 대답해 줘요. 제가 바빠요.'
            ],
            maoWin: [
              '이번엔 마오 부장이 이겼죠. 인정해요. …다음엔 없을 거지만요. 흑흑, 농담이에요.',
              '이날은 제가 졌어요. 신입, 이 얘기 마오 부장 앞에서 하지 마요. 신나서 하루 종일 말해요.',
              '마오 부장이 이긴 날은 공지가 세 번 올라와요. 신입, 각오해요.',
              '이 사진은 인정. 마오 부장 사진 중에 제일 좋아요. 이건 말하지 마요.'
            ],
            hood: [
              '후드 선배 사진이에요. 말은 없는데 사진은 늘 정답이에요. 마오 부장도 좀 보고 배워요.',
              '신입, 후드 선배처럼 미리 계획하고 찍는 습관 들여요. 저도 그건 못 이겨요.',
              '후드 선배 사진은 조용한데 오래 봐도 안 질려요. 신입, 그런 사진을 찍어요.',
              '후드 선배는 필름도 찍어요. 저는 필름값 보고 포기했어요. 흑흑.'
            ],
            hoodWin: [
              '후드 선배는 가끔 나와서 이렇게 가져가요. 마오 부장, 봐요. 이게 모범 답안이에요.',
              '후드 선배 승률이 한 90%는 될걸요. 신입, 후드 선배 나오는 날은 긴장해요.',
              '후드 선배랑 붙는 날은 저도 긴장해요. 이건 비밀이에요.',
              '이 사진은 이길 방법이 없었어요. 깔끔하게 인정.'
            ],
            other: [
              '{author} 님 사진이에요. 빛을 잘 읽었네요. 마오 부장, 메모해요.',
              '{topic} 주제를 이렇게 풀었네요. {author} 님, 좋은 시선이에요.',
              '신입, {author} 님 사진 보이죠? 이런 게 주제를 자기 걸로 만든 사진이에요.',
              '{author} 님 사진은 군더더기가 없어요. 신입은 빼는 연습부터 해요.',
              '{author} 님, {topic} 주제에서 이 각도는 생각 못 했어요. 좋네요.',
              '신입, 이 사진 수평 봐요. 이렇게 딱 맞아야 해요. 마오 부장, 듣고 있어요?',
              '{author} 님 사진은 색을 과하게 안 써서 좋아요. 신입은 채도부터 줄여요.',
              '이건 기다려서 찍은 사진이에요. 우연히 찍힌 게 아니에요. 보면 알아요.'
            ],
            ongoing: [
              '투표 중인 작품이라 작가는 아직 비밀이에요. 그리고 투표 안 하신 분들, 제발 해 주세요. 마오 부장 또 울어요.',
              '신입, 투표는 마음에 드는 사진 하나만 고르면 돼요. 어렵게 생각하지 마요.',
              '누가 찍었는지 추측하는 건 자유지만, 말하면 안 돼요. 규칙이에요.',
              '투표 마감은 칼같이 지켜요. 늦으면 안 받아요. 신입도 예외 없어요.',
              '마음에 드는 사진이 두 개면… 그래도 하나만 골라요. 제발요.',
              '결과 나오기 전까지 단톡방에 힌트 흘리지 마요. 다 티 나요.'
            ],
            tips: [
              '신입, 감성 사진은 액정 말고 뷰파인더로 봐요. 몇 번을 말해요.',
              '흐린 날은 햇빛도 그림자도 없어서 사진이 다 심심해요. 신입은 맑은 날을 노려요.',
              '보정할 땐 RGB 커브부터 만져 봐요. 삼원색만 알면 돼요. 신입, 듣고 있죠?',
              '장비 욕심은 나중에 내요. 마오 부장처럼 되면 큰일 나요.',
              '컴퓨터로 보정하고 폰으로 옮기면 색이 밋밋해질 수 있어요. 마지막엔 폰으로 확인해요.',
              '수업 끝나면 어두워서 찍을 게 없어요. 신입, 주말 아침을 노려요.',
              '뷰파인더는 편한 눈으로 봐요. 근데 다들 왼쪽 눈이더라고요. 신입은요?',
              '안 쓰는 렌즈는 팔아요. 장비가 많다고 사진이 느는 게 아니에요.'
            ],
            flavor: [
              '소마대전이 소라랑 마오 대결인 거 알죠? 스코어는 제가 앞서고 있어요.',
              '필카가 미래라고요? 필름값 보세요. 똑딱이 하나 값이에요.',
              '흑흑, 오늘도 마오 부장 대신 공지 정리했어요.',
              '마음에 드는 사진은 다음 날 다시 봐요. 그래도 좋으면 진짜 좋은 거예요.',
              '사진 잘 찍는 법이요? 많이 찍고, 많이 버리기. 끝.',
              '현재 스코어요? 제가 앞서요. 숫자는 마오 부장 앞에서 말 안 할게요.',
              '퀴즈 게임 하면 제가 1등 해요. 사진만 잘하는 게 아니에요.',
              '단톡방에 300개 쌓여 있으면 그냥 다 읽음 처리하고 싶어요. 흑흑.',
              '단풍 시즌인데 단풍을 한 장도 못 찍었어요. 이번 주엔 꼭 나가요.',
              '제 사진 창피하다고 안 올리는 거 금지예요. 신입, 일단 올려요.'
            ],
            praise: [
              [['sora', '…칭찬은 익숙한데요. 이렇게 들으니까 좀 쑥스럽네요.'], ['mao', '소라가 쑥스러워한다! 신입 부원, 방금 거 봤어요?'], ['sora', '마오 부장은 조용히 해요!']],
              [['sora', '흑흑, 그런 말 하면 다음에도 이겨야 하잖아요.'], ['hood', '…소라, 귀 빨개.'], ['sora', '후드 선배까지…! 신입, 다음 사진으로 넘어가요. 빨리요.']],
              [['sora', '…세 번째예요. 신입, 혹시 저 놀리는 거예요?'], ['mao', '진심이에요! 소라가 제일 잘 찍잖아요!'], ['sora', '…알아요. 그래도, 고마워요. 이번만 진짜 고맙다고 할게요.']]
            ],
            praiseMore: [
              [['sora', '칭찬 그만하고 신입도 찍어 와요. 그게 제일 좋은 칭찬이에요.']],
              [['sora', '…좋아요. 오늘은 잔소리 한 번 쉬어 줄게요.'], ['mao', '소라가 잔소리를 쉰대요! 오늘 기념일이에요!']],
              [['sora', '신입, 칭찬은 고마운데요. 수평은 맞춰 오세요.'], ['hood', '…결국 잔소리로 끝났어요.']]
            ]
          },
          hood: {
            own: [
              '…제 사진이에요. {topic}. 노출은 미리 계산해 뒀어요.',
              '…필름으로 찍은 것도 있어요. 현상 나오길 기다리는 시간이 제일 두근거려요.',
              '…이 장소는 미리 세 번 답사했어요. 신입 씨도 장소부터 정해 보세요.',
              '…해 지기 20분 전이 제일 좋아요. 이건 그때 찍었어요.',
              '…필름은 스캔까지 맡기고, 고르는 건 제가 해요. 이건 고른 것 중 하나예요.',
              '…이건 셔터 한 번에 끝났어요. 운이 좋았어요.',
              '…스트릿 느낌으로 찍어 보고 싶었어요. 조금 어색하죠?',
              '…올릴 사진은 많은데, 하나 고르는 게 제일 어려워요. 이건 고른 거예요.'
            ],
            ownWin: [
              '…우승했었어요. 햇빛이 좋았어요. 준비한 만큼 나온 것 같아요.',
              '…이건 계획대로 됐어요. 드물게요.',
              '…상을 받고 노트에 한 줄을 더 적었어요. "빛은 기다리면 온다."',
              '…이겼다는 말 들었을 때, 사실 조금 웃었어요. 조금만요.'
            ],
            mao: [
              '…마오 부장 사진이에요. 카메라 추천은 안 들었지만… 사진은 좋아요.',
              '…마오 부장, 많이 늘었어요. 정말이에요.',
              '…신입 씨, 마오 부장은 모르는 게 있으면 바로 물어봐요. 그게 빨리 느는 비결 같아요.',
              '…마오 부장 사진엔 늘 신나는 게 보여요. 찍는 사람이 즐거워서 그래요.',
              '…마오 부장, 이번엔 수평이 맞았어요. 소라가 좋아하겠어요.',
              '…카메라가 세 대라 어깨가 걱정돼요. 그래도 사진은 좋아요.'
            ],
            maoWin: [
              '…마오 부장이 이겼어요. 축하해요. (조용히 박수)',
              '…이날 마오 부장이 하루 종일 웃었어요. 저도 좀 좋았어요.',
              '…마오 부장이 이긴 날은 공지가 길어져요. 그래도 좋아 보여서 괜찮아요.',
              '…이 사진은 저도 좋았어요. 투표는 비밀이지만요.'
            ],
            sora: [
              '…소라 사진이에요. 잔소리는 많지만, 하늘은 정말 잘 찍어요.',
              '…소라 사진. 색이 진하고 깊어요. 저도 배우고 싶어요.',
              '…신입 씨, 소라 잔소리는 다 맞는 말이에요. 듣기만 조금 힘들 뿐이에요.',
              '…소라는 흐린 날엔 안 찍어요. 그래서 소라 사진엔 늘 빛이 있어요.',
              '…소라 사진은 수평이 정확해요. 자로 잰 것 같아요.',
              '…소라가 해 뜨기 전부터 나가서 찍은 사진이에요. 존경해요.'
            ],
            soraWin: [
              '…또 소라예요. 놀랍지 않아요. 열심히 하니까요.',
              '…소라는 이길 때도 잔소리해요. "이 정도는 기본이에요" 같은 거요.',
              '…소라 우승작은 노트에 따로 모아 두고 있어요. 공부용이에요.',
              '…이길 만했어요. 크흠, 저도 분발할게요.'
            ],
            other: [
              '…{author} 님 사진. 구도가 깔끔해요. 메모해 둘게요.',
              '…{topic}. 이렇게 찍을 수도 있네요. 오홍.',
              '…신입 씨, 이 사진은 시선이 머무는 곳이 하나예요. 그게 좋아요.',
              '…{author} 님은 빛이 들어오는 방향을 잘 봐요. 크흠, 배워야겠어요.',
              '…{author} 님 사진은 색이 차분해요. 저랑 취향이 비슷한 것 같아요.',
              '…{topic} 주제를 이렇게 해석하는 건 생각 못 했어요. 메모했어요.',
              '…이 사진은 오래 볼수록 좋아요. 신입 씨도 한 번 더 봐 주세요.',
              '…배경을 정리한 게 좋아요. 시선이 흩어지지 않아요.'
            ],
            ongoing: [
              '…투표 중이에요. 누가 찍었는지는 비밀이에요. …크흠.',
              '…신입 씨도 투표할 수 있어요. 번호만 고르면 돼요.',
              '…투표는 조용히, 마음에 드는 걸로요.',
              '…저도 아직 고민 중이에요. 다 좋아서요.'
            ],
            tips: [
              '…신입 씨, 오늘 배운 건 노트에 적어 두세요. 조리개, 셔터, ISO 순서로요.',
              '…처음엔 노출 삼각형만 알면 돼요. 나머지는 찍다 보면 알게 돼요.',
              '…출사 갈 땐 배터리 두 개, 메모리 카드 두 개. 저는 그렇게 해요.',
              '…모르는 게 있으면 물어보세요. 정리해서 알려 드릴게요.',
              '…크롭 바디는 화각이 좁아져요. 환산 계산은 제가 해 드릴게요.',
              '…처음엔 단렌즈 하나로 오래 찍어 보는 것도 좋아요. 발로 움직이게 돼요.',
              '…좋은 사진을 많이 보세요. 스트릿 사진집 추천해 드릴까요?',
              '…사진은 다음 날 다시 고르세요. 그날은 다 좋아 보여요.'
            ],
            flavor: [
              '…소니가 예쁘장하게 입는다면, 니콘은 진한 색 옷을 입는 느낌이에요. 제 생각엔요.',
              '…주말엔 필름 현상하러 가요. 어후, 벌써 두근거려요.',
              '…모노레일 하나 찍으려고 두 시간 걸은 적 있어요. 그럴 가치가 있었어요.',
              '…아웃포커싱만 잔뜩 한 사진은 요즘 조금 올드한 느낌이에요.',
              '…조용한 날이 좋아요. 사진도 조용해지거든요.',
              '…요즘은 흑백이 좋아요. 색이 없으니까 빛이 더 보여요.',
              '…카메라 시작한 지 5년쯤 됐어요. 아직도 매번 배워요.',
              '…2단 줌 렌즈는 화질이 아쉽다고 들었어요. 확인은 아직이에요.',
              '…불꽃놀이 찍을 땐 더 넓은 렌즈가 있었으면 했어요. 다음엔 준비할게요.',
              '…사진 올리는 건 아직 조금 쑥스러워요. 그래도 올려요.'
            ],
            praise: [
              [['hood', '…! …고, 고맙습니다.'], ['mao', '후드가 놀랐다! 신입 부원, 후드 놀라는 거 처음 봤어요!'], ['hood', '…마오 부장, 조용히 해 주세요.']],
              [['hood', '…크흠. 칭찬은… 조금 부끄러워요.'], ['sora', '후드 선배 후드 더 깊이 눌러쓰는 거 봐요.'], ['hood', '…원래 이렇게 써요.']],
              [['hood', '…세 번이나. 신입 씨는… 좋은 사람이네요.'], ['mao', '후드가 사람 칭찬했어요! 오늘 기념일이에요!'], ['hood', '…다음 사진은 제가 설명할게요. 정리해 둔 거 있어요.']]
            ],
            praiseMore: [
              [['hood', '…감사해요. 노트에 적어 둘게요.']],
              [['hood', '…오홍. 기분 좋네요.'], ['sora', '후드 선배가 오홍 했어요. 진짜 기분 좋은 거예요.']],
              [['hood', '…신입 씨 칭찬은, 이상하게 오래 남아요.'], ['mao', '후드가 길게 말했어요! 신입 부원 대단해요!']]
            ]
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
      luckyToast: name => `🎲 Surprise mood: ${name} (✕ at the bottom right to go back)`,
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
        introCast: [
          ['mao', 'Welcome, new member! I’m Mao, president of the photo club. Thank you so much for joining!'],
          ['sora', 'You’re the new one? I’m Sora. Leaving Mao alone makes me nervous, so I’ll guide you too.'],
          ['hood', '…I’m Hood. I organized some notes on the photos. Take your time.'],
          ['mao', 'Okay, let’s go look at everyone’s photos! Click to move on.']
        ],
        lines: {
          mao: {
            own: [
              'I took this one… I don’t know much yet, but I was so happy shooting it. Your day will come too!',
              'This is mine! I walked all over for the {topic} theme. Can’t embarrass myself as president!',
              'I took 1,200 shots in two months, and this is my favorite. Just shoot a lot, okay?',
              'I went back to the same spot three times for this. They say photos are taken with your feet. Hehe.',
              'I almost turned this black and white because I wasn’t sure about the colors. Glad I didn’t, right?',
              'It drizzled that day and I kept worrying about my camera. It survived!',
              'I went out the moment the {topic} theme was announced. The president should enter first!',
              'I copied a composition I saw on Instagram. They say copying is how you find your own style!'
            ],
            ownWin: [
              'I… won? Really? Sora shot something amazing too… thank you, everyone!',
              'This is my winning shot. Nobody went easy on me because I’m president… right? Please say right!',
              'I really wanted to show you this one. It’s from the day I beat Sora!',
              'I won… writing my own name in the notice was so embarrassing. Hehe.',
              'This one closed the Soma battle score by a point! Cheer for me, okay?',
              'My winning shot! The prize was small, but the feeling was huge.'
            ],
            sora: [
              'Sora’s photo. Wow… how does she get the sky this color? I’ll ask her secretly later.',
              'Sora nags a lot… but she’s really good. That part’s a secret!',
              'Learn from Sora and you’ll improve fast. Just… be ready for the nagging.',
              'Sora grumbles the whole way, but she always finishes the shot. Amazing.',
              'I went out right after seeing this… and only came back with plain sky. Why is hers different?',
              'Sora barely edits, and the colors are still beautiful. What’s the secret?'
            ],
            soraWin: [
              'Sora won again. That’s okay, it’s a great shot! …I’d still like to win next time.',
              'The Soma battle is really Sora versus me. The score… please don’t ask.',
              'The chat goes quiet on days Sora wins. Because I go quiet… hehe.',
              'Credit where it’s due! I voted for this one too. Secret.'
            ],
            hood: [
              'Hood’s photo. She quietly shows up with something this good… amazing.',
              'Honestly, I learned a lot of composition from Hood’s photos. Thanks, Hood!',
              'Hood works out the exposure before she even goes out. Me? I just shoot first. Hehe.',
              'Hood shoots film too. I want to wait for her scans with her!',
              'When Hood posts a photo, the chat suddenly goes quiet. Everyone’s just looking.',
              'Hood’s photos always have such pretty light. She picks her timing so well.'
            ],
            hoodWin: [
              'Hood won with this one! Everyone in the club is so good… I’m proud as president.',
              'Hood doesn’t show up often, but when she does, she wins. I’m counting on you too!',
              'When Hood won, I sent a hundred clapping emojis. Too many…?',
              'I held my breath the first time I saw this. You too, right?'
            ],
            other: [
              'This is {author}’s! Wow… I want to shoot like this too.',
              'So that’s how {author} captured {topic}… it’s lovely.',
              'Remember {author}’s photo, okay? I learn a lot from it too.',
              'Everyone shot {topic} so differently. That’s the fun part!',
              'Seeing {author}’s photo, I realize {topic} was a much bigger theme than I thought!',
              'Wow… how did {author} even find this? I would’ve walked right past it.',
              'Everyone gasped when {author} posted this one in the chat!',
              'Doesn’t a photo like this make you want to go shoot? I already want to!'
            ],
            ongoing: [
              'This one’s still being voted on, so who took it is a secret. Um… could you vote, just once?',
              'This photo’s up for a vote! New members can vote too. It would make me really happy.',
              'Want to guess who took it? …Oh, I can’t tell you until voting ends!',
              'Please vote before the deadline! Your vote counts too.',
              'I don’t know who took this… okay, I do. Still a secret!',
              'Voting happens on the chat board. Ask me if you get lost!'
            ],
            tips: [
              'Please read the notices once! The nickname format is there too.',
              'The Soma battle is a mini contest. When a theme comes out, just send one photo. No pressure!',
              'Win the official contest and your photo becomes the room’s cover. I hope it’s yours someday!',
              'Share photos, talk cameras, or just chat. Make yourself at home!',
              'We go on photo walks sometimes! Come along if you’re free.',
              'If you have Instagram, share it in the board comments. Let’s follow each other!',
              'If you’re inactive for too long… the room rules say we have to let you go. So come by often! Really.',
              'We collect all our photos in the online gallery too. Right here, where you are now!'
            ],
            flavor: [
              'They say your character grows with your lens size! …I said that. Isn’t it true?',
              'A higher f-number keeps the background sharp too… right? Still studying.',
              'Nice words for today: it’s okay to be slow, as long as you don’t give up. Same with photos.',
              'My film is still being developed. So exciting!',
              'Carrying three cameras hurts my shoulders… but they’re all precious.',
              'If you don’t know something, just ask! I ask all the time. Even as president.',
              'I still can’t decide whether to buy a tripod. I already carry so much…',
              'I’ve never used a shutter speed faster than 1/4000. Someday!',
              'If the white balance is off, white isn’t white anymore. Isn’t that wild?',
              'At first I didn’t even know what bokeh was. Now I… sort of do!',
              'A little rain won’t hurt my camera… right? I worry every time.',
              'When I see a great shot I always shout, “Now that’s a real photographer!”'
            ],
            praise: [
              [['mao', 'Really? Hehe… a compliment like that will keep me happy all day.'], ['sora', 'Don’t hype Mao up too much. She’ll buy another camera.'], ['mao', 'I won’t! …Probably.']],
              [['mao', 'Another compliment? You make being president worth it!'], ['hood', '…Mao, your face is red.'], ['mao', 'N-no it’s not! It’s the lighting!']],
              [['mao', 'Three times…! Did you come here just to make me cry?'], ['sora', 'Mao’s going to cry. Someone get a tissue.'], ['mao', 'I’m not crying! …Thank you, really. For joining our club.']]
            ],
            praiseMore: [
              [['mao', 'Hehe… at this rate you’ll take my president spot.'], ['hood', '…That might be a little early.']],
              [['mao', 'Compliments always feel good! You’re the best!'], ['sora', '…You two are having way too much fun.']],
              [['mao', 'I should start a notebook of your compliments. How many is that today?'], ['hood', '…I’m counting. I’ll keep a record.']]
            ]
          },
          sora: {
            own: [
              'Mine. The {topic} round. I waited forever to get the sky tones right.',
              'You can’t shoot on overcast days, no light, no shadows. So I held out until the sun came out.',
              'This isn’t heavily edited, by the way. Getting it right in camera comes first.',
              'I was out before sunrise for this one shot. Don’t copy me. It’s exhausting.',
              'I shot this right after class. The days are getting short, so it was tight.',
              'No tripod, just holding my breath. If it’s blurry, reshoot. No excuses.',
              'I bought a prop just to make one shadow. Fifteen thousand won. Sniff.',
              'Fewer than a hundred of my shots are actually good. This is one. Deleting is a skill too.'
            ],
            ownWin: [
              'My winning shot. …I win so much I lose track. Mao, try harder.',
              'I won again. The Soma battle score? I won’t say it in front of Mao.',
              'This is a winning shot. Study it. Composition, light, timing. All three have to land.',
              'It wasn’t even my most confident shot, and it won. So just enter.',
              'The score gap grew again. Mao, no comforting you today.',
              'Winning’s nice, but it’d be better if you beat me next time. I mean it.'
            ],
            mao: [
              'Mao’s photo. …It came out well. But Mao, you didn’t buy another camera, did you? Please.',
              'Mao, this one’s good. Next time, level the horizon, though. It’s not nagging, it’s advice.',
              'Mao shoots on passion. For technique… learn from me.',
              'Mao, you thought about making this black and white, didn’t you? Good call not to.',
              'Mao gets better every time. …I’ll admit that. Skill, not gear.',
              'When Mao asks you something she doesn’t know, answer for me. I’m busy.'
            ],
            maoWin: [
              'Mao won this time. I admit it. …It won’t happen again. Sniff, just kidding.',
              'I lost that day. Don’t bring it up around Mao. She’ll talk about it all day.',
              'When Mao wins, the notice gets posted three times. Brace yourself.',
              'Fine, this one’s great. Her best, honestly. Don’t tell her.'
            ],
            hood: [
              'Hood’s photo. She never talks, but her photos are always the right answer. Mao, learn from this.',
              'Get into the habit of planning shots like Hood. That’s one thing I can’t beat.',
              'Hood’s photos are quiet, but you never get tired of them. Shoot photos like that.',
              'Hood shoots film too. I gave up when I saw film prices. Sniff.'
            ],
            hoodWin: [
              'Hood shows up now and then and takes it. Mao, look. This is the model answer.',
              'Hood’s win rate must be ninety percent. When she enters, get nervous.',
              'Even I get nervous when I’m up against Hood. Secret.',
              'There was no beating this one. Clean loss.'
            ],
            other: [
              'This is {author}’s. Good read on the light. Mao, take notes.',
              'So that’s how they did {topic}. {author}, nice eye.',
              'See {author}’s photo? That’s what owning a theme looks like.',
              '{author}’s photos have nothing extra. Practice taking things out first.',
              '{author}, I never thought of this angle for {topic}. Nice.',
              'Look at the horizon here. Perfectly level. Mao, are you listening?',
              '{author} doesn’t overdo the color. Turn your saturation down first.',
              'This one was waited for. It didn’t just happen. You can tell.'
            ],
            ongoing: [
              'It’s still being voted on, so the photographer is secret. And anyone who hasn’t voted, please do. Mao will cry again.',
              'Voting is easy. Just pick the one you like. Don’t overthink it.',
              'Guessing who took it is fine, but no saying it out loud. Rules.',
              'The deadline is strict. Late votes don’t count. No exceptions for newbies.',
              'If you like two… still pick one. Please.',
              'No dropping hints in the chat before results. It’s always obvious.'
            ],
            tips: [
              'For moody shots, use the viewfinder, not the screen. How many times do I have to say it.',
              'Overcast days have no light and no shadows, so everything looks dull. Aim for clear days.',
              'When editing, start with the RGB curves. Just learn the three primaries. You listening?',
              'Gear lust can wait. If you turn into Mao, we’re in trouble.',
              'Colors can go flat when you move edits from computer to phone. Always check on the phone last.',
              'It’s dark after class, so there’s nothing to shoot. Aim for weekend mornings.',
              'Use whichever eye feels natural on the viewfinder. Most of us use the left. You?',
              'Sell lenses you don’t use. More gear doesn’t mean better photos.'
            ],
            flavor: [
              'You know the Soma battle is Sora vs. Mao, right? I’m ahead.',
              'Film is the future? Look at film prices. One roll costs as much as a point-and-shoot.',
              'Sniff, I tidied up the notices for Mao again today.',
              'Look at a photo you like again the next day. If it still works, it’s really good.',
              'How to shoot well? Shoot a lot, delete a lot. That’s it.',
              'The current score? I’m ahead. I won’t say the numbers in front of Mao.',
              'I win the chat quiz games too. It’s not just photos.',
              'When 300 messages pile up in the chat, I just want to mark them all read. Sniff.',
              'It’s autumn-leaf season and I haven’t shot a single leaf. This week, for sure.',
              'No hiding your photos because they’re embarrassing. Just post them.'
            ],
            praise: [
              [['sora', '…I’m used to compliments. Hearing it like this is a little embarrassing, though.'], ['mao', 'Sora’s embarrassed! Did you see that?'], ['sora', 'Mao, be quiet!']],
              [['sora', 'Sniff, if you say that I have to win next time too.'], ['hood', '…Sora, your ears are red.'], ['sora', 'Not you too, Hood…! Next photo. Quickly.']],
              [['sora', '…That’s the third time. Are you teasing me?'], ['mao', 'They mean it! You’re the best shooter here!'], ['sora', '…I know. Still, thank you. Just this once, I’ll say it properly.']]
            ],
            praiseMore: [
              [['sora', 'Stop complimenting and go shoot something. That’s the best compliment.']],
              [['sora', '…Fine. I’ll skip one round of nagging today.'], ['mao', 'Sora is skipping the nagging! Mark the calendar!']],
              [['sora', 'Thanks for the compliment. Now level your horizons.'], ['hood', '…It ended in nagging after all.']]
            ]
          },
          hood: {
            own: [
              '…This is my photo. {topic}. I worked out the exposure beforehand.',
              '…I shoot film too. Waiting for the scans is the most exciting part.',
              '…I scouted this spot three times first. Try picking your place before anything else.',
              '…Twenty minutes before sunset is best. I took this then.',
              '…I send film out for scans, but I choose the frames myself. This is one I picked.',
              '…This took one press of the shutter. I got lucky.',
              '…I wanted to try a street feel. A little awkward, right?',
              '…I have lots of photos to post, but picking one is the hardest part. This is the one.'
            ],
            ownWin: [
              '…It won. The sunlight was nice. I think the preparation paid off.',
              '…This one went according to plan. For once.',
              '…After it won, I added a line to my notes: “Light comes if you wait.”',
              '…When I heard it won, I actually smiled a little. Just a little.'
            ],
            mao: [
              '…Mao’s photo. She ignored the camera advice, but… it’s a good photo.',
              '…Mao, you’ve really improved. I mean it.',
              '…Mao asks right away when she doesn’t know something. I think that’s why she improves so fast.',
              '…Mao’s photos always look like she had fun. Because she did.',
              '…Mao, the horizon is level this time. Sora will be pleased.',
              '…Three cameras worry me for her shoulders. The photo is good, though.'
            ],
            maoWin: [
              '…Mao won. Congratulations. (quiet clapping)',
              '…Mao smiled all day that day. I liked that too.',
              '…The notices get long when Mao wins. She looks happy, so it’s fine.',
              '…I liked this one too. My vote is secret, though.'
            ],
            sora: [
              '…Sora’s photo. She nags a lot, but she’s really good at skies.',
              '…Sora’s photo. Deep, rich colors. I want to learn that.',
              '…Everything Sora nags about is right. It’s just a little hard to hear.',
              '…Sora doesn’t shoot on overcast days. That’s why her photos always have light.',
              '…Sora’s horizons are exact. Like she used a ruler.',
              '…Sora went out before sunrise for this. I respect that.'
            ],
            soraWin: [
              '…Sora again. Not surprising. She works hard.',
              '…Sora nags even when she wins. Things like “this is just the basics.”',
              '…I keep Sora’s winning shots in a separate notebook. For studying.',
              '…It deserved to win. Ahem, I’ll try harder.'
            ],
            other: [
              '…{author}’s photo. Clean composition. I’ll make a note.',
              '…{topic}. You can shoot it like this, too. Ooh.',
              '…This photo has one place for your eye to rest. That’s why it works.',
              '…{author} reads where the light comes from. Ahem, I should learn that.',
              '…{author}’s colors are calm. I think our taste is similar.',
              '…I never thought of reading {topic} this way. Noted.',
              '…The longer you look at this one, the better it gets. Look once more.',
              '…The clean background is nice. Your eye doesn’t wander.'
            ],
            ongoing: [
              '…It’s being voted on. Who took it is a secret. …Ahem.',
              '…New members can vote too. Just pick a number.',
              '…Vote quietly, for the one you like.',
              '…I’m still deciding too. They’re all good.'
            ],
            tips: [
              '…Write down what you learn today. Aperture, shutter, ISO, in that order.',
              '…At first, the exposure triangle is all you need. The rest comes with shooting.',
              '…Two batteries and two memory cards for every outing. That’s my rule.',
              '…Ask me anything. I’ll organize it and explain.',
              '…A crop body narrows your field of view. I’ll do the conversion math for you.',
              '…Shooting with one prime lens for a while is good. It makes you move your feet.',
              '…Look at lots of good photos. Want a street photo book recommendation?',
              '…Pick your photos again the next day. Everything looks good on the day.'
            ],
            flavor: [
              '…If Sony dresses pretty, Nikon wears dark clothes. That’s my take.',
              '…I’m getting film developed this weekend. Already excited.',
              '…I once walked two hours to shoot one monorail. It was worth it.',
              '…Photos that are all blurry background feel a little old these days.',
              '…I like quiet days. Photos get quiet too.',
              '…I like black and white lately. Without color, you see the light more.',
              '…I’ve been doing photography for about five years. I still learn every time.',
              '…I heard two-step zooms aren’t so sharp. Haven’t checked yet.',
              '…Shooting fireworks, I wished for a wider lens. Next time I’ll be ready.',
              '…Posting photos is still a little embarrassing. I post anyway.'
            ],
            praise: [
              [['hood', '…! …Th-thank you.'], ['mao', 'Hood was surprised! First time I’ve ever seen that!'], ['hood', '…Mao, please be quiet.']],
              [['hood', '…Ahem. Compliments are… a little embarrassing.'], ['sora', 'Look, Hood just pulled her hood down further.'], ['hood', '…I always wear it like this.']],
              [['hood', '…Three times. You’re… a nice person.'], ['mao', 'Hood complimented someone! Today’s a holiday!'], ['hood', '…I’ll explain the next photo. I have notes.']]
            ],
            praiseMore: [
              [['hood', '…Thank you. I’ll write that down.']],
              [['hood', '…Ooh. That feels nice.'], ['sora', 'Hood said “ooh.” She’s genuinely happy.']],
              [['hood', '…Your compliments stay with me for some reason.'], ['mao', 'Hood said a whole sentence! You’re amazing!']]
            ]
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
  const VN_SPOTS = ['left', 'right']; // 사진을 가리지 않게 양옆에만

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
    let spot = VN_SPOTS[Math.floor(Math.random() * VN_SPOTS.length)];
    let queue = []; // 지금 장면에서 이어서 나올 대사들 ([누가, 대사] …)

    // 같은 대사가 금방 다시 나오지 않게: 한 묶음을 섞어서 다 쓴 뒤에야 다시 섞음 (직전 대사로는 시작 안 함)
    const bags = {};
    const pickFresh = (key, list) => {
      if (!list || !list.length) return '';
      let bag = bags[key];
      if (!bag || bag.len !== list.length || bag.pos >= bag.order.length) {
        const order = list.map((_, i) => i);
        for (let i = order.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [order[i], order[j]] = [order[j], order[i]];
        }
        const last = bag ? bag.last : -1;
        if (order.length > 1 && order[0] === last) order.push(order.shift());
        bag = bags[key] = { order, pos: 0, len: list.length, last };
      }
      const idx = bag.order[bag.pos++];
      bag.last = idx;
      return list[idx];
    };
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
      if (meta.isAnonymous) return pickFresh(`${who}.ongoing`, lines.ongoing);
      // 가끔은 사진 이야기 대신 신입 부원에게 알려 주는 팁이나 잡담
      const roll = Math.random();
      if (roll < 0.12) return pickFresh(`${who}.tips`, lines.tips);
      if (roll < 0.24) return pickFresh(`${who}.flavor`, lines.flavor);
      const author = meta.authorLabel || '';
      const award = typeof getPhotoAward === 'function' ? getPhotoAward(photo) : null;
      // 우승작이어도 열에 넷은 평소 대사로 (소라 우승작이 많아서 '우승' 대사만 반복되지 않게)
      const won = Boolean(award && award.isTopWinner) && Math.random() < 0.6;
      const authorKey = VN_KEYS.find(k => VN_CHARS[k].koName === author);
      let poolKey;
      if (authorKey === who) poolKey = won ? 'ownWin' : 'own';
      else if (authorKey) poolKey = won && lines[`${authorKey}Win`] ? `${authorKey}Win` : authorKey;
      else poolKey = author ? 'other' : 'flavor';
      const shownAuthor = authorKey ? V().names[authorKey] : author;
      return pickFresh(`${who}.${poolKey}`, lines[poolKey])
        .replace(/\{author\}/g, shownAuthor)
        .replace(/\{topic\}/g, topicOf(photo));
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
        if (newSpot) {
          const spots = VN_SPOTS.filter(s => who !== speaker || s !== spot);
          spot = pickOne(spots);
        }
        sprite.classList.remove('is-in');
        void sprite.offsetWidth;
        sprite.src = VN_CHARS[who].img;
        sprite.dataset.spot = spot;
        stage.dataset.side = spot; // 사진은 캐릭터 반대편으로 비켜 섬
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

    const playScene = scene => {
      if (!scene || !scene.length) return;
      queue = scene.slice(1);
      const [who, text] = scene[0];
      say(who, text, speaker === null);
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
      if (queue.length) {
        const [who, text] = queue.shift();
        say(who, text, false);
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
        say(speaker, pickFresh(`${speaker}.flavor`, V().lines[speaker].flavor), false);
      } else if (key === 'praise') {
        // 칭찬: 1번째 · 2번째 · 3번째 장면을 차례로, 그 뒤로는 덤 장면을 겹치지 않게
        const who = speaker;
        affinity[who] += 1;
        renderHearts();
        heartPop(who);
        const lines = V().lines[who];
        const level = affinity[who];
        playScene(level <= lines.praise.length ? lines.praise[level - 1] : pickFresh(`${who}.praiseMore`, lines.praiseMore));
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
    // 신입 부원에게 셋이 차례로 인사
    playScene(V().introCast);
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

  /* ---------- 페이지를 열 때(새로고침 포함) 30% 확률로 아무 분위기나 저절로 켜짐 ----------
     주소 뒤에 ?mood=space 처럼 붙이면 그 분위기로, ?mood=random 이면 무작위로 바로 열림 */
  const LUCKY_CHANCE = 0.3; // 0.3 = 30% (10번에 3번 정도)

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

  /* ---------- 페이지를 열 때: 눈 · 비가 오면 그 날씨로, 아니면 30% 확률로 아무 분위기나 ----------
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
