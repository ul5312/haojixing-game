// 第 5 關：節慶日曆（日期與時間）
// 4 題節日在幾月（農曆節日標明農曆），最後 2 題問今天幾月、今年民國幾年
window.HJX = window.HJX || {};
HJX.games = HJX.games || {};

(function () {
  var FESTIVALS = [
    { icon: '🎆', name: '元旦', cal: '國曆', m: 1, date: '國曆 1 月 1 日' },
    { icon: '🧧', name: '春節（過年）', cal: '農曆', m: 1, date: '農曆 1 月 1 日' },
    { icon: '🏮', name: '元宵節', cal: '農曆', m: 1, date: '農曆 1 月 15 日' },
    { icon: '🌿', name: '清明節', cal: '國曆', m: 4, date: '國曆 4 月 4 日或 5 日' },
    { icon: '💐', name: '母親節', cal: '國曆', m: 5, date: '國曆 5 月第二個星期日' },
    { icon: '🐉', name: '端午節', cal: '農曆', m: 5, date: '農曆 5 月 5 日，吃粽子、划龍舟' },
    { icon: '💞', name: '七夕情人節', cal: '農曆', m: 7, date: '農曆 7 月 7 日' },
    { icon: '👔', name: '父親節', cal: '國曆', m: 8, date: '國曆 8 月 8 日，「爸爸」節' },
    { icon: '🥮', name: '中秋節', cal: '農曆', m: 8, date: '農曆 8 月 15 日，吃月餅、賞月' },
    { icon: '🍵', name: '重陽節', cal: '農曆', m: 9, date: '農曆 9 月 9 日，也是敬老節' },
    { icon: '🎇', name: '國慶日', cal: '國曆', m: 10, date: '國曆 10 月 10 日，雙十節' },
    { icon: '🎄', name: '聖誕節', cal: '國曆', m: 12, date: '國曆 12 月 25 日' }
  ];
  var FEST_ROUNDS = 4;
  var WEEK = ['日', '一', '二', '三', '四', '五', '六'];

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // 月份選項：正確答案＋兩個至少差 2 個月的干擾項，避免太接近而混淆
  function monthOptions(m) {
    var others = [];
    for (var x = 1; x <= 12; x++) {
      var d = Math.abs(x - m);
      if (Math.min(d, 12 - d) >= 2) others.push(x);
    }
    return shuffle([m].concat(shuffle(others).slice(0, 2)));
  }

  function buildRounds() {
    var rounds = shuffle(FESTIVALS).slice(0, FEST_ROUNDS).map(function (f) {
      return {
        icon: f.icon, title: f.name, tag: f.cal,
        q: f.name + '是' + f.cal + '幾月？',
        answer: f.m, options: monthOptions(f.m), unit: '月',
        reveal: f.date
      };
    });

    var now = new Date();
    var m = now.getMonth() + 1;
    rounds.push({
      icon: '📅', title: '今天', tag: '看看今天',
      q: '今天是幾月呢？',
      answer: m, options: monthOptions(m), unit: '月',
      reveal: '今天是 ' + m + ' 月 ' + now.getDate() + ' 日，星期' + WEEK[now.getDay()]
    });

    var y = now.getFullYear() - 1911;
    rounds.push({
      icon: '🗓️', title: '今年', tag: '看看今年',
      q: '今年是民國幾年呢？',
      answer: y, options: shuffle([y, y - 3, y + 2]), unit: '年', prefix: '民國 ',
      reveal: '今年是民國 ' + y + ' 年（西元 ' + now.getFullYear() + ' 年）'
    });
    return rounds;
  }

  HJX.games[5] = function (stage, done, S) {
    var rounds = buildRounds();
    var idx = 0;
    var correct = 0;

    function label(r, v) { return (r.prefix || '') + v + ' ' + r.unit; }

    function show() {
      var r = rounds[idx];
      stage.innerHTML =
        '<div class="round-info">第 ' + (idx + 1) + ' / ' + rounds.length + ' 題</div>' +
        '<div class="cal pop">' +
          '<div class="cal-top"><span></span><span></span></div>' +
          '<span class="cal-tag">' + r.tag + '</span>' +
          '<div class="cal-icon">' + r.icon + '</div>' +
          '<div class="cal-name">' + r.title + '</div>' +
          '<div class="cal-ans" id="calAns">？ ' + r.unit + '</div>' +
        '</div>' +
        '<p class="cal-q">' + r.q +
          ' <button class="read-btn" id="read" aria-label="唸給我聽">🔊</button></p>' +
        '<div id="fb" class="mini-fb"></div>' +
        '<div class="month-opts' + (r.unit === '月' ? ' cols3' : '') + '" id="opts">' +
          r.options.map(function (v) {
            return '<button class="btn ghost" data-v="' + v + '">' + label(r, v) + '</button>';
          }).join('') +
        '</div>';

      document.getElementById('read').onclick = function () {
        HJX.voice.say(r.q);
      };
      stage.querySelectorAll('[data-v]').forEach(function (b) {
        b.onclick = function () { answer(+b.getAttribute('data-v')); };
      });
    }

    function answer(v) {
      var r = rounds[idx];
      var ok = v === r.answer;
      var fb = document.getElementById('fb');
      var ans = document.getElementById('calAns');
      ans.textContent = label(r, r.answer);
      ans.classList.add('shown');

      if (ok) {
        correct++;
        HJX.sfx.ding();
        fb.className = 'mini-fb ok pop';
        fb.textContent = '👍 對！' + r.reveal;
        document.getElementById('opts').innerHTML = '';
        setTimeout(next, 2200);
        return;
      }
      fb.className = 'mini-fb retry pop';
      fb.textContent = '答案是：' + r.reveal;
      document.getElementById('opts').innerHTML = '<button class="btn" id="next">下一題 ▶</button>';
      document.getElementById('next').onclick = next;
    }

    function next() {
      idx++;
      if (idx < rounds.length) return show();
      done(correct === rounds.length ? 3 : correct >= 4 ? 2 : 1);
    }

    show();
  };

  // 產生語音稿用
  HJX.games[5].lines = function () {
    return FESTIVALS.map(function (f) { return f.name + '是' + f.cal + '幾月？'; })
      .concat(['今天是幾月呢？', '今年是民國幾年呢？']);
  };
})();
