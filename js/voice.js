// 語音：優先播放預先產生的音檔（Azure 曉雨），找不到才用瀏覽器內建語音合成
// 音檔路徑：audio/zh/{句子雜湊}.mp3
window.HJX = window.HJX || {};

HJX.voice = (function () {
  var current = null;
  var chosen = null;
  var token = 0;

  // ---------- 句子 → 音檔名 ----------
  // 去掉表情符號與多餘空白，讓「🎂」這類圖示不影響檔名與朗讀
  function clean(text) {
    return String(text)
      .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}\u{2B00}-\u{2BFF}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // FNV-1a 32 位元雜湊（以 UTF-8 計算），產生 8 碼檔名
  function hash(text) {
    var bytes = new TextEncoder().encode(text);
    var h = 0x811c9dc5;
    for (var i = 0; i < bytes.length; i++) {
      h ^= bytes[i];
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return ('0000000' + h.toString(16)).slice(-8);
  }

  // ---------- 內建語音：優先自然（雲端神經網路）語音，其次年輕女聲 ----------
  var NATURAL = /natural|online|neural|premium|enhanced/i;
  var FEMALE = /hsiaochen|hsiaoyu|yating|hanhan|mei-?jia|美佳|google\s*國語|female/i;
  var MALE = /yunjhe|zhiwei|male/i;

  function score(v) {
    var s = 0;
    var lang = (v.lang || '').replace('_', '-').toLowerCase();
    if (lang === 'zh-tw' || /hant/.test(lang)) s += 200;
    else if (/^zh|^cmn/.test(lang)) s += 50; // 其他中文語音，台灣口音不足時的備案
    else return -1;
    if (NATURAL.test(v.name)) s += 100;
    if (/google/i.test(v.name)) s += 40;
    if (FEMALE.test(v.name)) s += 50;
    if (MALE.test(v.name) && !/female/i.test(v.name)) s -= 80;
    return s;
  }

  function pick(voices) {
    var best = null;
    var bestScore = -1;
    voices.forEach(function (v) {
      var s = score(v);
      if (s > bestScore) { best = v; bestScore = s; }
    });
    return best;
  }

  function refresh() {
    if (!window.speechSynthesis) return;
    var v = pick(window.speechSynthesis.getVoices());
    if (v) chosen = v;
  }

  function tts(text, cb) {
    if (!window.speechSynthesis) { cb(false); return; }
    window.speechSynthesis.cancel(); // 確保不會疊在還沒唸完的內建語音後面
    if (!chosen) refresh();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-TW';
    if (chosen) u.voice = chosen;
    // 自然語音本身語速適中；舊式語音放慢一點，長輩比較聽得清楚
    u.rate = chosen && NATURAL.test(chosen.name) ? 0.92 : 0.85;
    u.pitch = 1.08; // 稍微提高音調，聽起來較年輕
    u.onend = function () { cb(true); };
    u.onerror = function () { cb(true); };
    window.speechSynthesis.speak(u);
  }

  // ---------- 播放 ----------
  // 新的一句一開始，就把前一句（不論是音檔還在載入、正在播，或是內建語音）全部停掉
  function stop() {
    token++;
    if (current) {
      current.onended = current.onerror = null;
      current.pause();
      current.removeAttribute('src');
      current.load(); // 中斷還在下載的音檔，避免載完後又自己播出來
      current = null;
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  // 播放預先產生的音檔，沒有音檔才用內建語音
  function playPart(text, my, cb) {
    if (my !== token) return;
    var a = new Audio('audio/zh/' + hash(text) + '.mp3?v=' + HJX.VERSION);
    current = a;
    a.onended = function () { cb(true); };
    a.onerror = function () {
      if (my === token) tts(text, cb);
    };
    // 保險：若播放開始時已經換成別句，立刻停掉
    a.onplaying = function () { if (my !== token) a.pause(); };
    a.play().catch(function () { /* 載入失敗由 onerror 處理 */ });
  }

  // what：一句話，或要依序拼接播放的多段話（陣列）
  // silent：自動播放時不跳提示，只有玩家按 🔊 才提示
  function say(what, silent) {
    stop();
    var my = token;
    var parts = [].concat(what).map(clean).filter(Boolean);
    var i = 0;
    (function next() {
      if (my !== token || i >= parts.length) return;
      playPart(parts[i++], my, function (ok) {
        if (ok === false && !silent) HJX.toast('這台裝置不支援語音播放');
        setTimeout(next, 150); // 段落之間稍微停頓
      });
    })();
  }

  // 語音清單是非同步載入的，載入後重新挑選
  if (window.speechSynthesis) {
    refresh();
    window.speechSynthesis.addEventListener('voiceschanged', refresh);
  }

  return {
    say: say,
    stop: stop,
    // 產生語音稿與測試用
    clean: clean,
    hash: hash,
    pick: pick,
    name: function () { return chosen ? chosen.name : '（裝置預設）'; }
  };
})();
