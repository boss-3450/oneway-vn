// ============================================================
// albums.js 自動生成スクリプト (generate-albums.js)
// ============================================================
//
// apps/album/assets/works/{memberId}/ を走査し、
// apps/album/data/albums.js を自動生成します。
//
// 【使い方】
//   1. apps/album/assets/works/{memberId}/ に画像を入れる
//   2. npm run generate:albums を実行
//   3. そのままデプロイ
//
// ============================================================

const fs = require('fs');
const path = require('path');

// ---- 設定 ----
const WORKS_DIR = path.join(__dirname, '..', 'apps', 'album', 'assets', 'works');
const OUTPUT_FILE = path.join(__dirname, '..', 'apps', 'album', 'data', 'albums.js');
const EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

// メンバーID一覧（表示順を維持）
const MEMBER_IDS = [
  'collaboration',
  'mitchon',
  'rio',
  'kaida_nico',
  'tamenaga_homare',
  'hizuki_tera',
  'hamii',
  'shino_merin',
  'aiba_eiru',
  'kisaragi_pote',
  'hinata_nako',
  'cosmo_clara',
  'morty_astrabeta',
  'yumesaki_aisu',
  'hakubyou_tsumugi',
  'amane_seika'
];

// ---- メイン処理 ----
function scanMemberImages(memberId) {
  const dir = path.join(WORKS_DIR, memberId);

  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = fs.readdirSync(dir)
    .filter(function (f) {
      const ext = path.extname(f).toLowerCase();
      return EXTENSIONS.has(ext);
    })
    .sort(); // ファイル名順ソート

  return files.map(function (f) {
    const name = path.basename(f, path.extname(f));
    return {
      src: 'assets/works/' + memberId + '/' + f,
      title: name
    };
  });
}

function generateAlbumsJs() {
  var lines = [];

  lines.push('// ============================================================');
  lines.push('// りぷらい！アルバム — 画像定義 (albums.js)');
  lines.push('// ============================================================');
  lines.push('// ⚠ このファイルは自動生成です。手編集しないでください。');
  lines.push('// 生成コマンド: npm run generate:albums');
  lines.push('// ============================================================');
  lines.push('');
  lines.push('const ALBUMS = {');

  MEMBER_IDS.forEach(function (id, index) {
    var images = scanMemberImages(id);
    var comma = (index < MEMBER_IDS.length - 1) ? ',' : '';

    if (images.length === 0) {
      lines.push('  ' + id + ': []' + comma);
    } else {
      lines.push('  ' + id + ': [');
      images.forEach(function (img, imgIndex) {
        var imgComma = (imgIndex < images.length - 1) ? ',' : '';
        lines.push('    { src: "' + img.src + '", title: "' + img.title + '" }' + imgComma);
      });
      lines.push('  ]' + comma);
    }
  });

  lines.push('};');
  lines.push('');

  return lines.join('\n');
}

// ---- 実行 ----
var output = generateAlbumsJs();
fs.writeFileSync(OUTPUT_FILE, output, 'utf8');

// 集計表示
var totalImages = 0;
var membersWithImages = 0;
MEMBER_IDS.forEach(function (id) {
  var count = scanMemberImages(id).length;
  if (count > 0) {
    membersWithImages++;
    totalImages += count;
    console.log('  ' + id + ': ' + count + ' 枚');
  }
});

console.log('');
console.log('albums.js を生成しました');
console.log('  メンバー: ' + membersWithImages + '/' + MEMBER_IDS.length + ' 名に画像あり');
console.log('  合計: ' + totalImages + ' 枚');
console.log('  出力: ' + OUTPUT_FILE);
