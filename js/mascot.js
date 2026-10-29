// 吉祥物「小記」：參考好記幸包裝上的橘色角色，以 SVG 繪製
window.HJX = window.HJX || {};

// mood: 'happy' 微笑、'cheer' 開心張嘴、'think' 思考
HJX.mascot = function (mood, cls) {
  mood = mood || 'happy';
  var mouth = {
    happy: '<path d="M84 128 Q100 142 116 128" fill="none" stroke="#5A2E0A" stroke-width="6" stroke-linecap="round"/>',
    cheer: '<path d="M82 124 Q100 152 118 124 Z" fill="#8A3B12"/><path d="M90 136 Q100 144 110 136" fill="#FF8A80"/>',
    think: '<path d="M88 132 L112 128" fill="none" stroke="#5A2E0A" stroke-width="6" stroke-linecap="round"/>'
  }[mood];
  var eyes = mood === 'cheer'
    ? '<path d="M66 102 Q76 90 86 102" fill="none" stroke="#5A2E0A" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M114 102 Q124 90 134 102" fill="none" stroke="#5A2E0A" stroke-width="6" stroke-linecap="round"/>'
    : '<ellipse cx="76" cy="100" rx="8" ry="10" fill="#5A2E0A"/><circle cx="79" cy="96" r="3" fill="#fff"/>' +
      '<ellipse cx="124" cy="100" rx="8" ry="10" fill="#5A2E0A"/><circle cx="127" cy="96" r="3" fill="#fff"/>';
  var extra = mood === 'think' ? '<text x="150" y="60" font-size="34" font-weight="900" fill="#2E8B57">?</text>' : '';

  return '<svg class="' + (cls || '') + '" viewBox="0 0 200 200" role="img" aria-label="小記">' +
    // 燈泡光芒
    '<g stroke="#FFB800" stroke-width="7" stroke-linecap="round">' +
      '<line x1="100" y1="10" x2="100" y2="26"/>' +
      '<line x1="52" y1="28" x2="61" y2="41"/>' +
      '<line x1="148" y1="28" x2="139" y2="41"/>' +
      '<line x1="22" y1="66" x2="37" y2="72"/>' +
      '<line x1="178" y1="66" x2="163" y2="72"/>' +
    '</g>' +
    // 身體
    '<circle cx="100" cy="112" r="70" fill="#F08A1C"/>' +
    '<circle cx="100" cy="112" r="70" fill="url(#hjxShine)"/>' +
    '<defs><radialGradient id="hjxShine" cx="35%" cy="30%" r="70%">' +
      '<stop offset="0" stop-color="#FFD08A" stop-opacity=".9"/>' +
      '<stop offset=".55" stop-color="#F08A1C" stop-opacity="0"/>' +
    '</radialGradient></defs>' +
    // 臉
    '<ellipse cx="100" cy="116" rx="52" ry="44" fill="#FFF3E2"/>' +
    eyes +
    '<ellipse cx="62" cy="122" rx="10" ry="6" fill="#FF9E8A" opacity=".8"/>' +
    '<ellipse cx="138" cy="122" rx="10" ry="6" fill="#FF9E8A" opacity=".8"/>' +
    mouth +
    // 頭頂小葉子
    '<path d="M100 44 Q92 30 104 22 Q112 34 100 44 Z" fill="#2E8B57"/>' +
    extra +
  '</svg>';
};
