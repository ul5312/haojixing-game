// 第 3 關：這句說過了嗎？（重複的話）
// 阿福伯一句一句講話，共 10 句，其中 3 句是隔 1～3 句後再講一次
window.HJX = window.HJX || {};
HJX.games = HJX.games || {};

(function () {
  var UNIQUE = 7;
  var REPEATS = 3;
  var TOTAL = UNIQUE + REPEATS;

  var POOL = [
    '今天天氣真好，適合出去走走。',
    '我早上吃了一碗地瓜粥。',
    '隔壁的小黃狗又跑來我們家了。',
    '菜市場的高麗菜今天特別便宜。',
    '孫子下禮拜要回來看我們。',
    '我年輕的時候很會騎腳踏車。',
    '晚上電視有演布袋戲喔。',
    '公園的櫻花開了，好漂亮。',
    '等一下記得把衣服收進來。',
    '巷口那間麵店的滷肉飯最好吃。',
    '這個禮拜六要去喝喜酒。',
    '我把老花眼鏡放在桌上了。'
  ];

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // 排出 10 句：前 6 句新句子裡挑 3 句，隔 1～3 句後重複
  function build() {
    var base = shuffle(POOL).slice(0, UNIQUE);
    var repeatIdx = shuffle([0, 1, 2, 3, 4, 5]).slice(0, REPEATS);
    var seq = [];
    var pending = [];
    var u = 0;
    while (seq.length < TOTAL) {
      pending.sort(function (a, b) { return a.at - b.at; });
      if (pending.length && (pending[0].at <= seq.length || u >= UNIQUE)) {
        seq.push({ text: pending.shift().text, rep: true });
        continue;
      }
      var text = base[u];
      seq.push({ text: text, rep: false });
      if (repeatIdx.indexOf(u) >= 0) {
        pending.push({ text: text, at: seq.length + 1 + Math.floor(Math.random() * 3) });
      }
      u++;
    }
    return seq;
  }

  HJX.games[3] = function (stage, done, S) {
    var seq = build();
    var idx = 0;
    var correct = 0;

    function show() {
      var item = seq[idx];
      stage.innerHTML =
        '<div class="round-info">第 ' + (idx + 1) + ' / ' + TOTAL + ' 句</div>' +
        '<div class="speaker">' +
          '<div class="speaker-face">👴</div>' +
          '<div class="speaker-name">阿福伯</div>' +
        '</div>' +
        '<div class="say-bubble pop">' + item.text +
          '<button class="read-btn" id="read" style="display:block;margin:12px auto 0">🔊 唸給我聽</button>' +
        '</div>' +
        '<div id="fb" class="mini-fb"></div>' +
        '<div class="judge" id="judge">' +
          '<button class="btn green" data-rep="0">🆕 第一次聽到</button>' +
          '<button class="btn" data-rep="1">🔁 說過了！</button>' +
        '</div>';

      document.getElementById('read').onclick = function () {
        HJX.voice.say(item.text);
      };
      stage.querySelectorAll('[data-rep]').forEach(function (b) {
        b.onclick = function () { answer(b.getAttribute('data-rep') === '1'); };
      });
    }

    function answer(saidRep) {
      var item = seq[idx];
      var ok = saidRep === item.rep;
      var fb = document.getElementById('fb');
      document.getElementById('judge').innerHTML = '';

      if (ok) {
        correct++;
        HJX.sfx.ding();
        fb.className = 'mini-fb ok pop';
        fb.textContent = item.rep ? '👍 對！這句剛剛說過了' : '👍 對！這句是第一次說';
        setTimeout(next, 1600);
        return;
      }
      // 答錯：說明後讓玩家自己按下一句，不急著跳走
      fb.className = 'mini-fb retry pop';
      fb.textContent = item.rep ? '這句剛剛有說過喔！' : '這句是第一次說喔！';
      document.getElementById('judge').innerHTML = '<button class="btn" id="next">下一句 ▶</button>';
      document.getElementById('next').onclick = next;
    }

    function next() {
      idx++;
      if (idx < TOTAL) return show();
      done(correct >= 9 ? 3 : correct >= 6 ? 2 : 1);
    }

    show();
  };

  // 產生語音稿用
  HJX.games[3].lines = function () { return POOL.slice(); };
})();
