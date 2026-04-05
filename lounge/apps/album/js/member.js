// ============================================================
// りぷらい！アルバム — アルバム閲覧ページ制御 (member.js)
// ============================================================
// members.js と albums.js が先に読み込まれている前提。
// URLパラメータ ?id=xxx でメンバーを特定し、画像を表示する。
//
// ■ 操作:
//   - 画像クリック / 「▶」ボタン → 次の画像
//   - 「◀」ボタン → 前の画像
//   - スワイプ（モバイル） → 左=次 / 右=前
//   - キーボード矢印キー
//   - 最後の画像の次 → 最初に戻る（ループ）
//
// ============================================================

(function () {
  'use strict';

  // ---- URLからメンバーIDを取得 ----
  var params = new URLSearchParams(window.location.search);
  var memberId = params.get('id');

  // メンバー情報を検索
  var memberInfo = null;
  for (var i = 0; i < MEMBERS.length; i++) {
    if (MEMBERS[i].id === memberId) {
      memberInfo = MEMBERS[i];
      break;
    }
  }

  // メンバーが見つからない場合 → 一覧に戻す
  if (!memberInfo) {
    window.location.href = './index.html';
    return;
  }

  // ---- DOM要素 ----
  var memberNameEl = document.getElementById('memberName');
  var viewerStage = document.getElementById('viewerStage');
  var imageWrapper = document.getElementById('imageWrapper');
  var viewerImage = document.getElementById('viewerImage');
  var imageTitle = document.getElementById('imageTitle');
  var viewerNav = document.getElementById('viewerNav');
  var viewerHint = document.getElementById('viewerHint');
  var viewerEmpty = document.getElementById('viewerEmpty');
  var prevBtn = document.getElementById('prevBtn');
  var nextBtn = document.getElementById('nextBtn');
  var indicator = document.getElementById('indicator');

  // ページタイトル更新
  document.title = memberInfo.name + ' のアルバム — REPLAY LIVE LOUNGE';
  memberNameEl.textContent = memberInfo.name;

  // ---- 画像データ取得 ----
  var images = ALBUMS[memberId] || [];
  var currentIndex = 0;
  var isAnimating = false;

  // ---- 表示初期化 ----
  if (images.length === 0) {
    // 画像が0件の場合 → 「準備中」表示
    viewerEmpty.style.display = 'flex';
  } else {
    // 画像がある場合 → ビューア表示
    viewerStage.style.display = 'flex';
    imageTitle.style.display = 'block';
    viewerNav.style.display = 'flex';
    viewerHint.style.display = 'block';
    showImage(currentIndex);
  }

  // ============================================================
  // 画像表示
  // ============================================================
  function showImage(index) {
    var item = images[index];
    viewerImage.src = item.src;
    viewerImage.alt = item.title || '作品画像';
    imageTitle.textContent = item.title || '';
    indicator.textContent = (index + 1) + ' / ' + images.length;
  }

  // ============================================================
  // ページめくり処理
  // ============================================================
  function goNext() {
    if (isAnimating || images.length <= 1) return;
    isAnimating = true;

    // アニメーション開始
    imageWrapper.classList.add('flip-next');

    // 中間点で画像を切り替え
    setTimeout(function () {
      currentIndex = (currentIndex + 1) % images.length;
      showImage(currentIndex);
    }, 250);

    // アニメーション完了
    setTimeout(function () {
      imageWrapper.classList.remove('flip-next');
      isAnimating = false;
    }, 500);
  }

  function goPrev() {
    if (isAnimating || images.length <= 1) return;
    isAnimating = true;

    imageWrapper.classList.add('flip-prev');

    setTimeout(function () {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      showImage(currentIndex);
    }, 250);

    setTimeout(function () {
      imageWrapper.classList.remove('flip-prev');
      isAnimating = false;
    }, 500);
  }

  // ============================================================
  // イベントリスナー
  // ============================================================

  // 画像クリック → 次へ
  if (imageWrapper) {
    imageWrapper.addEventListener('click', function () {
      goNext();
    });
  }

  // ナビボタン
  if (nextBtn) {
    nextBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      goNext();
    });
  }
  if (prevBtn) {
    prevBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      goPrev();
    });
  }

  // キーボード操作
  document.addEventListener('keydown', function (e) {
    if (images.length === 0) return;
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      goNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goPrev();
    }
  });

  // スワイプ操作（モバイル対応）
  var touchStartX = 0;
  var touchStartY = 0;
  var touchThreshold = 50;

  document.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', function (e) {
    if (images.length === 0) return;
    var dx = e.changedTouches[0].clientX - touchStartX;
    var dy = e.changedTouches[0].clientY - touchStartY;

    // 縦スクロールより横スワイプが大きい場合のみ反応
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > touchThreshold) {
      if (dx < 0) {
        goNext();  // 左スワイプ → 次
      } else {
        goPrev();  // 右スワイプ → 前
      }
    }
  }, { passive: true });

})();
