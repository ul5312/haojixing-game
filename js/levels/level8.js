// 第 8 關：好記幸翻翻樂（思考與記憶）
// 兩輪翻牌配對：3 對（6 張）→ 4 對（8 張）；每輪開始先偷看 8 秒
// 每輪固定有一對好記幸包裝盒
window.HJX = window.HJX || {};
HJX.games = HJX.games || {};

(function () {
  // 電鍋沒有對應的表情符號，用 SVG 畫
  var RICE_COOKER =
    '<svg class="mm-svg" viewBox="0 0 100 100" aria-hidden="true">' +
      '<ellipse cx="50" cy="30" rx="34" ry="9" fill="#E9E4DC"/>' +
      '<rect x="44" y="15" width="12" height="8" rx="3" fill="#3A2A1A"/>' +
      '<path d="M16 32 Q16 28 20 28 H80 Q84 28 84 32 V78 Q84 88 74 88 H26 Q16 88 16 78 Z" fill="#E0503A"/>' +
      '<rect x="10" y="40" width="8" height="14" rx="3" fill="#B53A28"/>' +
      '<rect x="82" y="40" width="8" height="14" rx="3" fill="#B53A28"/>' +
      '<rect x="40" y="62" width="20" height="14" rx="3" fill="#fff"/>' +
      '<rect x="46" y="65" width="8" height="8" rx="2" fill="#3A2A1A"/>' +
      '<rect x="22" y="88" width="10" height="5" rx="2" fill="#3A2A1A"/>' +
      '<rect x="68" y="88" width="10" height="5" rx="2" fill="#3A2A1A"/>' +
    '</svg>';

  // 每輪每種類只出一樣，避免同類圖案（例如兩種水果）太像而混淆
  var CATEGORIES = [
    [{ icon: '🍵', name: '熱茶' }, { icon: '🧋', name: '珍奶' }],
    [{ icon: '🍎', name: '蘋果' }, { icon: '🍌', name: '香蕉' }, { icon: '🍉', name: '西瓜' }],
    [{ svg: RICE_COOKER, name: '電鍋' }],
    [{ icon: '🥟', name: '小籠包' }, { icon: '🍡', name: '湯圓' }],
    [{ icon: '🚲', name: '腳踏車' }, { icon: '🛵', name: '機車' }],
    [{ icon: '🐶', name: '小狗' }, { icon: '🐱', name: '小貓' }],
    [{ icon: '🌸', name: '櫻花' }, { icon: '🌻', name: '向日葵' }],
    [{ icon: '🏮', name: '燈籠' }, { icon: '🧧', name: '紅包' }]
  ];
  var PRODUCT = { icon: 'product', name: '好記幸' };
  var ROUNDS = [
    { pairs: 3, peek: 8 },
    { pairs: 4, peek: 8 }
  ];

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  HJX.games[8] = function (stage, done, S) {
    var r = 0;
    var flips = 0; // 兩輪合計翻了幾次（每翻兩張算一次）
    var back = '<span class="mm-q">?</span><span class="mm-brand">好記幸</span>';

    function playRound() {
      var cfg = ROUNDS[r];
      var faces = shuffle(CATEGORIES).slice(0, cfg.pairs - 1).map(function (cat) {
        return cat[Math.floor(Math.random() * cat.length)];
      }).concat([PRODUCT]);
      var deck = shuffle(faces.concat(faces));
      var open = [];
      var matched = 0;
      var locked = true;

      stage.innerHTML =
        '<div class="round-info" id="mmsg">第 ' + (r + 1) + ' 輪：先偷看 ' + cfg.peek + ' 秒 👀</div>' +
        '<div class="mm-grid">' +
          deck.map(function (f, i) {
            var face = f.icon === 'product'
              ? '<img class="mm-product" src="img/product-box.png" alt="好記幸包裝盒">'
              : f.svg || '<span class="mm-icon">' + f.icon + '</span>';
            return '<button class="mm-card show" data-i="' + i + '" aria-label="卡片">' +
              '<span class="mm-inner">' +
                '<span class="mm-back">' + back + '</span>' +
                '<span class="mm-face">' + face + '<span class="mm-name">' + f.name + '</span></span>' +
              '</span>' +
            '</button>';
          }).join('') +
        '</div>' +
        '<p class="center muted" id="mcount"></p>';

      var cards = stage.querySelectorAll('.mm-card');
      var msg = document.getElementById('mmsg');

      // 偷看倒數，結束後全部蓋起來
      var left = cfg.peek;
      var timer = setInterval(function () {
        // 倒數中離開這一關，畫面已被換掉，就停止計時
        if (!stage.isConnected) { clearInterval(timer); return; }
        left--;
        if (left > 0) { msg.textContent = '第 ' + (r + 1) + ' 輪：先偷看 ' + left + ' 秒 👀'; return; }
        clearInterval(timer);
        cards.forEach(function (c) { c.classList.remove('show'); });
        msg.textContent = '第 ' + (r + 1) + ' 輪：翻兩張，找一樣的！';
        locked = false;
        count();
      }, 1000);

      function count() {
        document.getElementById('mcount').textContent = '已配對 ' + matched + ' / ' + cfg.pairs + ' 組';
      }

      cards.forEach(function (c) {
        c.onclick = function () {
          if (locked || c.classList.contains('show')) return;
          HJX.sfx.pop();
          c.classList.add('show');
          open.push(c);
          if (open.length < 2) return;

          flips++;
          locked = true;
          var a = deck[+open[0].getAttribute('data-i')];
          var b = deck[+open[1].getAttribute('data-i')];
          if (a.name === b.name) {
            open.forEach(function (x) { x.classList.add('matched'); });
            open = [];
            matched++;
            HJX.sfx.ding();
            count();
            locked = false;
            if (matched === cfg.pairs) {
              msg.textContent = '全部找到了！🎉';
              setTimeout(roundDone, 900);
            }
            return;
          }
          // 不一樣：停久一點讓長輩看清楚再蓋回去
          setTimeout(function () {
            open.forEach(function (x) { x.classList.remove('show'); });
            open = [];
            locked = false;
          }, 1300);
        };
      });
    }

    function roundDone() {
      HJX.sfx.fanfare();
      var last = r + 1 === ROUNDS.length;
      stage.innerHTML =
        '<div class="feedback ok pop">' +
          HJX.mascot('cheer', '').replace('<svg', '<svg style="width:110px;height:110px"') +
          '<h2>' + (last ? '全部配對完成！' : '第 1 輪完成！') + '</h2>' +
          '<p>' + (last ? '記憶力真好！' : '下一輪卡片變多囉，準備好了嗎？') + '</p>' +
        '</div>' +
        '<button class="btn" id="next">' + (last ? '完成！' : '下一輪 ▶') + '</button>';
      document.getElementById('next').onclick = function () {
        r++;
        if (r < ROUNDS.length) return playRound();
        // 最少需要 7 次（3＋4 組），依多翻的次數給星
        done(flips <= 10 ? 3 : flips <= 15 ? 2 : 1);
      };
    }

    playRound();
  };
})();
