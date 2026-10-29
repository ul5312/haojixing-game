// 主程式：畫面切換、進度存檔、各頁面
(function () {
  var app = document.getElementById('app');
  var KEY = 'hjx-progress-v1';

  // ---------- 進度存檔（存在玩家自己的裝置） ----------
  var S = load();

  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY));
      if (s && s.levels) return s;
    } catch (e) { /* 無法讀取時用預設值 */ }
    return { title: null, levels: {} };
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* 無法存檔時仍可遊玩 */ }
  }

  // ---------- 主畫面會唸的句子 ----------
  var SAY = {
    intro: '玩法很簡單：一、陪長輩一起玩小遊戲。二、玩完回答一題小觀察。三、八關都完成，就能看到觀察整理。',
    map: function (t) { return '請選一個關卡，和' + t + '一起玩。'; },
    result: '這是今天的腦力證書和觀察整理。',
    cheers: ['太棒了！', '好厲害！', '做得真好！']
  };

  // 產生語音稿用：列出主畫面所有可能唸到的句子（含每種稱呼）
  HJX.appLines = function (titles) {
    var out = [SAY.intro, SAY.result].concat(SAY.cheers);
    titles.forEach(function (t) {
      out.push(SAY.map(t));
      HJX.LEVELS.forEach(function (L) { out.push(L.obs.replace(/\{t\}/g, t)); });
    });
    HJX.LEVELS.forEach(function (L) { out.push(L.name + '。' + L.howto, L.howto); });
    return out;
  };

  // ---------- 小工具 ----------
  function title() { return S.title || '長輩'; }
  function fill(text) { return text.replace(/\{t\}/g, title()); }
  function level(id) { return HJX.LEVELS.filter(function (l) { return l.id === id; })[0]; }
  function rec(id) { return S.levels[id] || {}; }
  function starsHtml(n) {
    var h = '';
    for (var i = 1; i <= 3; i++) h += '<span class="' + (i <= n ? 'star-on' : 'star-off') + '">★</span>';
    return h;
  }
  function doneCount() {
    return HJX.LEVELS.filter(function (l) { return rec(l.id).obs; }).length;
  }
  function go(hash) { location.hash = hash; }

  HJX.toast = function (msg) {
    var old = document.querySelector('.toast');
    if (old) old.remove();
    var t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 3200);
  };

  function speakBtn(id, text) {
    return '<button class="icon-btn" data-say="' + id + '" data-text="' + text.replace(/"/g, '&quot;') + '" aria-label="唸給我聽">🔊</button>';
  }

  function topbar(back, label, sayId, sayText) {
    return '<div class="topbar">' +
      (back ? '<button class="icon-btn" data-go="' + back + '" aria-label="返回">←</button>' : '<span style="width:64px"></span>') +
      '<div class="title">' + label + '</div>' +
      (sayId ? speakBtn(sayId, sayText) : '<span style="width:64px"></span>') +
    '</div>';
  }

  function render(html) {
    HJX.voice.stop();
    app.innerHTML = '<div class="fade-in">' + html + '</div>';
    window.scrollTo(0, 0);
  }

  // ---------- 首頁 ----------
  function home() {
    var lead = '陪家中長輩一起動動腦，八個小關卡，玩完也順便留意他的日常小變化。';
    render(
      '<div class="hero">' +
        HJX.mascot('cheer', 'mascot float') +
        '<h1><small>好記幸</small>腦力陪玩趣</h1>' +
        '<p class="lead">' + lead + '</p>' +
      '</div>' +
      '<div class="home-product">' +
        '<img src="img/product-box.png" alt="好記幸 麥角硫因 包裝盒">' +
        '<div><b>好記幸 麥角硫因</b><br><span class="muted small">日常營養補給・思緒保養</span></div>' +
      '</div>' +
      '<p class="muted small center">每一頁都可以按 🔊 唸給長輩聽</p>' +
      '<button class="btn" data-go="' + (S.title ? 'map' : 'intro') + '">' + (doneCount() ? '繼續陪玩 ▶' : '開始陪玩 ▶') + '</button>' +
      '<button class="btn ghost" data-go="intro">玩法說明</button>' +
      '<p class="disclaimer center" style="margin-top:28px">本遊戲為休閒腦力活動，觀察結果僅供參考，不具診斷意義。</p>'
    );
  }

  // ---------- 玩法說明＋選擇陪玩對象 ----------
  function intro() {
    var text = SAY.intro;
    render(
      topbar('home', '玩法說明', 'intro', text) +
      '<div class="card">' +
        '<h2>給照顧者的話</h2>' +
        '<p>這是一套陪長輩一起玩的小遊戲。每關只要一兩分鐘，玩完會請您回答一題小觀察，幫您留意長輩最近幾年的變化。</p>' +
        '<ol class="steps">' +
          '<li><span class="num">1</span><div><b>一起玩</b><br><span class="muted">把手機或平板拿給長輩，在旁邊陪著玩。</span></div></li>' +
          '<li><span class="num">2</span><div><b>小觀察</b><br><span class="muted">玩完由您回答一題，依平常對長輩的了解作答就好。</span></div></li>' +
          '<li><span class="num">3</span><div><b>看整理</b><br><span class="muted">八關都完成後，會整理出觀察結果與建議。</span></div></li>' +
        '</ol>' +
      '</div>' +
      '<div class="card">' +
        '<div class="label">今天陪誰一起玩？</div>' +
        '<div class="chips">' +
          HJX.TITLES.map(function (t) {
            return '<button class="chip' + (S.title === t ? ' on' : '') + '" data-title="' + t + '">' + t + '</button>';
          }).join('') +
        '</div>' +
      '</div>' +
      '<button class="btn" data-go="map" ' + (S.title ? '' : 'disabled') + ' id="toMap">準備好了，出發！</button>'
    );
  }

  // ---------- 關卡地圖 ----------
  function map() {
    var done = doneCount();
    var stars = HJX.LEVELS.reduce(function (sum, l) { return sum + (rec(l.id).stars || 0); }, 0);
    render(
      topbar('home', '關卡地圖', 'map', SAY.map(title())) +
      '<div class="card">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">' +
          '<b>陪玩對象：' + title() + '</b>' +
          '<button class="chip" data-go="intro" style="min-height:52px">更換</button>' +
        '</div>' +
        '<div class="progress" aria-label="完成進度"><i style="width:' + (done / 8 * 100) + '%"></i></div>' +
        '<div class="muted small">已完成 ' + done + ' / 8 關　・　共 <span class="star-on">★</span> ' + stars + ' 顆</div>' +
      '</div>' +
      '<div class="map">' +
        HJX.LEVELS.map(function (l) {
          var r = rec(l.id);
          return '<button class="stage' + (r.obs ? ' done' : '') + '" data-go="level/' + l.id + '">' +
            '<span class="no">' + (r.obs ? '✓' : l.id) + '</span>' +
            '<span class="emoji">' + l.icon + '</span>' +
            '<span class="name">' + l.name + '</span>' +
            '<span class="stars">' + (r.stars ? starsHtml(r.stars) : '') + '</span>' +
          '</button>';
        }).join('') +
      '</div>' +
      '<button class="btn green" data-go="result" ' + (done ? '' : 'disabled') + '>' +
        (done === 8 ? '看觀察整理 ▶' : '先看目前的整理（' + done + '/8）') +
      '</button>'
    );
  }

  // ---------- 關卡：說明 → 遊戲 → 慶祝 → 小觀察 ----------
  function levelPage(id) {
    var L = level(id);
    if (!L) return go('map');
    var stars = 0;

    function introStep() {
      render(
        topbar('map', '第 ' + L.id + ' 關', 'L' + L.id + '-howto', L.name + '。' + L.howto) +
        '<div class="card center">' +
          '<div class="level-icon">' + L.icon + '</div>' +
          '<h2>' + L.name + '</h2>' +
          '<span class="tag">' + L.area + '</span>' +
          '<p style="margin-top:14px;font-size:1.1rem">' + L.howto + '</p>' +
        '</div>' +
        '<div class="card soft tip"><span class="t-icon">💡</span><div><b>陪玩小提示</b><br>' + L.tip + '</div></div>' +
        '<button class="btn" id="play">開始遊戲 ▶</button>'
      );
      document.getElementById('play').onclick = playStep;
    }

    function playStep() {
      // 各關遊戲尚未製作，先放佔位畫面
      var game = HJX.games && HJX.games[L.id];
      render(
        topbar('map', L.name, 'L' + L.id + '-howto', L.howto) +
        '<div class="' + (game ? 'game-area' : 'stage-area') + '" id="stage"></div>'
      );
      var stage = document.getElementById('stage');
      if (game) {
        game(stage, function (s) { stars = s; celebrateStep(); }, S);
      } else {
        stage.innerHTML =
          HJX.mascot('think', '') .replace('<svg', '<svg style="width:140px;height:140px"') +
          '<h3 style="margin-top:12px">這一關的遊戲製作中</h3>' +
          '<p class="muted">雛型階段，可先按下方按鈕模擬完成。</p>' +
          '<button class="btn" id="fake" style="max-width:360px">模擬完成（試玩用）</button>';
        document.getElementById('fake').onclick = function () { stars = 3; celebrateStep(); };
      }
    }

    function celebrateStep() {
      var cheer = SAY.cheers[Math.floor(Math.random() * SAY.cheers.length)];
      render(
        '<div class="celebrate" style="padding-top:24px">' +
          HJX.mascot('cheer', 'pop').replace('<svg', '<svg style="width:170px;height:170px"') +
          '<h1 style="color:var(--orange-deep)">' + cheer + '</h1>' +
          '<div class="big-stars pop">' + starsHtml(stars) + '</div>' +
          '<p class="muted" style="margin-top:12px">' + L.name + ' 完成！</p>' +
        '</div>' +
        '<div class="card mint center" style="margin-top:20px">接下來請<b>照顧者</b>接手，回答一題小觀察 🙂</div>' +
        '<button class="btn green" id="next">換我回答 ▶</button>'
      );
      HJX.voice.say(cheer, true);
      document.getElementById('next').onclick = observeStep;
    }

    function observeStep() {
      var q = fill(L.obs);
      render(
        topbar(null, '陪玩小觀察', 'L' + L.id + '-obs', q) +
        '<div class="card">' +
          '<span class="tag">' + L.area + '</span>' +
          '<p class="obs-q" style="margin-top:12px">' + q + '</p>' +
          '<p class="muted small">依您平常對' + title() + '的了解作答即可，沒有對錯。</p>' +
          '<div class="obs-options">' +
            // 三個選項樣式一致，避免引導作答
            HJX.OBS_OPTIONS.map(function (o) {
              return '<button class="btn ghost" data-obs="' + o.id + '">' + o.label + '</button>';
            }).join('') +
          '</div>' +
        '</div>'
      );
      app.querySelectorAll('[data-obs]').forEach(function (b) {
        b.onclick = function () {
          var prev = rec(L.id).stars || 0;
          S.levels[L.id] = { stars: Math.max(prev, stars), obs: b.getAttribute('data-obs') };
          save();
          HJX.toast('已記錄，謝謝您！');
          go(doneCount() === 8 ? 'result' : 'map');
        };
      });
    }

    introStep();
  }

  // ---------- 觀察整理 ----------
  function result() {
    var yes = HJX.LEVELS.filter(function (l) { return rec(l.id).obs === 'yes'; }).length;
    var done = doneCount();
    var stars = HJX.LEVELS.reduce(function (sum, l) { return sum + (rec(l.id).stars || 0); }, 0);
    var today = new Date();
    var dateStr = today.getFullYear() + ' 年 ' + (today.getMonth() + 1) + ' 月 ' + today.getDate() + ' 日';
    var ansLabel = { yes: '有變化', no: '沒有變化', unsure: '不確定' };

    var advice = yes >= HJX.SUGGEST_THRESHOLD
      ? '<div class="card soft"><h3>💛 建議進一步了解</h3>' +
          '<p>有 <b>' + yes + '</b> 項觀察到變化。建議帶' + title() + '到醫院<b>神經內科</b>或<b>精神科</b>門診，做進一步的認知功能評估。</p>' +
          '<p style="margin:0">早一點了解，就能早一點安排適合的照顧方式。</p></div>'
      : '<div class="card mint"><h3>🌿 持續陪伴、定期關心</h3>' +
          '<p style="margin:0">目前觀察到的變化不多。建議每年至少留意一次，平常多陪' + title() + '聊天、動動腦、出門走走。</p></div>';

    render(
      topbar('map', '觀察整理', 'result', SAY.result) +
      '<div class="card cert">' +
        HJX.mascot('cheer', '').replace('<svg', '<svg style="width:110px;height:110px"') +
        '<h2 style="color:var(--orange-deep);margin-top:6px">今日腦力證書</h2>' +
        '<p style="font-size:1.15rem">頒給 <b>' + title() + '</b></p>' +
        '<p class="big-stars" style="font-size:1.6rem;margin:0"><span class="star-on">★</span> ' + stars + ' / 24</p>' +
        '<p class="muted small" style="margin:6px 0 0">' + dateStr + '・好記幸腦力陪玩趣</p>' +
      '</div>' +

      '<div class="card">' +
        '<h3>陪玩小觀察整理</h3>' +
        (done < 8 ? '<p class="muted small">目前完成 ' + done + ' / 8 關，全部完成後的整理會更完整。</p>' : '') +
        HJX.LEVELS.map(function (l) {
          var o = rec(l.id).obs || 'none';
          return '<div class="result-row"><span>' + l.icon + ' ' + l.area + '</span>' +
            '<span class="ans ' + o + '">' + (ansLabel[o] || '尚未完成') + '</span></div>';
        }).join('') +
      '</div>' +
      advice +

      '<div class="card">' +
        '<h3>🤗 照顧者，您也辛苦了</h3>' +
        '<p style="margin:0">願意花時間陪伴、留意家人，就是最好的照顧。也別忘了照顧好自己。</p>' +
      '</div>' +

      // 產品介紹（文案為草稿，上線前請確認合規）
      '<div class="card" style="border:3px solid var(--orange)">' +
        '<div style="display:flex;gap:14px;align-items:center">' +
          HJX.mascot('happy', '').replace('<svg', '<svg style="width:80px;height:80px;flex:none"') +
          '<div><h3 style="margin:0;color:var(--orange-deep)">好記幸 麥角硫因</h3>' +
          '<span class="muted small">日常營養補給・思緒保養</span></div>' +
        '</div>' +
        '<ul style="padding-left:1.2em;margin:14px 0">' +
          '<li>麥角硫因（Ergothioneine）是天然存在於菇類中的營養成分</li>' +
          '<li>搭配卵磷脂，一次補充更方便</li>' +
          '<li>適合想為家中長輩做日常營養補給的您</li>' +
        '</ul>' +
        '<a class="btn" href="' + HJX.OFFICIAL_SITE + '" target="_blank" rel="noopener">前往官網了解 ▶</a>' +
      '</div>' +

      '<button class="btn ghost" data-go="map">回到關卡地圖</button>' +
      '<button class="btn ghost" id="reset">清除紀錄，重新開始</button>' +

      '<p class="disclaimer">本遊戲觀察題參考失智症早期篩檢的面向設計，僅供參考，不具診斷意義，也不能取代專業醫療評估。如有疑慮，請洽各醫院神經內科或精神科門診。好記幸為食品，非藥品，不具醫療效能。</p>'
    );
    document.getElementById('reset').onclick = function () {
      if (!confirm('確定要清除所有紀錄嗎？')) return;
      S = { title: S.title, levels: {} };
      save();
      go('map');
    };
  }

  // ---------- 共用點擊事件 ----------
  app.addEventListener('click', function (e) {
    var el = e.target.closest('button, a');
    if (!el) return;
    if (el.dataset.go) { go(el.dataset.go); return; }
    if (el.dataset.say) { HJX.voice.say(el.dataset.text); return; }
    if (el.dataset.title) {
      S.title = el.dataset.title; save();
      app.querySelectorAll('[data-title]').forEach(function (c) { c.classList.toggle('on', c === el); });
      document.getElementById('toMap').disabled = false;
    }
  });

  // ---------- 路由 ----------
  function route() {
    var h = location.hash.replace('#', '') || 'home';
    var m = h.match(/^level\/(\d+)$/);
    if (m) return levelPage(+m[1]);
    if (h === 'intro') return intro();
    if (h === 'map') return S.title ? map() : go('intro');
    if (h === 'result') return result();
    home();
  }
  window.addEventListener('hashchange', route);
  route();
})();
