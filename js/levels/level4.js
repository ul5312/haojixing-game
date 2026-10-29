// 第 4 關：家電小幫手（學用新器具）
// 三個任務：微波爐熱便當、遙控器看電視、冷氣遙控器調溫度
// 照提示一步一步按；同一步按錯兩次，正確按鈕會發亮提示
window.HJX = window.HJX || {};
HJX.games = HJX.games || {};

(function () {
  function $(root, id) { return root.querySelector('#' + id); }

  var TASKS = [
    {
      name: '微波爐熱便當', icon: '🍱', doneText: '便當熱好了，開飯囉！', doneIcon: '🍱✨',
      html:
        '<div class="mw">' +
          '<button class="mw-door" data-k="door">' +
            '<span class="mw-win" id="mwWin"></span>' +
            '<span class="mw-label" id="mwLabel">👆 點這裡開門</span>' +
            '<span class="mw-handle"></span>' +
          '</button>' +
          '<div class="mw-panel">' +
            '<div class="lcd" id="mwDisp">--:--</div>' +
            '<button class="dev-btn" data-k="30s">30 秒</button>' +
            '<button class="dev-btn" data-k="1m">1 分鐘</button>' +
            '<button class="dev-btn go" data-k="start">開始</button>' +
            '<button class="dev-btn" data-k="stop">停止</button>' +
          '</div>' +
        '</div>' +
        '<div class="tray"><button class="item-btn" data-k="bento" id="bento">🍱 便當</button></div>',
      steps: [
        { k: 'door', tip: '點微波爐的門，把門打開',
          after: function (r) { $(r, 'mwWin').parentNode.classList.add('open'); $(r, 'mwLabel').textContent = '門開了'; } },
        { k: 'bento', tip: '把 🍱 便當放進微波爐',
          after: function (r) { $(r, 'bento').style.visibility = 'hidden'; $(r, 'mwWin').textContent = '🍱'; $(r, 'mwLabel').textContent = '👆 點這裡關門'; } },
        { k: 'door', tip: '再點一次門，把門關上',
          after: function (r) { $(r, 'mwWin').parentNode.classList.remove('open'); $(r, 'mwLabel').textContent = ''; } },
        { k: '1m', tip: '按「1 分鐘」設定時間',
          after: function (r) { $(r, 'mwDisp').textContent = '1:00'; } },
        { k: 'start', tip: '按綠色的「開始」',
          after: function (r) {
            // 快轉倒數，讓玩家看到正在加熱
            var win = $(r, 'mwWin');
            var disp = $(r, 'mwDisp');
            win.parentNode.classList.add('heating');
            var s = 60;
            var timer = setInterval(function () {
              s -= 6;
              disp.textContent = '0:' + (s < 10 ? '0' : '') + Math.max(s, 0);
              if (s <= 0) { clearInterval(timer); disp.textContent = '叮！'; HJX.sfx.ding(); }
            }, 150);
            return 1900;
          } }
      ]
    },
    {
      name: '遙控器看電視', icon: '📺', doneText: '歌唱節目開始囉，一起聽歌！', doneIcon: '📺🎤',
      html:
        '<div class="tv" id="tv"><div class="tv-screen" id="tvScreen"></div><div class="tv-vol" id="tvVol"></div></div>' +
        '<div class="remote">' +
          '<button class="dev-btn power" data-k="power">⏻ 電源</button>' +
          [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (n) {
            return '<button class="dev-btn num" data-k="n' + n + '">' + n + '</button>';
          }).join('') +
          '<button class="dev-btn" data-k="vdown">音量－</button>' +
          '<button class="dev-btn num" data-k="n0">0</button>' +
          '<button class="dev-btn" data-k="vup">音量＋</button>' +
        '</div>',
      steps: [
        { k: 'power', tip: '按紅色的「電源」打開電視',
          after: function (r) { $(r, 'tv').classList.add('on'); $(r, 'tvScreen').innerHTML = '第 1 台<br>📰 新聞'; } },
        { k: 'n8', tip: '按數字「8」，轉到第 8 台',
          after: function (r) { $(r, 'tvScreen').innerHTML = '第 8 台<br>🎤 歌唱節目'; } },
        { k: 'vup', tip: '按「音量＋」，把聲音調大',
          after: function (r) { $(r, 'tvVol').textContent = '🔊 ▮▮▮▮▯▯'; } },
        { k: 'vup', tip: '再按一次「音量＋」',
          after: function (r) { $(r, 'tvVol').textContent = '🔊 ▮▮▮▮▮▯'; } }
      ]
    },
    {
      name: '冷氣調溫度', icon: '❄️', doneText: '冷氣涼涼的，好舒服！', doneIcon: '❄️😊',
      html:
        '<div class="ac" id="ac"><div class="ac-lcd" id="acLcd"></div><div class="ac-vent"></div><div class="ac-wind" id="acWind">〰️ 〰️ 〰️</div></div>' +
        '<div class="remote ac-remote">' +
          '<div class="lcd wide" id="acDisp">－－</div>' +
          '<button class="dev-btn power" data-k="power">⏻ 開／關</button>' +
          '<button class="dev-btn" data-k="up">▲ 升溫</button>' +
          '<button class="dev-btn" data-k="down">▼ 降溫</button>' +
          '<button class="dev-btn" data-k="fan">風量</button>' +
          '<button class="dev-btn" data-k="mode">模式</button>' +
        '</div>',
      steps: [
        { k: 'power', tip: '按紅色的「開／關」，打開冷氣',
          after: function (r) { $(r, 'ac').classList.add('on'); $(r, 'acLcd').textContent = '28°C'; $(r, 'acDisp').textContent = '冷氣 28°C'; } },
        { k: 'down', tip: '按「▼ 降溫」，調到 27 度',
          after: function (r) { $(r, 'acLcd').textContent = '27°C'; $(r, 'acDisp').textContent = '冷氣 27°C'; } },
        { k: 'down', tip: '再按一次「▼ 降溫」，調到 26 度',
          after: function (r) { $(r, 'acLcd').textContent = '26°C'; $(r, 'acDisp').textContent = '冷氣 26°C'; } }
      ]
    }
  ];

  HJX.games[4] = function (stage, done, S) {
    var t = 0;
    var mistakes = 0;

    function runTask() {
      var task = TASKS[t];
      var i = 0;
      var wrongHere = 0;
      var busy = false;

      stage.innerHTML =
        '<div class="round-info">任務 ' + (t + 1) + ' / ' + TASKS.length + '：' + task.icon + ' ' + task.name + '</div>' +
        '<div class="step-tip" id="tip"></div>' +
        '<div class="device">' + task.html + '</div>';

      function showTip() {
        var tip = $(stage, 'tip');
        tip.innerHTML = '<span class="step-no">第 ' + (i + 1) + ' 步</span><span class="step-text">' + task.steps[i].tip + '</span>';
        tip.classList.remove('fade-in'); void tip.offsetWidth; tip.classList.add('fade-in');
        stage.querySelectorAll('.hint').forEach(function (b) { b.classList.remove('hint'); });
      }

      stage.querySelectorAll('[data-k]').forEach(function (b) {
        b.onclick = function () {
          if (busy) return;
          var step = task.steps[i];
          if (b.getAttribute('data-k') !== step.k) {
            mistakes++;
            wrongHere++;
            b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
            if (wrongHere >= 2) {
              stage.querySelectorAll('[data-k="' + step.k + '"]').forEach(function (c) { c.classList.add('hint'); });
            }
            return;
          }
          HJX.sfx.pop();
          wrongHere = 0;
          var wait = step.after(stage) || 0;
          i++;
          if (i < task.steps.length) return showTip();
          busy = true;
          $(stage, 'tip').innerHTML = '<span class="step-text">完成了！👏</span>';
          setTimeout(success, wait + 500);
        };
      });

      showTip();
    }

    function success() {
      var task = TASKS[t];
      HJX.sfx.fanfare();
      stage.innerHTML =
        '<div class="feedback ok pop">' +
          '<div style="font-size:3.6rem;line-height:1.3">' + task.doneIcon + '</div>' +
          '<h2>' + task.doneText + '</h2>' +
        '</div>' +
        '<button class="btn" id="next">' + (t + 1 < TASKS.length ? '下一個任務 ▶' : '完成！') + '</button>';
      HJX.voice.say(task.doneText, true);
      document.getElementById('next').onclick = function () {
        t++;
        if (t < TASKS.length) return runTask();
        done(mistakes <= 2 ? 3 : mistakes <= 6 ? 2 : 1);
      };
    }

    runTask();
  };

  // 產生語音稿用
  HJX.games[4].lines = function () {
    return TASKS.map(function (task) { return task.doneText; });
  };
})();
