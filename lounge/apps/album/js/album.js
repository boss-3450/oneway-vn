// ============================================================
// りぷらい！アルバム — メンバー一覧ページ制御 (album.js)
// ============================================================
// members.js と albums.js が先に読み込まれている前提。
// メンバーカードを動的に生成してグリッドに表示する。
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
  var grid = document.getElementById('memberGrid');
  if (!grid) return;

  MEMBERS.forEach(function (member, index) {
    var works = (ALBUMS[member.id] || []);
    var workCount = works.length;

    // カードリンク
    var card = document.createElement('a');
    card.href = 'member.html?id=' + encodeURIComponent(member.id);
    card.className = 'member-card';
    card.style.animationDelay = (0.1 + index * 0.06) + 's';

    // アイコン
    var iconWrapper = document.createElement('div');
    iconWrapper.className = 'member-icon-wrapper';

    var img = document.createElement('img');
    img.src = member.icon;
    img.alt = member.name;
    img.loading = 'lazy';

    // アイコン読み込み失敗時：フォールバック表示
    img.onerror = function () {
      img.style.display = 'none';
      var fallback = document.createElement('div');
      fallback.className = 'member-icon-fallback';
      // 名前の最初の文字をフォールバック表示
      fallback.textContent = member.name.charAt(0);
      iconWrapper.appendChild(fallback);
    };

    iconWrapper.appendChild(img);
    card.appendChild(iconWrapper);

    // 名前
    var nameEl = document.createElement('div');
    nameEl.className = 'member-name';
    nameEl.textContent = member.name;
    card.appendChild(nameEl);

    // 作品数
    var countEl = document.createElement('div');
    countEl.className = 'member-work-count';
    countEl.textContent = workCount > 0 ? workCount + ' 作品' : '準備中';
    card.appendChild(countEl);

    grid.appendChild(card);
  });
});
