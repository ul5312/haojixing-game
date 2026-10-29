// 音效：用 Web Audio 即時合成，不需要音檔
window.HJX = window.HJX || {};

HJX.sfx = (function () {
  var ctx = null;

  function ac() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, start, dur, type, vol) {
    var c = ac();
    if (!c) return;
    var o = c.createOscillator();
    var g = c.createGain();
    var t = c.currentTime + start;
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.25, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  function safe(fn) {
    return function () { try { fn.apply(null, arguments); } catch (e) { /* 不支援音效時略過 */ } };
  }

  return {
    // 答對、完成
    ding: safe(function () { tone(880, 0, 0.35); tone(1320, 0.12, 0.45); }),
    // 輕點
    pop: safe(function () { tone(620, 0, 0.12, 'triangle', 0.2); }),
    // 水滴
    drop: safe(function () { tone(1200, 0, 0.08); tone(700, 0.06, 0.15); }),
    // 鼓聲，n 為第幾個鼓（音高不同）
    drum: safe(function (n) {
      var c = ac();
      if (!c) return;
      var base = [110, 150, 200][n || 0];
      var o = c.createOscillator();
      var g = c.createGain();
      var t = c.currentTime;
      o.frequency.setValueAtTime(base * 2, t);
      o.frequency.exponentialRampToValueAtTime(base, t + 0.15);
      g.gain.setValueAtTime(0.6, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
      o.connect(g).connect(c.destination);
      o.start(t);
      o.stop(t + 0.45);
    }),
    // 完成整段的小旋律
    fanfare: safe(function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, i * 0.13, 0.4); }); })
  };
})();
