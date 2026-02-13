document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const titleScreen = document.getElementById('title-screen');
    const gameScreen = document.getElementById('game-screen');
    const endingScreen = document.getElementById('ending-screen');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const continueBtn = document.getElementById('continue-btn');

    // Story Select Elements
    const storySelectScreen = document.getElementById('story-select-screen');
    const routeCardsContainer = document.getElementById('route-cards-container');
    const backToTitleBtn = document.getElementById('back-to-title-btn');
    const toastElement = document.getElementById('toast');

    const backgroundLayer = document.getElementById('background-layer');
    const heroineImg = document.getElementById('heroine-img');
    const fadeLayer = document.getElementById('fade-layer');

    const messageBox = document.getElementById('message-box');
    const speakerName = document.getElementById('speaker-name');
    const messageText = document.getElementById('message-text');
    const choicesContainer = document.getElementById('choices-container');
    const endingTitle = document.getElementById('ending-title');

    const endingMessage = document.getElementById('ending-message');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const videoScreen = document.getElementById('video-screen');
    const endingVideo = document.getElementById('ending-video');
    const ytWrap = document.getElementById('yt-wrap');
    const ytPlayerContainer = document.getElementById('yt-player');
    const ytOverlay = document.getElementById('yt-overlay');
    let ytPlayer = null;
    let ytReady = false;
    const thankyouScreen = document.getElementById('thankyou-screen');

    // Menu Elements
    const gameMenuBtn = document.getElementById('game-menu-btn');
    const gameMenuOverlay = document.getElementById('game-menu-overlay');
    const menuReturnTitle = document.getElementById('menu-return-title');
    const menuPrevChoice = document.getElementById('menu-prev-choice');
    const menuShowLog = document.getElementById('menu-show-log');
    const menuClose = document.getElementById('menu-close');

    // Confirm Dialog Elements
    const confirmDialog = document.getElementById('confirm-dialog');
    const confirmMessage = document.getElementById('confirm-message');
    const confirmYes = document.getElementById('confirm-yes');
    const confirmNo = document.getElementById('confirm-no');

    // Log Elements
    const logOverlay = document.getElementById('log-overlay');
    const logContent = document.getElementById('log-content');
    const logClose = document.getElementById('log-close');

    // Video Skip Dialog Elements
    const videoSkipDialog = document.getElementById('video-skip-dialog');
    const videoSkipYes = document.getElementById('video-skip-yes');
    const videoSkipNo = document.getElementById('video-skip-no');

    // Audio
    let currentVoice = null;
    let currentBgm = null;
    let bgmVolume = 0.6; // Default volume (will be overridden by BGM_VOLUMES)
    let seVolume = 0.6; // SE(10) -> tuned to 0.6 relative to BGM
    let voiceVolume = 0.7; // Voice(11) -> 0.7
    let fadingInterval = null;

    const BGM_MAP = {
        "title": "assets/bgm/titleBgm.mp3",
        "normal": "assets/bgm/normalBgm.mp3",
        "choice": "assets/bgm/choiceBgm.mp3",
        "true": "assets/bgm/trueBgm.mp3",
        "bad": "assets/bgm/badBgm.mp3",
        "gameover": "assets/bgm/gameoverBgm.mp3",
        "finale": "assets/bgm/finale/finale.mp3"
    };

    // Adjusted Volume Settings (Based on user request)
    // Title(10) -> 0.6 (Base)
    // Normal(5-6) -> 0.35
    // True(9) -> 0.55
    // Finale -> 0.45 (slightly louder for emotional impact)
    const BGM_VOLUMES = {
        "title": 0.6,
        "normal": 0.35,
        "choice": 0.35,
        "true": 0.55,
        "bad": 0.4,
        "gameover": 0.4,
        "finale": 0.45,
        "default": 0.6
    };

    // Flag to track if finale BGM is playing (prevent re-trigger)
    let isPlayingFinaleBgm = false;

    const SE_MAP = {
        "ui_click": "assets/se/ui_click.mp3",
        "choice_select": "assets/se/choice_select.mp3",
        "choice_hover": "assets/se/choice_hover.mp3",
        "bad_sting": "assets/se/bad_sting.mp3",
        "true_sting": "assets/se/true_sting.mp3"
    };

    // Story SE: auto-played when (SE:〇〇) appears in text
    // Files should be placed in assets/se_story/ as se_0001.mp3, se_0002.mp3, etc.
    let storySEIndex = 0;

    // Title Background Images (randomly selected on each title screen display)
    const TITLE_BACKGROUNDS = [
        'assets/title/title_01.jpg',
        'assets/title/title_02.jpg',
        'assets/title/title_03.jpg',
        'assets/title/title_04.jpg',
        'assets/title/title_05.jpg',
        'assets/title/title_06.jpg',
        'assets/title/title_07.jpg',
        'assets/title/title_08.jpg'
    ];

    // Set random title background
    function setRandomTitleBackground() {
        if (TITLE_BACKGROUNDS.length === 0) return;
        const randomIndex = Math.floor(Math.random() * TITLE_BACKGROUNDS.length);
        const selectedBg = TITLE_BACKGROUNDS[randomIndex];
        titleScreen.style.backgroundImage = `url('${selectedBg}')`;
    }

    // Game State
    let storyData = {};
    let routesData = []; // Loaded from routes.json
    let currentRoute = null; // Currently selected route object
    let currentRouteBasePath = ''; // Base path for current route assets
    let currentSceneId = 'start';
    let lastChoiceNodeId = null;
    let nextTimeout = null;
    let pendingGameOverScene = null; // Holds scene data when waiting for click before GAMEOVER

    // Conversation Log (Ring Buffer, max 50 entries)
    const MAX_LOG_ENTRIES = 50;
    let conversationLog = [];

    // Choice History for "go back" feature
    let choiceHistory = [];


    // Typewriter State
    let isTyping = false;
    let typeInterval = null;
    let fullText = "";

    let onTypingComplete = null;
    let isAudioUnlocked = false;

    // SCALING LOGIC (16:9 Fixed, center-origin)
    const BASE_W = 1280, BASE_H = 720;
    function updateScale() {
        const vw = window.visualViewport?.width ?? window.innerWidth;
        const vh = window.visualViewport?.height ?? window.innerHeight;
        const scale = Math.min(vw / BASE_W, vh / BASE_H);

        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            // CSS: position:absolute; left:50%; top:50%; transform-origin:center
            gameContainer.style.transform =
                `translate(-50%, -50%) scale(${scale})`;
        }
        checkRotatePrompt();
    }

    // Show rotate prompt when fullscreen + portrait
    function checkRotatePrompt() {
        const prompt = document.getElementById('rotate-prompt');
        if (!prompt) return;
        const isFullscreen = !!(document.fullscreenElement
            || document.webkitFullscreenElement);
        const vw = window.visualViewport?.width ?? window.innerWidth;
        const vh = window.visualViewport?.height ?? window.innerHeight;
        const isPortrait = vh > vw;
        if (isFullscreen && isPortrait) {
            prompt.classList.remove('hidden');
        } else {
            prompt.classList.add('hidden');
        }
    }

    // Initialize
    init();

    async function init() {
        try {
            // Load routes.json instead of story.json
            const response = await fetch('routes.json');
            if (!response.ok) throw new Error('Failed to load routes.json');
            routesData = await response.json();
            console.log(`Loaded ${routesData.length} routes.`);

            // Setup Event Listeners
            startBtn.addEventListener('click', showStorySelect);
            restartBtn.addEventListener('click', () => location.reload()); // Simple restart
            continueBtn.addEventListener('click', onContinue);
            messageBox.addEventListener('click', handleNext);

            // Story Select Event Listeners
            if (backToTitleBtn) {
                backToTitleBtn.addEventListener('click', () => {
                    playSe('ui_click');
                    showScreen('title');
                });
            }

            // Route Cards Click Handler (delegated)
            if (routeCardsContainer) {
                routeCardsContainer.addEventListener('click', (e) => {
                    const card = e.target.closest('.route-card');
                    if (!card) return;

                    const routeId = card.dataset.routeId;
                    const route = routesData.find(r => r.id === routeId);

                    if (!route) return;

                    if (!route.enabled) {
                        showToast('準備中です');
                        return;
                    }

                    playSe('ui_click');
                    selectRoute(route);
                });
            }

            // Scaling Listeners
            window.addEventListener('resize', updateScale);
            window.addEventListener('orientationchange', () => {
                setTimeout(updateScale, 200); // Safari delay workaround
            });
            document.addEventListener('fullscreenchange', updateScale);
            document.addEventListener('webkitfullscreenchange', updateScale);
            if (window.visualViewport) {
                window.visualViewport.addEventListener('resize', updateScale);
            }
            updateScale(); // Initial scale call

            // Delegated Choice Click Handler
            choicesContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.choice-btn');
                if (!btn || btn.classList.contains('dummy')) return;
                e.stopPropagation();

                playSe("choice_select"); // SE on choice
                console.log("Clicked choice:", btn.outerHTML); // Debug log

                const choice = {
                    next: btn.dataset.next,
                    isCorrect: btn.dataset.correct === 'true',
                    gameOverText: btn.dataset.gameover,
                    qIndex: btn.dataset.qindex ? parseInt(btn.dataset.qindex) : null,
                    cIndex: btn.dataset.cindex ? parseInt(btn.dataset.cindex) : null
                };
                handleChoice(choice);
            });

            // Hover SE delegation (using mouseover since mouseenter doesn't bubble)
            choicesContainer.addEventListener('mouseover', (e) => {
                const btn = e.target.closest('.choice-btn');
                if (!btn || btn.classList.contains('dummy')) return;
                if (!btn.contains(e.relatedTarget)) {
                    playSe("choice_hover");
                }
            });

            // Set random title background on initial load
            setRandomTitleBackground();

            // Title BGM is NOT auto-played here (browser autoplay restriction).
            // It will be triggered by the user's first click (START GAME).

            // Fullscreen Logic
            if (fullscreenBtn) {
                fullscreenBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    playSe('ui_click');
                    toggleFullscreen();
                });

                // Icon update on change (handles ESC key)
                const updateFsIcon = () => {
                    const isFull = !!(document.fullscreenElement
                        || document.webkitFullscreenElement);
                    fullscreenBtn.textContent = isFull ? '⤡' : '⛶';
                    fullscreenBtn.title = isFull ? "Exit Fullscreen" : "Fullscreen";
                };
                document.addEventListener('fullscreenchange', updateFsIcon);
                document.addEventListener('webkitfullscreenchange', updateFsIcon);
            }

            // ===== Game Menu Event Listeners =====
            if (gameMenuBtn) {
                gameMenuBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    playSe('ui_click');
                    openGameMenu();
                });
            }

            if (menuClose) {
                menuClose.addEventListener('click', () => {
                    playSe('ui_click');
                    closeGameMenu();
                });
            }

            if (menuReturnTitle) {
                menuReturnTitle.addEventListener('click', () => {
                    playSe('ui_click');
                    closeGameMenu();
                    showConfirmDialog('タイトルに戻りますか？', () => {
                        resetGameState();
                        showScreen('title');
                    });
                });
            }

            if (menuPrevChoice) {
                menuPrevChoice.addEventListener('click', () => {
                    playSe('ui_click');
                    closeGameMenu();
                    showConfirmDialog('一つ前の選択に戻りますか？', () => {
                        goBackToPreviousChoice();
                    });
                });
            }

            if (menuShowLog) {
                menuShowLog.addEventListener('click', () => {
                    playSe('ui_click');
                    closeGameMenu();
                    openLogOverlay();
                });
            }

            // Confirm Dialog Buttons
            if (confirmYes) {
                confirmYes.addEventListener('click', () => {
                    playSe('ui_click');
                    executeConfirmAction();
                });
            }

            if (confirmNo) {
                confirmNo.addEventListener('click', () => {
                    playSe('ui_click');
                    closeConfirmDialog();
                });
            }

            // Log Close Button
            if (logClose) {
                logClose.addEventListener('click', () => {
                    playSe('ui_click');
                    closeLogOverlay();
                });
            }

        } catch (error) {
            console.error(error);
            alert('Error loading game data.');
        }
    }

    function toggleFullscreen() {
        const isFullscreen = !!(document.fullscreenElement
            || document.webkitFullscreenElement);

        if (!isFullscreen) {
            // Enter fullscreen on <html> (single container)
            const el = document.documentElement;
            const req = el.requestFullscreen
                || el.webkitRequestFullscreen;
            if (req) {
                req.call(el).then(() => {
                    // Try to lock orientation to landscape
                    if (screen.orientation && screen.orientation.lock) {
                        screen.orientation.lock('landscape').catch(() => { });
                    }
                    updateScale();
                }).catch(err => {
                    console.log('Fullscreen error:', err.message);
                });
            }
        } else {
            const exit = document.exitFullscreen
                || document.webkitExitFullscreen;
            if (exit) {
                exit.call(document).then(() => {
                    if (screen.orientation && screen.orientation.unlock) {
                        screen.orientation.unlock();
                    }
                    updateScale();
                }).catch(() => { });
            }
        }
    }

    // Show Story Select screen (called when START GAME is clicked)
    function showStorySelect() {
        isAudioUnlocked = true;

        // Start Title BGM on first user gesture (bypasses autoplay restriction)
        playBgm("title");

        playSe("ui_click");
        showScreen('story-select');
    }

    // Render route cards in Story Select screen
    function renderRouteCards() {
        if (!routeCardsContainer) return;
        routeCardsContainer.innerHTML = '';

        routesData.forEach(route => {
            // Skip disabled routes entirely (do not show in story selection)
            if (!route.enabled) return;

            const card = document.createElement('div');
            card.className = 'route-card';
            card.dataset.routeId = route.id;

            // Thumbnail - prioritize 'image' property, fallback to 'thumbnail', then placeholder
            const thumb = document.createElement('img');
            thumb.className = 'route-thumbnail';
            thumb.src = route.image || route.thumbnail || 'assets/ui/placeholder_thumb.png';
            thumb.alt = route.title;
            thumb.onerror = () => {
                thumb.src = 'assets/ui/placeholder_thumb.png';
            };

            // Title
            const title = document.createElement('h3');
            title.className = 'route-title';
            title.textContent = route.title;

            // Tagline
            const tagline = document.createElement('p');
            tagline.className = 'route-tagline';
            tagline.textContent = route.tagline;

            card.appendChild(thumb);
            card.appendChild(title);
            card.appendChild(tagline);

            // Coming Soon badge for disabled routes
            if (!route.enabled) {
                const badge = document.createElement('div');
                badge.className = 'coming-soon-badge';
                badge.textContent = 'COMING SOON';
                card.appendChild(badge);
            }

            routeCardsContainer.appendChild(card);
        });
    }

    // Select a route and load its scenario
    async function selectRoute(route) {
        console.log(`Selecting route: ${route.id}`);

        // Store current route for ending video lookup
        currentRoute = route;

        // Set base path for this route
        const pathParts = route.path.split('/');
        pathParts.pop(); // Remove story.json
        currentRouteBasePath = pathParts.join('/') + '/';

        try {
            const response = await fetch(route.path);
            if (!response.ok) throw new Error(`Failed to load ${route.path}`);
            storyData = await response.json();

            // Auto-assign voice files for this route
            assignAutoVoices(route.id);

            console.log(`Loaded scenario for ${route.id}`);

            // Reset game state
            lastChoiceNodeId = null;
            conversationLog = [];
            choiceHistory = [];
            isPlayingFinaleBgm = false; // Reset finale BGM flag for new game

            // Start the game (BGM will be handled by sceneId in 'start' node)
            showScreen('game');
            loadScene('start');

        } catch (error) {
            console.error(error);
            showToast('シナリオの読み込みに失敗しました');
        }
    }

    // Play scene-specific BGM based on sceneId
    function playSceneBgm(sceneId) {
        if (!currentRoute || !currentRoute.sceneBgm) {
            // No scene BGM mapping for this route, use default
            console.log(`[BGM] No sceneBgm mapping for route, using default`);
            playBgm("normal");
            return;
        }

        const bgmPath = currentRoute.sceneBgm[sceneId];
        if (!bgmPath) {
            // No BGM specified for this sceneId, keep current BGM
            console.warn(`[BGM] No BGM specified for sceneId: ${sceneId}, keeping current`);
            return;
        }

        // Check if same BGM is already playing
        if (currentBgm && currentBgm._path === bgmPath) {
            console.log(`[BGM] Same BGM already playing: ${bgmPath}`);
            return;
        }

        console.log(`[BGM] Switching to scene BGM: ${bgmPath}`);
        playBgmByPath(bgmPath, "normal");
    }

    // Play BGM by direct path (for scene-specific BGM)
    function playBgmByPath(path, volumeKey = "normal") {
        // Prevent restarting same BGM
        if (currentBgm && currentBgm._path === path) {
            console.log(`[BGM] Same BGM already playing: ${path}`);
            return;
        }

        // Try to load the scene-specific BGM with timeout fallback
        const testAudio = new Audio(path);
        let loadHandled = false;

        const fallbackToDefault = () => {
            if (loadHandled) return;
            loadHandled = true;
            console.warn(`[BGM] Failed to load scene BGM: ${path}, falling back to default`);
            // Use default BGM map
            startBgmCrossfade(BGM_MAP["normal"], volumeKey);
        };

        // Timeout fallback (1 second)
        const timeoutId = setTimeout(fallbackToDefault, 1000);

        testAudio.onerror = () => {
            clearTimeout(timeoutId);
            fallbackToDefault();
        };

        testAudio.oncanplaythrough = () => {
            if (loadHandled) return;
            loadHandled = true;
            clearTimeout(timeoutId);
            // BGM file exists, proceed with crossfade
            startBgmCrossfade(path, volumeKey);
        };

        testAudio.load();
    }

    // Crossfade BGM helper
    function startBgmCrossfade(src, volumeKey) {
        console.log(`[BGM] startBgmCrossfade: ${src}, volumeKey: ${volumeKey}`);

        // Crossfade Logic
        if (currentBgm) {
            const oldBgm = currentBgm;
            currentBgm = null;

            // Fade out old (1s)
            let vol = oldBgm.volume;
            const fadeOut = setInterval(() => {
                vol -= 0.05;
                if (vol <= 0) {
                    clearInterval(fadeOut);
                    oldBgm.pause();
                } else {
                    oldBgm.volume = vol;
                }
            }, 50);
        }

        // Start New
        const newBgm = new Audio(src);
        newBgm.loop = true;
        newBgm.volume = 0;
        newBgm._name = volumeKey;
        newBgm._path = src;
        currentBgm = newBgm;

        newBgm.play().then(() => {
            console.log(`[BGM] Playing: ${src}`);
            // Fade In (1.5s for smooth romantic feel)
            let vol = 0;
            const targetVol = BGM_VOLUMES[volumeKey] || BGM_VOLUMES["default"];

            const fadeIn = setInterval(() => {
                if (!currentBgm || currentBgm !== newBgm) {
                    clearInterval(fadeIn);
                    return;
                }
                vol += 0.02;
                if (vol >= targetVol) {
                    vol = targetVol;
                    clearInterval(fadeIn);
                }
                newBgm.volume = vol;
            }, 30);
        }).catch(e => {
            console.error(`[BGM] Playback failed: ${src}`, e);
            // Do NOT call playBgm here to avoid infinite loop
            // Just log the error
        });
    }

    // Play finale BGM (shared for all routes)
    function playFinaleBgm() {
        if (isPlayingFinaleBgm) {
            console.log(`[BGM] Finale BGM already playing, skip`);
            return;
        }

        isPlayingFinaleBgm = true;
        console.log(`[BGM] Switching to finale BGM`);

        const finaleSrc = BGM_MAP["finale"];

        // Use crossfade for smooth romantic transition
        startBgmCrossfade(finaleSrc, "finale");
    }

    // Assign auto voice files based on route
    function assignAutoVoices(routeId) {
        let voiceCounter = 1;
        const speakerNames = getSpeakerNamesForRoute(routeId);

        for (const key in storyData) {
            const scene = storyData[key];
            // Skip BAD route scenes (they have separate voice files)
            if (key.startsWith('bad')) continue;
            // Skip scenes marked with noVoice flag
            if (scene.noVoice) continue;
            // Note: All heroine lines now get voice files (including silent patterns like 「…………」)
            if (speakerNames.includes(scene.speaker) && scene.text) {
                const paddedNum = String(voiceCounter).padStart(3, '0');
                scene._autoVoiceFile = `${currentRouteBasePath}assets/voice/true/voice_${paddedNum}.wav`;
                voiceCounter++;
            }
        }
        console.log(`Auto-assigned ${voiceCounter - 1} voices for ${speakerNames.join(', ')}.`);
    }

    // Map route ID to speaker names (array, as some routes have multiple speaker names for the same character)
    function getSpeakerNamesForRoute(routeId) {
        const speakerMap = {
            'homare': ['ほまれ'],
            'mitchon': ['みっちょん'],
            'tsumugi': ['つむぎ'],
            'aisu': ['あいす'],
            'nako': ['なこ', '???', '謎の声', 'ひまわり（なこ）']
        };
        return speakerMap[routeId] || [];
    }

    // Show toast notification
    function showToast(message) {
        if (!toastElement) return;
        toastElement.textContent = message;
        toastElement.classList.add('show');
        toastElement.classList.remove('hidden');

        setTimeout(() => {
            toastElement.classList.remove('show');
        }, 2000);
    }

    // Start game (now called after route selection)
    function startGame() {
        // Force unlock if starting directly
        isAudioUnlocked = true;

        if (!storyData || !storyData.start) {
            alert('Invalid story data');
            return;
        }
        playSe("ui_click");
        lastChoiceNodeId = null; // Reset on new game

        // BGM is now handled by playSceneBgm in loadScene
        // playBgm("normal"); // Removed to prevent double BGM with sceneBgm

        showScreen('game');
        loadScene('start');
    }

    function onContinue() {
        playSe("ui_click");
        if (lastChoiceNodeId) {
            fadeLayer.classList.remove('active'); // Ensure fade is off
            showScreen('game');
            loadScene(lastChoiceNodeId);
        }
    }

    function showScreen(screenName) {
        titleScreen.classList.remove('active');
        gameScreen.classList.remove('active');
        endingScreen.classList.remove('active');
        if (storySelectScreen) storySelectScreen.classList.remove('active');
        if (videoScreen) videoScreen.classList.remove('active');
        if (thankyouScreen) thankyouScreen.classList.remove('active');

        if (screenName === 'title') {
            setRandomTitleBackground(); // Re-randomize background when returning to title
            titleScreen.classList.add('active');
            // Switch BGM back to title
            playBgm("title");
        }
        else if (screenName === 'story-select' && storySelectScreen) {
            renderRouteCards();
            storySelectScreen.classList.add('active');
        }
        else if (screenName === 'game') gameScreen.classList.add('active');
        else if (screenName === 'ending') endingScreen.classList.add('active');
        else if (screenName === 'video' && videoScreen) videoScreen.classList.add('active');
        else if (screenName === 'thankyou' && thankyouScreen) thankyouScreen.classList.add('active');
    }

    // Resolve asset path based on current route
    // If path starts with 'assets/', use route-specific path if available
    function resolveAssetPath(path) {
        if (!path) return path;
        // If it's a color code or external URL, return as-is
        if (path.startsWith('#') || path.startsWith('http')) return path;
        // If path starts with 'scenarios/', it's already absolute - return as-is
        if (path.startsWith('scenarios/')) return path;
        // Global assets (bg, bgm, video, se) should NOT be prefixed with route base path
        const globalAssetPrefixes = ['assets/bg/', 'assets/bgm/', 'assets/video/', 'assets/se/'];
        if (globalAssetPrefixes.some(prefix => path.startsWith(prefix))) {
            return path;
        }
        // If path starts with 'assets/' and we have a route base path, resolve it (for chara, voice, etc.)
        if (path.startsWith('assets/') && currentRouteBasePath) {
            return currentRouteBasePath + path;
        }
        return path;
    }

    function loadScene(sceneId) {
        // Clear any pending triggers
        if (nextTimeout) {
            clearTimeout(nextTimeout);
            nextTimeout = null;
        }
        // Ensure no leftover typing
        if (isTyping) {
            clearInterval(typeInterval);
            isTyping = false;
            onTypingComplete = null;
        }

        const scene = storyData[sceneId];
        if (!scene) {
            console.error(`Scene ${sceneId} not found`);
            return;
        }
        currentSceneId = sceneId;

        // Check for scene-based BGM change
        if (scene.sceneId) {
            console.log(`[BGM] Scene changed to: ${scene.sceneId}`);
            playSceneBgm(scene.sceneId);
        }

        // Reset Visual Effects
        gameScreen.classList.remove('shake-effect');
        fadeLayer.classList.remove('flash-effect');
        if (scene.reaction) {
            if (scene.reaction.type === 'shake') {
                gameScreen.classList.add('shake-effect');
                playSe("bad_sting");
            } else if (scene.reaction.type === 'flash') {
                fadeLayer.classList.add('flash-effect');
                playSe("bad_sting");
            }
        }
        // Custom SE
        // Custom SE
        if (scene.se) {
            if (Array.isArray(scene.se)) {
                scene.se.forEach(s => playSe(s));
            }
        }


        // 1. Background (bgImage or background) with fade effect
        const bgSrcRaw = scene.bgImage || scene.background;
        const bgSrc = resolveAssetPath(bgSrcRaw);
        if (bgSrc) {
            if (bgSrc.startsWith('#')) {
                backgroundLayer.style.backgroundImage = 'none';
                backgroundLayer.style.backgroundColor = bgSrc;
            } else {
                // Check if background is actually changing
                const currentBgStyle = backgroundLayer.style.backgroundImage;
                const newBgUrl = `url(${bgSrc})`;
                if (!currentBgStyle.includes(bgSrc)) {
                    // Fade out, change, fade in
                    backgroundLayer.classList.add('bg-fade-out');
                    setTimeout(() => {
                        backgroundLayer.style.backgroundImage = newBgUrl;
                        backgroundLayer.style.backgroundColor = 'transparent';
                        backgroundLayer.classList.remove('bg-fade-out');
                    }, 300);
                }
            }
        }

        // 2. Character (charaImage or chara or faceId)
        let charaSrcRaw = scene.charaImage || scene.chara;

        // faceId support: dynamically generate path from face number
        if (!charaSrcRaw && scene.faceId !== undefined && currentRoute) {
            // Build path based on route: scenarios/{routeId}/assets/chara/{routeId}_{faceId}.jpg
            const routeId = currentRoute.id;
            charaSrcRaw = `scenarios/${routeId}/assets/chara/${routeId}_${scene.faceId}.png`;
        }

        const charaSrc = resolveAssetPath(charaSrcRaw);
        if (charaSrc) {
            // Check if changing?
            const currentSrc = heroineImg.getAttribute('src');
            if (currentSrc !== charaSrc) {
                heroineImg.classList.add('chara-fade-in'); // Trigger animation
                setTimeout(() => heroineImg.classList.remove('chara-fade-in'), 500);
            }
            heroineImg.src = charaSrc;
            heroineImg.classList.remove('hidden');

            if (scene.speaker && scene.speaker.length > 0) {
                heroineImg.classList.remove('dimmed');
            } else {
                heroineImg.classList.add('dimmed');
            }
        } else {
            heroineImg.classList.add('hidden');
        }

        // 2b. Expression (dynamic based on current route)
        // If scene.expression exists, construct path from route base or fallback
        if (scene.expression) {
            // Determine if heroine is speaking (for mouth open/close animation)
            const heroineNames = ['ほまれ', 'みっちょん', 'つむぎ', 'あいす', 'なこ'];
            const isHeroineSpeaking = scene.speaker && heroineNames.includes(scene.speaker);

            // Build expression name (add _close suffix when heroine is not speaking)
            let expressionName = scene.expression;
            if (!isHeroineSpeaking) {
                expressionName = scene.expression + '_close';
            }

            // Try route-specific path first, then fallback to legacy path
            let expPath;
            if (currentRouteBasePath) {
                expPath = `${currentRouteBasePath}assets/chara/${expressionName}.png`;
            } else {
                // Legacy fallback for direct story.json loading
                expPath = `assets/chara/homare/${expressionName}.png`;
            }
            // Only update if currently showing heroine (or if forced)
            heroineImg.src = expPath;
            heroineImg.classList.remove('hidden');

            // Dim when heroine is not speaking
            if (isHeroineSpeaking) {
                heroineImg.classList.remove('dimmed');
            } else {
                heroineImg.classList.add('dimmed');
            }
        }

        // 3. Audio (Voice & BGM)
        if (currentVoice) {
            currentVoice.pause();
            currentVoice.currentTime = 0; // Reset
            currentVoice = null;
        }

        // Priority: Manual voice > Auto voice file
        let voiceSrc = scene.voice || scene._autoVoiceFile;
        // Note: BAD voice is now played in handleChoice when BAD choice is selected

        if (voiceSrc) {
            playVoice(resolveAssetPath(voiceSrc));
        }

        if (scene.bgm) {
            playBgm(scene.bgm);
        }

        // 3b. SE (Sound Effect) from scene.sound property
        if (scene.sound) {
            const seSrc = resolveAssetPath(scene.sound);
            const seAudio = new Audio(seSrc);
            seAudio.volume = seVolume;
            seAudio.play().catch(e => {
                console.warn(`[SE] Failed to play: ${seSrc}`, e);
            });
        }

        // 4. Text & Speaker - Process SE annotations
        let displayText = scene.text || '';

        // Extract and play SE from text (SE：〇〇) or （SE:〇〇）
        displayText = processStorySE(displayText);

        speakerName.textContent = scene.speaker || '';

        // Hide name plate if empty
        if (!scene.speaker) speakerName.style.display = 'none';
        else speakerName.style.display = 'block';

        // Add to conversation log
        if (displayText) {
            addToConversationLog(scene.speaker || '', displayText);
        }

        // 5. Choices or Next
        choicesContainer.innerHTML = '';
        choicesContainer.classList.add('hidden');

        // Start Typewriter
        startTyping(displayText, () => {
            // Logic to execute AFTER text finishes
            if (scene.choices) {
                lastChoiceNodeId = sceneId;

                // Save choice snapshot for "go back" feature
                saveChoiceSnapshot(sceneId, scene);

                renderChoices(scene.choices);
            } else if (scene.delayNext && scene.next) {
                nextTimeout = setTimeout(() => {
                    loadScene(scene.next);
                }, scene.delayNext);
            } else if (scene.isEnd) {
                if (scene.isGameOver) {
                    // Wait for player click before GAMEOVER transition
                    pendingGameOverScene = scene;
                    // Do NOT call triggerGameOver here - wait for handleNext
                } else {
                    // TRUE END: also wait for click
                    pendingGameOverScene = scene;
                }
            }
        });
    }

    // Process and extract SE from text, play SE, return cleaned text
    function processStorySE(text) {
        // Match patterns like （SE：〇〇）or (SE:〇〇) or （SE:〇〇）
        const sePattern = /[（\(]SE[：:]([^）\)]+)[）\)]/g;
        let match;
        const seList = [];

        while ((match = sePattern.exec(text)) !== null) {
            seList.push(match[1].trim());
        }

        // Play each SE found
        seList.forEach(seName => {
            storySEIndex++;
            const paddedIndex = String(storySEIndex).padStart(4, '0');
            const sePath = `assets/se_story/se_${paddedIndex}.mp3`;
            playStorySE(sePath);
        });

        // Remove SE annotations from display text
        return text.replace(sePattern, '').trim();
    }

    function playStorySE(src) {
        const audio = new Audio(src);
        audio.volume = seVolume;
        audio.play().catch(e => {
            // SE file not found, silently skip
            console.log(`Story SE not found: ${src}`);
        });
    }

    function startTyping(text, callback) {
        // Convert \n to <br> for HTML display
        const formattedText = (text || '').replace(/\n/g, '<br>');
        fullText = formattedText;
        messageText.innerHTML = "";
        isTyping = true;
        onTypingComplete = callback;

        if (!text) {
            finishTyping();
            return;
        }

        let i = 0;
        let currentHTML = '';
        typeInterval = setInterval(() => {
            // Handle <br> tags as single units
            if (formattedText.substring(i, i + 4) === '<br>') {
                currentHTML += '<br>';
                i += 4;
            } else {
                currentHTML += formattedText.charAt(i);
                i++;
            }
            messageText.innerHTML = currentHTML;
            if (i >= formattedText.length) {
                finishTyping();
            }
        }, 50); // Romance ADV: slightly slower
    }

    function finishTyping() {
        clearInterval(typeInterval);
        messageText.innerHTML = fullText;
        isTyping = false;

        // Execute callback
        if (onTypingComplete) {
            const cb = onTypingComplete;
            onTypingComplete = null;
            cb();
        }
    }

    function handleNext() {
        // Block handleNext during final message display
        if (isShowingFinalMessage) {
            return; // Let proceedToWhiteout handle the click instead
        }

        // If typing, force finish
        if (isTyping) {
            finishTyping();
            return;
        }

        // If choices are displayed, ignore click (force user to choose)
        if (!choicesContainer.classList.contains('hidden')) return;

        // Check if waiting for GAMEOVER/END transition
        if (pendingGameOverScene) {
            playSe("ui_click");
            const scene = pendingGameOverScene;
            pendingGameOverScene = null; // Clear flag

            if (scene.isGameOver) {
                triggerGameOver(scene);
            } else {
                showEnding(scene);
            }
            return;
        }

        const scene = storyData[currentSceneId];

        playSe("ui_click"); // Click sound for next message

        // End scenes handled in loadScene (callback) or here? 
        // If text finishes and it's an end scene, callback calls showEnding/triggerGameOver.
        // But what if user clicks AFTER text finished?
        // If it's an end scene, showing ending should happen automatically via callback.
        // But showEnding overlays the game screen. So clicking message box shouldn't occur?
        // Note: showScreen('ending') hides game-screen unless we keep overlay.
        // Current showScreen logic switches classes.
        // So clicking message box means we are still in game screen.

        // If scene has 'next', go there.
        // If scene is end, and we are here, something weird, but let's handle.
        if (scene.isEnd) return; // Should have transitioned

        if (scene.next) {
            loadScene(scene.next);
        } else if (!scene.choices && !scene.delayNext) {
            console.warn('No next scene defined');
        }
    }

    function playVoice(src) {
        currentVoice = new Audio(src);
        currentVoice.volume = voiceVolume;
        currentVoice.play().catch(e => {
            console.warn(`[Voice] Failed to play: ${src}`, e);
        });
    }

    function playSe(nameOrFile) {
        // Handle Map key or raw filename
        let src = SE_MAP[nameOrFile];
        // If not in map, maybe it's "ui_click.wav". Try to find key that matches filename? 
        // Or assume it's a relative path? User said "se: ['ui_click.wav']".
        // Let's try to map keys by stripping extension?
        if (!src) {
            // Maybe it IS the key (ui_click)
            if (Object.keys(SE_MAP).includes(nameOrFile)) src = SE_MAP[nameOrFile];
            // Maybe user passed "ui_click.wav"
            else {
                const key = nameOrFile.split('.')[0];
                src = SE_MAP[key] || nameOrFile; // Fallback to raw path
            }
        }
        if (!src) return;

        const audio = new Audio(src);
        audio.volume = seVolume;
        audio.play().catch(e => { });
    }

    function playBgm(bgmName) {
        let src = BGM_MAP[bgmName] || bgmName;

        // Prevent restarting same BGM
        if (currentBgm && currentBgm._name === bgmName) return;

        // Crossfade Logic
        if (currentBgm) {
            const oldBgm = currentBgm;
            currentBgm = null; // Detach immediately so new BGM can start tracking

            // Fade out old
            let vol = oldBgm.volume;
            const fadeOut = setInterval(() => {
                vol -= 0.1;
                if (vol <= 0) {
                    clearInterval(fadeOut);
                    oldBgm.pause();
                } else {
                    oldBgm.volume = vol;
                }
            }, 100); // 0.1s * 10 steps = 1s max
        }

        // Start New
        const newBgm = new Audio(src);
        newBgm.loop = true;
        newBgm.volume = 0; // Start silent for fade in? User said "crossfade".
        newBgm._name = bgmName;
        currentBgm = newBgm;

        newBgm.play().then(() => {
            // Fade In
            let vol = 0;
            // Determine target volume based on BGM type
            const targetVol = BGM_VOLUMES[bgmName] || BGM_VOLUMES["default"];

            const fadeIn = setInterval(() => {
                if (!currentBgm || currentBgm !== newBgm) {
                    clearInterval(fadeIn); // Interrupted
                    return;
                }
                vol += 0.05; // Slower fade in for smoothness
                if (vol >= targetVol) {
                    vol = targetVol;
                    clearInterval(fadeIn);
                }
                newBgm.volume = vol;
            }, 100);
        }).catch(e => {
            console.warn("BGM playback failed:", src);
        });
    }

    function renderChoices(choices) {
        choicesContainer.classList.remove('hidden');
        // Always 4 slots
        for (let i = 0; i < 4; i++) {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';

            if (choices[i]) {
                const choice = choices[i];
                btn.textContent = choice.text;
                // Set Data Attributes
                btn.dataset.next = choice.next || "";
                btn.dataset.correct = choice.isCorrect;
                // gameOverText is legacy now, but keeping for safety if mixed data
                if (choice.gameOverText) {
                    btn.dataset.gameover = choice.gameOverText;
                }
                // BAD Voice indices for wrong choices
                if (choice.qIndex !== undefined) {
                    btn.dataset.qindex = choice.qIndex;
                }
                if (choice.cIndex !== undefined) {
                    btn.dataset.cindex = choice.cIndex;
                }
            } else {
                btn.classList.add('dummy');
                btn.textContent = "-";
            }
            choicesContainer.appendChild(btn);
        }
    }

    function handleChoice(choice) {
        // Play BAD reaction voice if this is a wrong choice with qIndex/cIndex
        if (!choice.isCorrect && choice.qIndex && choice.cIndex) {
            playBadVoice(choice.qIndex, choice.cIndex);
        }

        // Simplified Logic: Just go to next
        if (choice.next) {
            loadScene(choice.next);
        } else {
            console.warn("Choice has no next target:", choice);
        }
    }

    // Play BAD reaction voice from route-specific path or legacy fallback
    // Format: bad_XX_YY.wav (XX = qIndex 2桁, YY = cIndex 2桁)
    function playBadVoice(qIndex, cIndex) {
        const qStr = String(qIndex).padStart(2, '0');
        const cStr = String(cIndex).padStart(2, '0');

        // Use route-specific path or fallback to legacy
        let path;
        if (currentRouteBasePath) {
            path = `${currentRouteBasePath}assets/voice_ng/bad_${qStr}_${cStr}.wav`;
        } else {
            path = `assets/voice/homare_ng/bad_${qStr}_${cStr}.wav`;
        }

        console.log(`[BAD Voice] q=${qIndex}, c=${cIndex}, path=${path}`);

        const audio = new Audio(path);
        audio.volume = voiceVolume;
        audio.play().then(() => {
            console.log(`[BAD Voice] Playing: ${path}`);
        }).catch(e => {
            console.warn(`[BAD Voice] Failed to play: ${path}`, e);
        });
    }

    function triggerGameOver(scene) {
        // 1. Fade out (Fast)
        fadeLayer.classList.add('active');

        // 2. Play Game Over Voice if present
        if (currentVoice) {
            currentVoice.pause();
            currentVoice = null;
        }
        if (scene.voice) {
            const gameOverVoice = new Audio(scene.voice);
            gameOverVoice.volume = 1.0;
            gameOverVoice.play().catch(e => { });
        }

        // 3. 0.5s Delay then show Game Over screen
        setTimeout(() => {
            showEnding(scene);
            fadeLayer.classList.remove('active');
        }, 500);
    }



    function showEnding(scene) {
        // Check if this is TRUE ending (not game over)
        const isGameOver = scene.isGameOver || (scene.text && scene.text.includes('Game Over'));
        const isTrueEnd = scene.isEnd && !isGameOver;

        if (isTrueEnd) {
            // TRUE END: Show final message, then whiteout, then video
            showFinalMessage();
        } else {
            // BAD END or regular ending screen
            showEndingScreen(scene, isGameOver);
        }
    }

    // Flag to control final message phase
    let isShowingFinalMessage = false;

    function showFinalMessage() {
        if (isShowingFinalMessage) return; // Prevent double call
        isShowingFinalMessage = true;

        // DO NOT re-display the final text here!
        // The text is already shown by story.json's last scene.
        // Just set up click handler to proceed to whiteout.

        // Clear pending states to prevent handleNext from interfering
        pendingGameOverScene = null;

        // Wait for click to proceed directly to whiteout
        const proceedToWhiteout = (e) => {
            e.stopPropagation();
            messageBox.removeEventListener('click', proceedToWhiteout);
            triggerWhiteoutAndVideo();
        };
        messageBox.addEventListener('click', proceedToWhiteout);
    }

    // Whiteout effect then play video
    function triggerWhiteoutAndVideo() {
        playSe('ui_click');

        // Setup whiteout with slow transition (1500ms for romantic feel)
        fadeLayer.style.backgroundColor = 'white';
        fadeLayer.style.transition = 'opacity 1.5s ease-in';
        fadeLayer.classList.add('whiteout');
        fadeLayer.classList.remove('hidden');

        // Trigger reflow to ensure transition starts
        fadeLayer.offsetHeight;
        fadeLayer.classList.add('active');

        // After whiteout completes (1500ms + buffer), play video
        setTimeout(() => {
            isShowingFinalMessage = false; // Reset flag
            playEndingVideo();
        }, 1600);
    }

    function showEndingScreen(scene, isGameOver) {
        showScreen('ending');

        if (isGameOver) {
            endingTitle.textContent = "おしまい…";
            endingTitle.style.color = "#ff6b9d";
            if (lastChoiceNodeId) {
                continueBtn.classList.remove('hidden');
            } else {
                continueBtn.classList.add('hidden');
            }
        } else {
            endingTitle.textContent = "HAPPY ENDING";
            endingTitle.style.color = "#d4af37";
            continueBtn.classList.add('hidden');
        }
        endingMessage.textContent = '';
    }

    // Track whether YouTube mode is active
    let isYouTubePlaying = false;

    // YouTube IFrame Player API ready callback
    window.onYouTubeIframeAPIReady = function () {
        ytReady = true;
        console.log('[YT] IFrame API ready');
    };

    function playEndingVideo() {
        // Stop BGM first
        stopBgm();

        const ytId = currentRoute?.endingYouTubeId;

        // Clean up whiteout and fade to black for video
        fadeLayer.classList.remove('whiteout');
        fadeLayer.style.backgroundColor = 'black';
        fadeLayer.style.transition = 'opacity 0.5s ease';

        // Brief moment then show video
        setTimeout(() => {
            fadeLayer.classList.remove('active');
            fadeLayer.classList.add('hidden');

            if (ytId) {
                // === YouTube IFrame Player API ===
                playEndingYouTube(ytId);
                return;
            }

            // === フォールバック（従来の mp4 再生） ===
            isYouTubePlaying = false;
            showScreen('video');

            let videoSrc = 'assets/video/ending.mp4';
            if (currentRoute && currentRoute.endingVideo) {
                videoSrc = currentRoute.endingVideo;
            }

            if (endingVideo) {
                endingVideo.style.display = '';
                const sourceEl = endingVideo.querySelector('source');
                if (sourceEl) {
                    sourceEl.src = videoSrc;
                }
                endingVideo.load();

                endingVideo.currentTime = 0;
                endingVideo.play().catch(e => {
                    console.warn('Video playback failed, skipping to thank you screen', e);
                    showThankYouScreen();
                });

                endingVideo.onended = () => {
                    cleanupVideoSkipListeners();
                    showThankYouScreen();
                };

                setupVideoSkipListeners();
            } else {
                showThankYouScreen();
            }
        }, 300);
    }

    // ===== YouTube IFrame Player API 再生 =====
    function playEndingYouTube(ytId) {
        isYouTubePlaying = true;
        showScreen('video');

        // mp4 を非表示
        if (endingVideo) {
            endingVideo.pause();
            endingVideo.onended = null;
            endingVideo.style.display = 'none';
        }

        // wrap表示
        if (ytWrap) ytWrap.classList.remove('hidden');

        // 既存のプレイヤーがあれば破棄
        if (ytPlayer) {
            try { ytPlayer.destroy(); } catch (e) { }
            ytPlayer = null;
        }

        // yt-player コンテナを復元（destroyで消されるため）
        if (ytPlayerContainer && !document.getElementById('yt-player')) {
            const newDiv = document.createElement('div');
            newDiv.id = 'yt-player';
            ytWrap.appendChild(newDiv);
        }

        const createPlayer = () => {
            ytPlayer = new YT.Player('yt-player', {
                videoId: ytId,
                width: '100%',
                height: '100%',
                playerVars: {
                    autoplay: 1,
                    controls: 0,
                    rel: 0,
                    playsinline: 1,
                    modestbranding: 1,
                    fs: 0
                },
                events: {
                    onStateChange: (event) => {
                        if (event.data === YT.PlayerState.ENDED) {
                            console.log('[YT] Video ended, transitioning to thank you');
                            cleanupYouTubeSkipListeners();
                            cleanupYouTubePlayer();
                            showThankYouScreen();
                        }
                    },
                    onReady: (event) => {
                        console.log('[YT] Player ready, playing video');
                        event.target.playVideo();
                    }
                }
            });

            setupVideoSkipListenersYouTube();
            enableYouTubeOverlay();
        };

        if (ytReady && window.YT && window.YT.Player) {
            createPlayer();
        } else {
            // API がまだ読み込まれていない場合、少し待ってリトライ
            console.log('[YT] Waiting for IFrame API...');
            const waitForApi = setInterval(() => {
                if (window.YT && window.YT.Player) {
                    clearInterval(waitForApi);
                    ytReady = true;
                    createPlayer();
                }
            }, 200);
            // 10秒でタイムアウト
            setTimeout(() => {
                clearInterval(waitForApi);
                if (!ytPlayer) {
                    console.warn('[YT] API load timeout, skipping to thank you');
                    cleanupYouTubePlayer();
                    showThankYouScreen();
                }
            }, 10000);
        }
    }

    // ===== YouTube クリーンアップ =====
    function cleanupYouTubePlayer() {
        isYouTubePlaying = false;
        hideVideoSkipDialog();
        disableYouTubeOverlay();

        if (ytPlayer) {
            try { ytPlayer.stopVideo(); } catch (e) { }
            try { ytPlayer.destroy(); } catch (e) { }
            ytPlayer = null;
        }

        if (ytWrap) ytWrap.classList.add('hidden');

        // コンテナを復元（destroy で iframe に置き換えられるため）
        if (ytWrap && !document.getElementById('yt-player')) {
            const newDiv = document.createElement('div');
            newDiv.id = 'yt-player';
            ytWrap.appendChild(newDiv);
        }

        if (endingVideo) {
            endingVideo.style.display = '';
        }
    }

    // ===== YouTube オーバーレイ管理 =====
    function enableYouTubeOverlay() {
        if (!ytOverlay) return;
        ytOverlay.classList.remove('hidden');

        ytOverlay.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isVideoSkipDialogOpen) return;

            playSe('ui_click');
            showVideoSkipDialog();
            try { ytPlayer?.pauseVideo(); } catch (err) { }
        };
    }

    function disableYouTubeOverlay() {
        if (!ytOverlay) return;
        ytOverlay.classList.add('hidden');
        ytOverlay.onclick = null;
    }

    // ===== YouTube 用スキップリスナー =====
    function setupVideoSkipListenersYouTube() {
        // オーバーレイがクリックを受けるので videoScreen のリスナーは不要

        if (videoSkipYes) {
            videoSkipYes.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                playSe('ui_click');
                hideVideoSkipDialog();
                disableYouTubeOverlay();
                cleanupYouTubeSkipListeners();
                cleanupYouTubePlayer();
                showThankYouScreen();
            };
        }

        if (videoSkipNo) {
            videoSkipNo.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                playSe('ui_click');
                hideVideoSkipDialog();
                try { ytPlayer?.playVideo(); } catch (err) { }
            };
        }
    }

    function cleanupYouTubeSkipListeners() {
        // onclick を解除
        if (videoSkipYes) videoSkipYes.onclick = null;
        if (videoSkipNo) videoSkipNo.onclick = null;
    }

    // ===== mp4 用スキップリスナー（従来） =====
    // Video skip dialog state
    let isVideoSkipDialogOpen = false;

    function setupVideoSkipListeners() {
        // Click on video screen to show skip dialog
        const onVideoClick = (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (isVideoSkipDialogOpen) return;
            if (e.target.closest('#video-skip-dialog')) return;

            showVideoSkipDialog();
        };

        videoScreen.addEventListener('click', onVideoClick);
        videoScreen._skipClickHandler = onVideoClick;

        if (videoSkipYes) {
            const onSkipYes = (e) => {
                e.preventDefault();
                e.stopPropagation();

                playSe('ui_click');
                hideVideoSkipDialog();
                cleanupVideoSkipListeners();

                if (endingVideo) {
                    endingVideo.pause();
                    endingVideo.onended = null;
                }
                showThankYouScreen();
            };
            videoSkipYes.addEventListener('click', onSkipYes);
            videoSkipYes._handler = onSkipYes;
        }

        if (videoSkipNo) {
            const onSkipNo = (e) => {
                e.preventDefault();
                e.stopPropagation();

                playSe('ui_click');
                hideVideoSkipDialog();

                if (endingVideo && endingVideo.paused) {
                    endingVideo.play().catch(e => { });
                }
            };
            videoSkipNo.addEventListener('click', onSkipNo);
            videoSkipNo._handler = onSkipNo;
        }
    }

    function cleanupVideoSkipListeners() {
        if (videoScreen._skipClickHandler) {
            videoScreen.removeEventListener('click', videoScreen._skipClickHandler);
            videoScreen._skipClickHandler = null;
        }
        if (videoSkipYes && videoSkipYes._handler) {
            videoSkipYes.removeEventListener('click', videoSkipYes._handler);
            videoSkipYes._handler = null;
        }
        if (videoSkipNo && videoSkipNo._handler) {
            videoSkipNo.removeEventListener('click', videoSkipNo._handler);
            videoSkipNo._handler = null;
        }
        hideVideoSkipDialog();
    }

    function showVideoSkipDialog() {
        if (videoSkipDialog) {
            isVideoSkipDialogOpen = true;
            videoSkipDialog.classList.remove('hidden');

            // mp4 の場合のみ pause
            if (!isYouTubePlaying && endingVideo && !endingVideo.paused) {
                endingVideo.pause();
            }
        }
    }

    function hideVideoSkipDialog() {
        if (videoSkipDialog) {
            isVideoSkipDialogOpen = false;
            videoSkipDialog.classList.add('hidden');
        }
    }

    // Store reference for cleanup
    let thankyouReturnHandler = null;

    function showThankYouScreen() {
        showScreen('thankyou');

        // Reset final message flag
        isShowingFinalMessage = false;

        // Cleanup any existing handler
        if (thankyouReturnHandler) {
            thankyouScreen.removeEventListener('click', thankyouReturnHandler);
        }

        // Click to return to title
        thankyouReturnHandler = () => {
            thankyouScreen.removeEventListener('click', thankyouReturnHandler);
            thankyouReturnHandler = null;
            showScreen('title');
        };
        thankyouScreen.addEventListener('click', thankyouReturnHandler);
    }

    function stopBgm() {
        if (currentBgm) {
            // Fade out
            let vol = currentBgm.volume;
            const fadeOut = setInterval(() => {
                vol -= 0.1;
                if (vol <= 0) {
                    clearInterval(fadeOut);
                    currentBgm.pause();
                    currentBgm = null;
                } else {
                    if (currentBgm) currentBgm.volume = vol;
                }
            }, 50);
        }
    }

    // ===== Menu Functions =====
    function openGameMenu() {
        if (gameMenuOverlay) {
            gameMenuOverlay.classList.remove('hidden');
        }
    }

    function closeGameMenu() {
        if (gameMenuOverlay) {
            gameMenuOverlay.classList.add('hidden');
        }
    }

    // ===== Confirm Dialog Functions =====
    let pendingConfirmAction = null;

    function showConfirmDialog(message, onConfirm) {
        if (confirmDialog && confirmMessage) {
            confirmMessage.textContent = message;
            pendingConfirmAction = onConfirm;
            confirmDialog.classList.remove('hidden');
        }
    }

    function closeConfirmDialog() {
        if (confirmDialog) {
            confirmDialog.classList.add('hidden');
            pendingConfirmAction = null;
        }
    }

    function executeConfirmAction() {
        const action = pendingConfirmAction;
        closeConfirmDialog();
        if (action) {
            action();
        }
    }

    // ===== Log Functions =====
    function addToConversationLog(speaker, text) {
        conversationLog.push({ speaker, text });
        // Ring buffer: remove oldest if exceeds max
        if (conversationLog.length > MAX_LOG_ENTRIES) {
            conversationLog.shift();
        }
    }

    function openLogOverlay() {
        if (logOverlay && logContent) {
            // Render log entries
            logContent.innerHTML = '';

            if (conversationLog.length === 0) {
                logContent.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align: center;">ログがありません</p>';
            } else {
                conversationLog.forEach(entry => {
                    const entryDiv = document.createElement('div');
                    entryDiv.className = 'log-entry';

                    if (entry.speaker) {
                        const speakerDiv = document.createElement('div');
                        speakerDiv.className = 'log-speaker';
                        speakerDiv.textContent = entry.speaker;
                        entryDiv.appendChild(speakerDiv);
                    }

                    const textDiv = document.createElement('div');
                    textDiv.className = 'log-text';
                    textDiv.textContent = entry.text;
                    entryDiv.appendChild(textDiv);

                    logContent.appendChild(entryDiv);
                });

                // Scroll to bottom (most recent)
                logContent.scrollTop = logContent.scrollHeight;
            }

            logOverlay.classList.remove('hidden');
        }
    }

    function closeLogOverlay() {
        if (logOverlay) {
            logOverlay.classList.add('hidden');
        }
    }

    // ===== Choice History Functions =====
    function saveChoiceSnapshot(sceneId, scene) {
        const snapshot = {
            sceneId: sceneId,
            // Save the ACTUAL current background from DOM (not from scene node, which may not have it)
            currentBgImage: backgroundLayer.style.backgroundImage,
            currentBgColor: backgroundLayer.style.backgroundColor,
            choices: scene.choices
        };
        choiceHistory.push(snapshot);

        // Keep only last 10 choice points
        if (choiceHistory.length > 10) {
            choiceHistory.shift();
        }
    }

    function goBackToPreviousChoice() {
        if (choiceHistory.length === 0) {
            showToast('戻れる選択肢がありません');
            return;
        }

        // Get the last choice snapshot
        const snapshot = choiceHistory.pop();

        // Clear any pending states
        if (nextTimeout) {
            clearTimeout(nextTimeout);
            nextTimeout = null;
        }
        pendingGameOverScene = null;

        // Reload the scene with choices
        loadScene(snapshot.sceneId);

        // Restore background to what it was at the time of the choice
        if (snapshot.currentBgImage) {
            backgroundLayer.style.backgroundImage = snapshot.currentBgImage;
            backgroundLayer.style.backgroundColor = snapshot.currentBgColor || 'transparent';
        }
    }

    // ===== Game State Reset =====
    function resetGameState() {
        // Stop all audio immediately (no fade)
        if (currentVoice) {
            currentVoice.pause();
            currentVoice = null;
        }
        // Stop BGM immediately (not using stopBgm to avoid async fade)
        if (currentBgm) {
            currentBgm.pause();
            currentBgm = null;
        }

        // Cleanup YouTube player if active
        cleanupYouTubeSkipListeners();
        cleanupYouTubePlayer();
        cleanupVideoSkipListeners();

        // Clear states
        conversationLog = [];
        choiceHistory = [];
        currentSceneId = 'start';
        lastChoiceNodeId = null;
        pendingGameOverScene = null;
        currentRoute = null;

        // Clear any pending timeouts
        if (nextTimeout) {
            clearTimeout(nextTimeout);
            nextTimeout = null;
        }

        // Reset fade layer
        fadeLayer.classList.remove('active', 'whiteout');
        fadeLayer.classList.add('hidden');
        fadeLayer.style.backgroundColor = 'black';

        // Reset typing state
        if (isTyping) {
            clearInterval(typeInterval);
            isTyping = false;
            onTypingComplete = null;
        }
    }

});
