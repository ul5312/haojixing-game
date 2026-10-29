// 第 1 關：防詐小達人（判斷力）
// 每次從題庫抽 5 則訊息，判斷「可以相信」或「小心詐騙」
window.HJX = window.HJX || {};
HJX.games = HJX.games || {};

(function () {
  var ROUNDS = 5;

  // scam：true 為詐騙；why：答完後的說明
  var POOL = [
    { scam: true, type: '📞 來電', from: '不明號碼', avatar: '❓',
      text: '猜猜我是誰？我換新號碼了啦！最近急著用錢，可以先借我 3 萬嗎？',
      why: '「猜猜我是誰」是常見詐騙。先掛掉，打原本存的號碼給本人確認。' },
    { scam: true, type: '✉️ 簡訊', from: '幸運大抽獎', avatar: '🎁',
      text: '恭喜您抽中百萬大獎！請先匯手續費 5,000 元，就能領獎。',
      why: '中獎還要先付錢，一定是詐騙！' },
    { scam: true, type: '📞 來電', from: '自稱地檢署', avatar: '🏛️',
      text: '您的帳戶涉及洗錢案，請馬上把存款轉到我們的「安全帳戶」。',
      why: '政府機關不會用電話要你轉帳，更沒有什麼「安全帳戶」。' },
    { scam: true, type: '✉️ 簡訊', from: '健保通知', avatar: '💳',
      text: '您的健保卡即將停用，請點連結輸入身分證字號和銀行帳號。',
      why: '來路不明的連結不要點，更不能輸入身分證和帳號。' },
    { scam: true, type: '💬 LINE', from: '投資老師', avatar: '📈',
      text: '保證獲利！加入我們的群組，一個月讓你的錢變兩倍。',
      why: '說「保證賺錢」的投資，幾乎都是詐騙。' },
    { scam: true, type: '✉️ 簡訊', from: '物流中心', avatar: '📦',
      text: '您的包裹地址有誤，請點此連結補繳運費 25 元。',
      why: '假冒物流的簡訊很多，有包裹問題請直接打給店家或物流公司。' },
    { scam: false, type: '💬 LINE', from: '小美（女兒）', avatar: '👩',
      text: '我晚上 7 點回家吃飯喔！要幫你買什麼嗎？',
      why: '這是家人平常的問候，沒有要錢，可以放心。' },
    { scam: false, type: '✉️ 簡訊', from: '仁愛診所', avatar: '🏥',
      text: '提醒您明天上午 10 點回診，請記得帶健保卡。',
      why: '這只是回診提醒，沒有要錢也沒有連結，可以相信。' },
    { scam: false, type: '💬 LINE', from: '里長', avatar: '🧑‍💼',
      text: '明天早上 9 點，社區活動中心有免費量血壓，歡迎來喔！',
      why: '這是社區活動通知，不用付錢，可以相信。' },
    { scam: false, type: '💬 LINE', from: '小明（孫子）', avatar: '👦',
      text: '生日快樂！週末我們回去幫你切蛋糕 🎂',
      why: '這是家人的祝福，可以開心收下！' }
  ];

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // 抽題：至少 2 則詐騙、2 則安全，避免全部同一種
  function pick() {
    var scams = shuffle(POOL.filter(function (m) { return m.scam; }));
    var safes = shuffle(POOL.filter(function (m) { return !m.scam; }));
    var rest = shuffle(scams.slice(2).concat(safes.slice(2)));
    return shuffle(scams.slice(0, 2).concat(safes.slice(0, 2), rest.slice(0, ROUNDS - 4)));
  }

  HJX.games[1] = function (stage, done, S) {
    var list = pick();
    var idx = 0;
    var correct = 0;

    function show() {
      var m = list[idx];
      stage.innerHTML =
        '<div class="round-info">第 ' + (idx + 1) + ' / ' + ROUNDS + ' 則</div>' +
        '<div class="phone fade-in">' +
          '<div class="phone-head">' +
            '<span class="avatar">' + m.avatar + '</span>' +
            '<div><b>' + m.from + '</b><br><span class="small muted">' + m.type + '</span></div>' +
          '</div>' +
          '<div class="bubble">' + m.text + '</div>' +
          '<button class="read-btn" id="read">🔊 唸給我聽</button>' +
        '</div>' +
        '<div class="judge">' +
          '<button class="btn green" data-ans="safe">✅ 可以相信</button>' +
          '<button class="btn danger" data-ans="scam">⚠️ 小心詐騙</button>' +
        '</div>';

      document.getElementById('read').onclick = function () {
        HJX.voice.say(m.from + '傳來：' + m.text);
      };
      stage.querySelectorAll('[data-ans]').forEach(function (b) {
        b.onclick = function () { answer(b.getAttribute('data-ans') === 'scam'); };
      });
    }

    function answer(saidScam) {
      var m = list[idx];
      var ok = saidScam === m.scam;
      if (ok) { correct++; HJX.sfx.ding(); }
      var head = ok ? '答對了！' : '再想想喔！';
      var verdict = m.scam ? '⚠️ 這是詐騙' : '✅ 這則可以相信';
      stage.innerHTML =
        '<div class="feedback ' + (ok ? 'ok' : 'retry') + ' pop">' +
          HJX.mascot(ok ? 'cheer' : 'think', '').replace('<svg', '<svg style="width:110px;height:110px"') +
          '<h2>' + head + '</h2>' +
          '<div class="verdict ' + (m.scam ? 'scam' : 'safe') + '">' + verdict + '</div>' +
          '<p>' + m.why + '</p>' +
        '</div>' +
        '<button class="btn" id="next">' + (idx + 1 < ROUNDS ? '下一則 ▶' : '完成！') + '</button>';
      HJX.voice.say(head + m.why, true);
      document.getElementById('next').onclick = function () {
        idx++;
        if (idx < ROUNDS) return show();
        done(correct === ROUNDS ? 3 : correct >= 3 ? 2 : 1);
      };
    }

    show();
  };

  // 產生語音稿用：本關所有可能唸到的句子
  HJX.games[1].lines = function () {
    var out = [];
    POOL.forEach(function (m) {
      out.push(m.from + '傳來：' + m.text, '答對了！' + m.why, '再想想喔！' + m.why);
    });
    return out;
  };
})();
