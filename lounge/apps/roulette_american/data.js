// ============================================================
// アメリカンルーレット - 設定画面 (data.js)
// ============================================================
// カテゴリ管理、バリデーション、localStorage 永続化
// ============================================================

(function () {
    'use strict';

    // ============================================================
    // カテゴリ定義（7種）
    // ============================================================
    var CATEGORIES = [
        { type: 'RED', label: 'RED', desc: '赤番号', color: '#e53935', colorRGB: '229,57,53' },
        { type: 'BLACK', label: 'BLACK', desc: '黒番号', color: '#424242', colorRGB: '66,66,66' },
        { type: 'GREEN', label: 'GREEN', desc: '0 / 00', color: '#2e7d32', colorRGB: '46,125,50' },
        { type: 'ODD', label: 'ODD', desc: '奇数', color: '#ef6c00', colorRGB: '239,108,0' },
        { type: 'EVEN', label: 'EVEN', desc: '偶数', color: '#1565c0', colorRGB: '21,101,192' },
        { type: 'HIGH', label: 'HIGH', desc: '19〜36', color: '#7b1fa2', colorRGB: '123,31,162' },
        { type: 'LOW', label: 'LOW', desc: '1〜18', color: '#00838f', colorRGB: '0,131,143' }
    ];

    var STORAGE_KEY = 'roulette_american_settings';

    // ============================================================
    // DOM
    // ============================================================
    var categoryGrid = document.getElementById('categoryGrid');
    var startBtn = document.getElementById('startBtn');
    var setupError = document.getElementById('setupError');

    // ============================================================
    // 保存/読込
    // ============================================================
    function saveSettings(cats) {
        var data = cats.map(function (c) {
            return { type: c.type, active: c.active, names: c.names };
        });
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('[ROULETTE] localStorage 保存失敗:', e);
        }
    }

    function loadSettings() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) {
            console.warn('[ROULETTE] localStorage 読込失敗:', e);
        }
        return null;
    }

    // ============================================================
    // UI生成
    // ============================================================
    var savedData = loadSettings();
    var catStates = []; // { type, active, names: string[], card, textarea }

    CATEGORIES.forEach(function (cat, idx) {
        // 保存データがあれば復元
        var saved = null;
        if (savedData) {
            for (var s = 0; s < savedData.length; s++) {
                if (savedData[s].type === cat.type) { saved = savedData[s]; break; }
            }
        }

        var active = saved ? saved.active : false;
        var names = saved ? saved.names : [];

        // ---- カードHTML ----
        var card = document.createElement('div');
        card.className = 'cat-card' + (active ? ' is-active' : '');
        card.style.setProperty('--cat-color', cat.color);
        card.style.setProperty('--cat-color-rgb', cat.colorRGB);

        var header = document.createElement('div');
        header.className = 'cat-card__header';

        var label = document.createElement('div');
        label.className = 'cat-card__label';
        label.innerHTML =
            '<span class="cat-card__dot"></span>' +
            '<span>' + cat.label + '</span>' +
            '<span class="cat-card__desc">' + cat.desc + '</span>';

        var toggle = document.createElement('div');
        toggle.className = 'toggle' + (active ? ' is-on' : '');
        toggle.innerHTML = '<div class="toggle__knob"></div>';

        header.appendChild(label);
        header.appendChild(toggle);

        var body = document.createElement('div');
        body.className = 'cat-card__body';

        var textarea = document.createElement('textarea');
        textarea.className = 'cat-card__textarea';
        textarea.placeholder = '1行に1名ずつ入力';
        textarea.value = names.join('\n');

        var countLabel = document.createElement('div');
        countLabel.className = 'cat-card__count';

        body.appendChild(textarea);
        body.appendChild(countLabel);

        card.appendChild(header);
        card.appendChild(body);
        categoryGrid.appendChild(card);

        var stateObj = {
            type: cat.type,
            active: active,
            names: names,
            card: card,
            textarea: textarea,
            countLabel: countLabel
        };
        catStates.push(stateObj);

        // ---- イベント ----
        header.addEventListener('click', function () {
            stateObj.active = !stateObj.active;
            card.classList.toggle('is-active', stateObj.active);
            toggle.classList.toggle('is-on', stateObj.active);
            onUpdate();
        });

        textarea.addEventListener('input', function () {
            onUpdate();
        });
    });

    // ============================================================
    // 更新 + バリデーション
    // ============================================================
    function parseNames(text) {
        return text.split('\n')
            .map(function (s) { return s.trim(); })
            .filter(function (s) { return s.length > 0; });
    }

    function onUpdate() {
        var activeBets = [];
        var allValid = true;

        catStates.forEach(function (cs) {
            cs.names = parseNames(cs.textarea.value);
            cs.countLabel.textContent = cs.names.length + '名 登録中';

            if (cs.active) {
                if (cs.names.length === 0) {
                    allValid = false;
                    cs.countLabel.style.color = '#ff2d7d';
                    cs.countLabel.textContent = '⚠ 1名以上入力してください';
                } else {
                    cs.countLabel.style.color = '';
                    activeBets.push(cs);
                }
            }
        });

        if (activeBets.length === 0) {
            setupError.textContent = '⚠ カテゴリを1つ以上ONにしてください';
            startBtn.disabled = true;
        } else if (!allValid) {
            setupError.textContent = '⚠ ONのカテゴリに名前を入力してください';
            startBtn.disabled = true;
        } else {
            setupError.textContent = '';
            startBtn.disabled = false;
        }

        // 保存
        saveSettings(catStates);
    }

    // 初期バリデーション
    onUpdate();

    // ============================================================
    // 開始 → play.html へ遷移
    // ============================================================
    startBtn.addEventListener('click', function () {
        if (startBtn.disabled) return;
        // 保存してから遷移
        saveSettings(catStates);
        window.location.href = './play.html';
    });

    console.log('[ROULETTE] 設定画面 初期化完了');
})();
