// 第 6 關：菜市場買菜（金錢處理）
// 三攤付剛好的錢（由簡單到難），最後一題算找零
window.HJX = window.HJX || {};
HJX.games = HJX.games || {};

(function () {
  var MONEY = [
    { v: 1, kind: 'coin c1' },
    { v: 5, kind: 'coin c5' },
    { v: 10, kind: 'coin c10' },
    { v: 50, kind: 'coin c50' },
    { v: 100, kind: 'bill b100' },
    { v: 500, kind: 'bill b500' }
  ];
  var TRAY_MAX = 15;

  // 依難度分三組，每組抽一攤
  var STALLS = [
    [
      { icon: '🥬', name: '高麗菜', unit: '一顆', price: 35 },
      { icon: '🧅', name: '洋蔥', unit: '一袋', price: 25 },
      { icon: '🥚', name: '雞蛋', unit: '一盒', price: 45 },
      { icon: '🌽', name: '玉米', unit: '兩根', price: 30 }
    ],
    [
      { icon: '🍌', name: '香蕉', unit: '一串', price: 60 },
      { icon: '🍅', name: '番茄', unit: '一斤', price: 55 },
      { icon: '🍠', name: '地瓜', unit: '一袋', price: 75 },
      { icon: '🧄', name: '大蒜', unit: '一包', price: 65 }
    ],
    [
      { icon: '🐟', name: '虱目魚', unit: '一尾', price: 125 },
      { icon: '🍗', name: '雞腿', unit: '三支', price: 150 },
      { icon: '🍍', name: '鳳梨', unit: '兩顆', price: 110 },
      { icon: '🦐', name: '蝦子', unit: '半斤', price: 180 }
    ]
  ];

  var CHANGE = [
    { icon: '🍎', name: '蘋果', price: 80, paid: 100 },
    { icon: '🍉', name: '西瓜', price: 150, paid: 200 },
    { icon: '🍊', name: '橘子', price: 65, paid: 100 },
    { icon: '🥩', name: '豬肉', price: 230, paid: 500 }
  ];

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function moneyOf(v) { return MONEY.filter(function (m) { return m.v === v; })[0]; }
  function chip(v, attr) {
    return '<button class="money ' + moneyOf(v).kind + '" ' + attr + '>' + v + '</button>';
  }

  // 提示用：由大到小湊出剛好的錢
  function suggest(price) {
    var out = [];
    [500, 100, 50, 10, 5, 1].forEach(function (v) {
      while (price >= v) { out.push(v); price -= v; }
    });
    return out.join(' ＋ ');
  }

  HJX.games[6] = function (stage, done, S) {
    var stalls = STALLS.map(pick);
    var idx = 0;
    var score = 0;

    function payRound() {
      var st = stalls[idx];
      var tray = [];
      var tries = 0;

      stage.innerHTML =
        '<div class="round-info">第 ' + (idx + 1) + ' / 4 攤</div>' +
        '<div class="stall fade-in">' +
          '<div class="stall-roof"></div>' +
          '<div class="stall-body">' +
            '<span class="stall-icon">' + st.icon + '</span>' +
            '<div><b>' + st.name + '</b>　' + st.unit + '<div class="price-tag">' + st.price + ' 元</div></div>' +
          '</div>' +
        '</div>' +
        '<div class="tray-box">' +
          '<div class="tray-head"><span>付錢盤 <span class="small muted">（點錢可以拿回來）</span></span><b id="total">0 元</b></div>' +
          '<div class="tray-money" id="tray"></div>' +
        '</div>' +
        '<div id="fb" class="mini-fb"></div>' +
        '<div class="wallet">' +
          MONEY.map(function (m) { return chip(m.v, 'data-add="' + m.v + '"'); }).join('') +
        '</div>' +
        '<div class="pay-row">' +
          '<button class="btn ghost" id="clear">清空</button>' +
          '<button class="btn green" id="pay">付錢 ✔</button>' +
        '</div>';

      var trayEl = document.getElementById('tray');
      var fb = document.getElementById('fb');

      function sum() { return tray.reduce(function (a, b) { return a + b; }, 0); }
      function draw() {
        trayEl.innerHTML = tray.length
          ? tray.map(function (v, i) { return chip(v, 'data-rm="' + i + '"'); }).join('')
          : '<span class="muted small">點下面的錢放進來</span>';
        document.getElementById('total').textContent = sum() + ' 元';
        trayEl.querySelectorAll('[data-rm]').forEach(function (b) {
          b.onclick = function () {
            tray.splice(+b.getAttribute('data-rm'), 1);
            HJX.sfx.pop();
            draw();
          };
        });
      }

      stage.querySelectorAll('[data-add]').forEach(function (b) {
        b.onclick = function () {
          if (tray.length >= TRAY_MAX) return;
          tray.push(+b.getAttribute('data-add'));
          HJX.sfx.pop();
          fb.className = 'mini-fb'; fb.textContent = '';
          draw();
        };
      });
      document.getElementById('clear').onclick = function () { tray = []; draw(); };
      document.getElementById('pay').onclick = function () {
        var s = sum();
        if (s === st.price) {
          if (tries === 0) score++;
          HJX.sfx.ding();
          stage.innerHTML =
            '<div class="feedback ok pop">' +
              '<div style="font-size:3.4rem;line-height:1.3">' + st.icon + '🛍️</div>' +
              '<h2>剛剛好！</h2><p>老闆：「謝謝！慢走喔～」</p>' +
            '</div>' +
            '<button class="btn" id="next">下一攤 ▶</button>';
          document.getElementById('next').onclick = function () {
            idx++;
            if (idx < stalls.length) payRound(); else changeRound();
          };
          return;
        }
        tries++;
        fb.className = 'mini-fb retry pop';
        fb.textContent = s < st.price
          ? '還差 ' + (st.price - s) + ' 元喔！'
          : '多了 ' + (s - st.price) + ' 元，點盤子裡的錢可以拿回來';
        if (tries >= 3) fb.textContent += '　💡 可以這樣付：' + suggest(st.price);
      };
      draw();
    }

    function changeRound() {
      var c = pick(CHANGE);
      var ans = c.paid - c.price;
      var opts = shuffle([ans, ans + 10, ans > 10 ? ans - 10 : ans + 20]);
      stage.innerHTML =
        '<div class="round-info">第 4 / 4 攤：算找零</div>' +
        '<div class="stall fade-in">' +
          '<div class="stall-roof"></div>' +
          '<div class="stall-body">' +
            '<span class="stall-icon">' + c.icon + '</span>' +
            '<div><b>' + c.name + '</b><div class="price-tag">' + c.price + ' 元</div></div>' +
          '</div>' +
        '</div>' +
        '<div class="card soft center">' +
          '<p style="margin:0 0 8px">你給老闆</p>' + chip(c.paid, 'disabled') +
          '<p class="obs-q" style="margin:12px 0 0">老闆要找你多少錢？</p>' +
        '</div>' +
        '<div id="fb" class="mini-fb"></div>' +
        '<div class="month-opts cols3" id="opts">' +
          opts.map(function (v) { return '<button class="btn ghost" data-v="' + v + '">' + v + ' 元</button>'; }).join('') +
        '</div>';

      stage.querySelectorAll('[data-v]').forEach(function (b) {
        b.onclick = function () {
          var ok = +b.getAttribute('data-v') === ans;
          var fb = document.getElementById('fb');
          var line = c.paid + ' － ' + c.price + ' ＝ ' + ans + ' 元';
          if (ok) { score++; HJX.sfx.ding(); }
          fb.className = 'mini-fb ' + (ok ? 'ok' : 'retry') + ' pop';
          fb.textContent = (ok ? '👍 對！' : '答案是：') + line;
          document.getElementById('opts').innerHTML = '<button class="btn" id="next" style="grid-column:1/-1">完成！</button>';
          document.getElementById('next').onclick = function () {
            done(score === 4 ? 3 : score >= 2 ? 2 : 1);
          };
        };
      });
    }

    payRound();
  };
})();
