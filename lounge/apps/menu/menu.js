// ============================================================
// メインメニュー画面制御 (menu.js)
// ============================================================

// 現時点では基本的なインタラクションのみ
// 今後、ツール追加時にここにロジックを追加可能

document.addEventListener('DOMContentLoaded', function () {

  // Coming Soonカードをクリックした時のフィードバック
  var disabledCards = document.querySelectorAll('.card--disabled');
  disabledCards.forEach(function (card) {
    card.addEventListener('click', function () {
      // 一瞬揺れるアニメーション
      card.style.animation = 'none';
      card.offsetHeight; // リフロー強制
      card.style.animation = 'shake 0.4s ease';
    });
  });

  // 揺れアニメーションを動的に追加
  var style = document.createElement('style');
  style.textContent = '@keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }';
  document.head.appendChild(style);

});
