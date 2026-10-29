// 第 7 關：看診記事本（記住約定）
// 先記住兩個約定 → 找蘋果小遊戲（干擾） → 回答三題約定內容
window.HJX = window.HJX || {};
HJX.games = HJX.games || {};

(function () {
  var EVENTS = [
    { icon: '🦷', name: '看牙醫' },
    { icon: '👁️', name: '眼科回診' },
    { icon: '💉', name: '打流感疫苗' },
    { icon: '🍜', name: '里民聚餐' },
    { icon: '💇', name: '剪頭髮' },
    { icon: '🎂', name: '孫子生日' },
    { icon: '🧘', name: '社區健康操' }
  ];
  var DAYS = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
  var TIMES = ['上午 9 點', '上午 10 點', '上午 11 點', '中午 12 點', '下午 2 點', '下午 3 點', '下午 4 點'];
  // 不放桃子、櫻桃等外形像蘋果的水果，避免誤認
  var FRUITS = ['🍌', '🍊', '🍇', '🍐', '🍍', '🍋', '🥝', '🍓'];
  var APPLES = 4;
  var GRID = 12;

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  // 正確答案＋另一個約定的答案（容易混淆）＋一個其他選項
  function opts3(ans, tempt, pool) {
    var rest = shuffle(pool.filter(function (x) { return x !== ans && x !== tempt; }));
    return shuffle([ans, tempt, rest[0]]);
  }

  HJX.games[7] = function (stage, done, S) {
    var ev = shuffle(EVENTS).slice(0, 2);
    var days = shuffle(DAYS).slice(0, 2);
    var times = shuffle(TIMES).slice(0, 2);
    var appts = [0, 1].map(function (i) { return { e: ev[i], day: days[i], time: times[i] }; });
    var a = appts[0];
    var b = appts[1];
    var correct = 0;

    function noteHtml() {
      return '<div class="note pop">' +
        '<div class="note-title">📒 我的記事本</div>' +
        appts.map(function (p) {
          return '<div class="note-line"><span class="note-icon">' + p.e.icon + '</span>' +
            '<div><b class="nowrap">' + p.day + '</b>　<b class="nowrap">' + p.time + '</b><br>' + p.e.name + '</div></div>';
        }).join('') +
      '</div>';
    }

    // ---------- 1. 記住約定 ----------
    function memorize() {
      // 約定是隨機組合，拆成星期、時間、事情三小段拼接播放
      var parts = [];
      appts.forEach(function (p) { parts.push(p.day, p.time, p.e.name); });
      stage.innerHTML =
        '<div class="round-info">先把這兩個約定記起來 🧠</div>' +
        noteHtml() +
        '<button class="read-btn note-read" id="read">🔊 唸給我聽</button>' +
        '<button class="btn" id="ok">我記住了 ▶</button>';
      document.getElementById('read').onclick = function () {
        HJX.voice.say(parts);
      };
      document.getElementById('ok').onclick = apples;
    }

    // ---------- 2. 干擾：找出所有蘋果 ----------
    function apples() {
      var cells = shuffle(
        Array(APPLES).fill('🍎').concat(shuffle(FRUITS).concat(shuffle(FRUITS)).slice(0, GRID - APPLES))
      );
      var found = 0;
      stage.innerHTML =
        '<div class="round-info" id="amsg">先休息一下：找出所有的 🍎（0 / ' + APPLES + '）</div>' +
        '<div class="fruit-grid">' +
          cells.map(function (f) { return '<button class="fruit" data-f="' + f + '">' + f + '</button>'; }).join('') +
        '</div>';
      stage.querySelectorAll('[data-f]').forEach(function (btn) {
        btn.onclick = function () {
          if (btn.classList.contains('got')) return;
          if (btn.getAttribute('data-f') !== '🍎') {
            btn.classList.remove('shake'); void btn.offsetWidth; btn.classList.add('shake');
            return;
          }
          HJX.sfx.pop();
          btn.classList.add('got');
          found++;
          document.getElementById('amsg').textContent = '先休息一下：找出所有的 🍎（' + found + ' / ' + APPLES + '）';
          if (found === APPLES) {
            HJX.sfx.ding();
            setTimeout(recall, 900);
          }
        };
      });
    }

    // ---------- 3. 回想約定 ----------
    function recall() {
      var qs = [
        { q: a.e.icon + ' ' + a.e.name + '是星期幾？', ans: a.day, opts: opts3(a.day, b.day, DAYS) },
        { q: a.e.icon + ' ' + a.e.name + '是幾點？', ans: a.time, opts: opts3(a.time, b.time, TIMES) },
        { q: b.day + '要做什麼？',
          ans: b.e.name,
          opts: opts3(b.e.name, a.e.name, EVENTS.map(function (e) { return e.name; })) }
      ];
      var i = 0;

      function show() {
        var q = qs[i];
        stage.innerHTML =
          '<div class="round-info">想一想：第 ' + (i + 1) + ' / ' + qs.length + ' 題</div>' +
          '<div class="note note-closed">📒 記事本闔起來了，靠記憶回答喔！</div>' +
          '<p class="cal-q">' + q.q + '</p>' +
          '<div id="fb" class="mini-fb"></div>' +
          '<div class="month-opts" id="opts">' +
            q.opts.map(function (o) { return '<button class="btn ghost" data-o="' + o + '">' + o + '</button>'; }).join('') +
          '</div>';
        stage.querySelectorAll('[data-o]').forEach(function (btn) {
          btn.onclick = function () {
            var ok = btn.getAttribute('data-o') === q.ans;
            var fb = document.getElementById('fb');
            if (ok) { correct++; HJX.sfx.ding(); }
            fb.className = 'mini-fb ' + (ok ? 'ok' : 'retry') + ' pop';
            fb.textContent = (ok ? '👍 對！' : '答案是：') + q.ans;
            document.getElementById('opts').innerHTML = '<button class="btn" id="next">' + (i + 1 < qs.length ? '下一題 ▶' : '看看記事本 ▶') + '</button>';
            document.getElementById('next').onclick = function () {
              i++;
              if (i < qs.length) show(); else reveal();
            };
          };
        });
      }
      show();
    }

    // ---------- 4. 打開記事本對答案 ----------
    function reveal() {
      stage.innerHTML =
        '<div class="round-info">記事本打開來對對看 📖</div>' +
        noteHtml() +
        '<div class="card soft tip"><span class="t-icon">💡</span><div>重要的約定寫在月曆或記事本上，就不怕忘記囉！</div></div>' +
        '<button class="btn" id="fin">完成！</button>';
      document.getElementById('fin').onclick = function () {
        done(correct === 3 ? 3 : correct === 2 ? 2 : 1);
      };
    }

    memorize();
  };

  // 產生語音稿用：記事本內容是拼接播放，所以每個星期、時間、事情各一段
  HJX.games[7].lines = function () {
    return DAYS.concat(TIMES, EVENTS.map(function (e) { return e.name; }));
  };
})();
