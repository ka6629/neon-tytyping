/*
  neon-tytyping のページで拡張機能なしに自動入力するスクリプトです。
  開発者ツールの Console に貼り付けて実行してください。
*/
(function () {
  const AUTO_TYPE_DELAY_DEFAULT = 0;
  const AUTO_TYPE_BATCH_LIMIT = 120;
  let enabled = false;
  let timeoutId = null;

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
    if (!key) return;
    window.dispatchEvent(makeKeyboardEvent(key));
  };

  const clickStartButtonIfIdle = () => {
    const screenIdle = document.getElementById('screen-idle');
    const startButton = document.getElementById('btn-start');
    if (screenIdle?.classList.contains('active') && startButton) {
      startButton.click();
    }
  };

  const runAutoTyping = () => {
    if (!enabled) return;

    const currentScreen = getCurrentScreen();
    if (currentScreen === 'IDLE') {
      clickStartButtonIfIdle();
      scheduleNextTick();
      return;
    }

    if (currentScreen !== 'PLAYING') return;

    let nextKey = getNextTypingKey();
    let batchCount = 0;

    while (enabled && nextKey && batchCount < AUTO_TYPE_BATCH_LIMIT) {
      dispatchTypingKey(nextKey);
      batchCount += 1;
      if (getCurrentScreen() !== 'PLAYING') return;
      nextKey = getNextTypingKey();
    }

    scheduleNextTick();
  };

  const scheduleNextTick = () => {
    if (!enabled) return;
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(runAutoTyping, AUTO_TYPE_DELAY_DEFAULT);
  };

  const startAutoTyping = () => {
    if (enabled) return;
    enabled = true;
    runAutoTyping();
    console.log('Neon Typing AutoTyper started.');
  };

  const stopAutoTyping = () => {
    enabled = false;
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    console.log('Neon Typing AutoTyper stopped.');
  };

  window.addEventListener('beforeunload', stopAutoTyping);
  startAutoTyping();
})();
