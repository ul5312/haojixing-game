// 第 2 關：快樂嗜好園（興趣與活力）
// 挑一個嗜好玩一段輕鬆小互動：種花、泡茶、打鼓。重點是參與，完成就給 3 顆星
window.HJX = window.HJX || {};
HJX.games = HJX.games || {};

(function () {
  var HOBBIES = [
    { id: 'garden', icon: '🌻', name: '種花', desc: '幫三盆花澆水，看它們開花',
      chat: '聊聊看：{t}以前有種過什麼花或菜嗎？' },
    { id: 'tea', icon: '🍵', name: '泡茶', desc: '跟著發亮的步驟，泡一壺好茶',
      chat: '聊聊看：{t}最喜歡喝什麼茶？' },
    { id: 'drum', icon: '🥁', name: '打鼓', desc: '哪個鼓亮了就敲它，咚咚咚！',
      chat: '聊聊看：{t}年輕時最愛聽哪一首歌？可以一起哼哼看。' }
  ];

  var TEA_STEPS = [
    { icon: '🔥', label: '燒開水' },
    { icon: '🍃', label: '放茶葉' },
    { icon: '🫖', label: '倒熱水' },
    { icon: '🍵', label: '倒進茶杯' }
  ];

  var DRUM_HITS = 8;
  // 種子 → 前三次都是綠葉、一次比一次大 → 第四次才開花，避免還沒澆完就看起來已經開花
  var PLANT = [
    { icon: '🟤', size: '2.4rem' },
    { icon: '🌱', size: '2.4rem' },
    { icon: '🌿', size: '3rem' },
    { icon: '🌿', size: '3.8rem' },
    { icon: '🌻', size: '4.2rem' }
  ];

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  HJX.games[2] = function (stage, done, S) {
    var played = {};
    var t = S.title || '長輩';

    // ---------- 選嗜好 ----------
    function choose() {
      stage.innerHTML =
        '<div class="round-info">想玩哪一個呢？</div>' +
        '<div class="hobbies">' +
          HOBBIES.map(function (h) {
            return '<button class="hobby fade-in" data-h="' + h.id + '">' +
              '<span class="h-icon">' + h.icon + '</span>' +
              '<span><b>' + h.name + (played[h.id] ? ' ✓' : '') + '</b><br><span class="small muted">' + h.desc + '</span></span>' +
            '</button>';
          }).join('') +
        '</div>' +
        (Object.keys(played).length ? '<button class="btn green" id="finish" style="margin-top:20px">完成這一關 ▶</button>' : '');

      stage.querySelectorAll('[data-h]').forEach(function (b) {
        b.onclick = function () {
          HJX.sfx.pop();
          var id = b.getAttribute('data-h');
          ({ garden: garden, tea: tea, drum: drum })[id]();
        };
      });
      var f = document.getElementById('finish');
      if (f) f.onclick = function () { done(3); };
    }

    // ---------- 玩完一個嗜好 ----------
    function finished(h) {
      played[h.id] = true;
      HJX.sfx.fanfare();
      var chat = h.chat.replace(/\{t\}/g, t);
      stage.innerHTML =
        '<div class="feedback ok pop">' +
          HJX.mascot('cheer', '').replace('<svg', '<svg style="width:110px;height:110px"') +
          '<h2>好棒！' + h.icon + '</h2>' +
          '<p>' + h.name + '完成囉！</p>' +
        '</div>' +
        '<div class="card soft tip"><span class="t-icon">💬</span><div>' + chat + '</div></div>' +
        '<button class="btn" id="again">再玩一個嗜好</button>' +
        '<button class="btn green" id="finish">完成這一關 ▶</button>';
      HJX.voice.say(chat, true);
      document.getElementById('again').onclick = choose;
      document.getElementById('finish').onclick = function () { done(3); };
    }

    // ---------- 種花：每盆點 4 次就開花 ----------
    function garden() {
      var h = HOBBIES[0];
      var pots = [0, 0, 0];
      stage.innerHTML =
        '<div class="round-info">點花盆幫它澆水 💧</div>' +
        '<div class="garden">' +
          pots.map(function (_, i) {
            return '<button class="pot" data-p="' + i + '">' +
              '<span class="plant" style="font-size:' + PLANT[0].size + '">' + PLANT[0].icon + '</span><span class="pot-base"></span>' +
            '</button>';
          }).join('') +
        '</div>' +
        '<p class="center muted" id="gmsg">每盆澆幾次水，就會長大喔！</p>';

      stage.querySelectorAll('[data-p]').forEach(function (b) {
        b.onclick = function () {
          var i = +b.getAttribute('data-p');
          if (pots[i] >= PLANT.length - 1) return;
          pots[i]++;
          HJX.sfx.drop();
          var plant = b.querySelector('.plant');
          plant.textContent = PLANT[pots[i]].icon;
          plant.style.fontSize = PLANT[pots[i]].size;
          plant.classList.remove('grow'); void plant.offsetWidth; plant.classList.add('grow');
          var drop = document.createElement('span');
          drop.className = 'drop'; drop.textContent = '💧';
          b.appendChild(drop);
          setTimeout(function () { drop.remove(); }, 700);
          if (pots[i] === PLANT.length - 1) b.classList.add('bloom');
          var bloomed = pots.filter(function (p) { return p === PLANT.length - 1; }).length;
          document.getElementById('gmsg').textContent = '已經開了 ' + bloomed + ' / 3 朵花';
          if (bloomed === 3) setTimeout(function () { finished(h); }, 900);
        };
      });
    }

    // ---------- 泡茶：照順序點，下一步會發亮提示 ----------
    function tea() {
      var h = HOBBIES[1];
      var step = 0;
      var order = shuffle(TEA_STEPS.map(function (_, i) { return i; }));
      stage.innerHTML =
        '<div class="round-info" id="tmsg">第 1 步：' + TEA_STEPS[0].label + '</div>' +
        '<div class="tea-pot" id="pot">🫖</div>' +
        '<div class="tea-steps">' +
          order.map(function (i) {
            return '<button class="tea-step" data-s="' + i + '"><span class="ts-icon">' + TEA_STEPS[i].icon + '</span>' + TEA_STEPS[i].label + '</button>';
          }).join('') +
        '</div>';

      function glow() {
        stage.querySelectorAll('[data-s]').forEach(function (b) {
          b.classList.toggle('glow', +b.getAttribute('data-s') === step);
        });
      }
      stage.querySelectorAll('[data-s]').forEach(function (b) {
        b.onclick = function () {
          var s = +b.getAttribute('data-s');
          if (s !== step) {
            b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
            return;
          }
          HJX.sfx.pop();
          b.classList.add('used');
          b.disabled = true;
          var pot = document.getElementById('pot');
          pot.textContent = TEA_STEPS[step].icon;
          pot.classList.remove('grow'); void pot.offsetWidth; pot.classList.add('grow');
          step++;
          if (step === TEA_STEPS.length) {
            document.getElementById('tmsg').textContent = '一壺好茶泡好了！';
            setTimeout(function () { finished(h); }, 900);
            return;
          }
          document.getElementById('tmsg').textContent = '第 ' + (step + 1) + ' 步：' + TEA_STEPS[step].label;
          glow();
        };
      });
      glow();
    }

    // ---------- 打鼓：亮起的鼓會一直亮，直到敲中為止，不計時 ----------
    function drum() {
      var h = HOBBIES[2];
      var hits = 0;
      var lit = -1;
      var prev = -1;
      stage.innerHTML =
        '<div class="round-info" id="dmsg">敲亮起來的鼓：0 / ' + DRUM_HITS + '</div>' +
        '<div class="drums">' +
          [0, 1, 2].map(function (i) {
            return '<button class="drum d' + i + '" data-d="' + i + '">🥁</button>';
          }).join('') +
        '</div>';

      function next() {
        var n;
        do { n = Math.floor(Math.random() * 3); } while (n === prev);
        lit = n;
        stage.querySelectorAll('[data-d]').forEach(function (b) {
          b.classList.toggle('lit', +b.getAttribute('data-d') === lit);
        });
      }
      stage.querySelectorAll('[data-d]').forEach(function (b) {
        b.onclick = function () {
          var d = +b.getAttribute('data-d');
          HJX.sfx.drum(d);
          b.classList.remove('hit'); void b.offsetWidth; b.classList.add('hit');
          if (d !== lit) return;
          // 敲中後先熄燈，避免同一下被重複計分
          prev = lit;
          lit = -1;
          b.classList.remove('lit');
          hits++;
          document.getElementById('dmsg').textContent = '敲亮起來的鼓：' + hits + ' / ' + DRUM_HITS;
          if (hits === DRUM_HITS) {
            setTimeout(function () { finished(h); }, 600);
            return;
          }
          setTimeout(next, 250);
        };
      });
      next();
    }

    choose();
  };

  // 產生語音稿用：聊天話題會帶入每種稱呼
  HJX.games[2].lines = function (titles) {
    var out = [];
    titles.forEach(function (t) {
      HOBBIES.forEach(function (h) { out.push(h.chat.replace(/\{t\}/g, t)); });
    });
    return out;
  };
})();
