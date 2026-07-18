/**
 * ネオンタイピング オートタイパー v2.0
 * 
 * 使い方:
 * 1. https://otonasi-muonn.github.io/typing_game/ をブラウザで開く
 * 2. F12キーでコンソールを開く（右クリック→要素を検証→コンソールタブ）
 * 3. このスクリプト全体をコピーして、コンソールに貼り付ける
 * 4. Enterキーで実行
 * 
 * 制御方法:
 * - 開始: startAutoTyper()
 * - 停止: stopAutoTyper()
 */

(function () {
  // ============ 設定 ============
  const AUTO_TYPE_DELAY = 0;        // 入力遅延（ミリ秒）。0=最速
  const AUTO_TYPE_BATCH_LIMIT = 120; // 1回のループで処理する最大キー数
  const DEBUG_MODE = false;          // デバッグログを表示するか
  
  // ============ 内部変数 ============
  let enabled = false;
  let timeoutId = null;
  let stats = {
    keysPressed: 0,
    cyclesRun: 0,
    startTime: null
  };

  // ============ ロギング ============
  const log = (msg, level = 'info') => {
    if (!DEBUG_MODE && level === 'debug') return;
    const timestamp = new Date().toLocaleTimeString('ja-JP');
    const prefix = `[${timestamp}] AutoTyper`;
    console.log(`%c${prefix}`, 'color: #00d4ff; font-weight: bold;', msg);
  };

  // ============ DOM操作 ============
  const getCurrentScreen = () => {
    const screenIdle = document.getElementById('screen-idle');
    const screenPlaying = document.getElementById('screen-playing');
    const screenCompleted = document.getElementById('screen-completed');
    if (screenPlaying?.classList.contains('active')) return 'PLAYING';
    if (screenCompleted?.classList.contains('active')) return 'COMPLETED';
    if (screenIdle?.classList.contains('active')) return 'IDLE';
    return null;
  };

  const getNextTypingKey = () => {
    const current = document.getElementById('romaji-current')?.textContent?.trim();
    const remaining = document.getElementById('romaji-remaining')?.textContent?.trim();
    if (current) return current[0];
    if (remaining) return remaining[0];
    return null;
  };

  const makeKeyboardEvent = (key) => {
    const code = (() => {
      if (/^[a-z]$/i.test(key)) return `Key${key.toUpperCase()}`;
      if (key === '-') return 'Minus';
      if (key === ',') return 'Comma';
      if (key === '.') return 'Period';
      if (key === ';') return 'Semicolon';
      if (key === ':') return 'Colon';
      if (key === '/') return 'Slash';
      return 'Unidentified';
    })();

    return new KeyboardEvent('keydown', {
      key,
      code,
      bubbles: true,
      cancelable: true,
      composed: true,
      shiftKey: false,
      ctrlKey: false,
      altKey: false,
      metaKey: false,
      isComposing: false,
    });
  };

  const dispatchTypingKey = (key) => {
    if (!key) return false;
    window.dispatchEvent(makeKeyboardEvent(key));
    stats.keysPressed++;
    return true;
  };

  const clickStartButtonIfIdle = () => {
    const screenIdle = document.getElementById('screen-idle');
    const startButton = document.getElementById('btn-start');
    if (screenIdle?.classList.contains('active') && startButton) {
      log('Start button clicked. Game initializing...', 'debug');
      startButton.click();
      return true;
    }
    return false;
  };

  // ============ メインロジック ============
  const runAutoTyping = () => {
    if (!enabled) return;

    stats.cyclesRun++;
    const currentScreen = getCurrentScreen();

    // IDLE画面では開始ボタンをクリック
    if (currentScreen === 'IDLE') {
      clickStartButtonIfIdle();
      scheduleNextTick();
      return;
    }

    // PLAYING画面以外では処理停止
    if (currentScreen !== 'PLAYING') {
      if (currentScreen === 'COMPLETED') {
        log(`Game completed! Total keys pressed: ${stats.keysPressed}`, 'info');
      }
      return;
    }

    // 複数のキーを一度に入力（バッチ処理）
    let nextKey = getNextTypingKey();
    let batchCount = 0;

    while (enabled && nextKey && batchCount < AUTO_TYPE_BATCH_LIMIT) {
      dispatchTypingKey(nextKey);
      batchCount++;
      
      // 画面状態が変わったら処理停止
      if (getCurrentScreen() !== 'PLAYING') break;
      
      nextKey = getNextTypingKey();
    }

    if (DEBUG_MODE && batchCount > 0) {
      log(`Batch cycle: ${batchCount} keys processed`, 'debug');
    }

    scheduleNextTick();
  };

  const scheduleNextTick = () => {
    if (!enabled) return;
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(runAutoTyping, AUTO_TYPE_DELAY);
  };

  // ============ グローバルAPI ============
  window.startAutoTyper = function() {
    if (enabled) {
      log('Already running!');
      return;
    }
    enabled = true;
    stats.startTime = Date.now();
    stats.keysPressed = 0;
    stats.cyclesRun = 0;
    log('🚀 Auto Typer started!');
    runAutoTyping();
  };

  window.stopAutoTyper = function() {
    if (!enabled) {
      log('Already stopped!');
      return;
    }
    enabled = false;
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    const duration = stats.startTime ? ((Date.now() - stats.startTime) / 1000).toFixed(2) : 'unknown';
    log(`⏹️  Auto Typer stopped. (${stats.keysPressed} keys, ${duration}s, ${stats.cyclesRun} cycles)`);
  };

  window.getAutoTyperStats = function() {
    return {
      enabled,
      keysPressed: stats.keysPressed,
      cyclesRun: stats.cyclesRun,
      uptime: stats.startTime ? ((Date.now() - stats.startTime) / 1000).toFixed(2) + 's' : 'N/A'
    };
  };

  window.setAutoTyperDelay = function(delay) {
    if (typeof delay !== 'number' || delay < 0) {
      log('Invalid delay value!');
      return;
    }
    // 注: このスクリプトの設定では AUTO_TYPE_DELAY が固定なので、
    // カスタマイズが必要な場合はスクリプトを編集してください
    log(`Delay configuration would need script modification.`);
  };

  // ============ クリーンアップ ============
  window.addEventListener('beforeunload', () => {
    window.stopAutoTyper();
  });

  // ============ 起動 ============
  log('✓ Auto Typer script loaded successfully!');
  log('Commands: startAutoTyper() | stopAutoTyper() | getAutoTyperStats()');
  window.startAutoTyper();
})();
