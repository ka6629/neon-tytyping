const AUTO_TYPE_DELAY_DEFAULT = 0;
const AUTO_TYPE_BATCH_LIMIT = 120;
let autoTyping = {
  enabled: false,
  delay: AUTO_TYPE_DELAY_DEFAULT,
  timeoutId: null
};

const isTargetTypingPage = () => {
  return location.hostname === 'otonasi-muonn.github.io' && location.pathname.startsWith('/typing_game');
};

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
    if (/^[a-z]$/i.test(key)) {
      return `Key${key.toUpperCase()}`;
    }
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
    isComposing: false
  });
};

const dispatchTypingKey = (key) => {
  if (!key) return;
  const event = makeKeyboardEvent(key);
  window.dispatchEvent(event);
};

const clickStartButtonIfIdle = () => {
  const screenIdle = document.getElementById('screen-idle');
  const startButton = document.getElementById('btn-start');
  if (screenIdle?.classList.contains('active') && startButton) {
    startButton.click();
  }
};

const scheduleNextTick = () => {
  if (!autoTyping.enabled) return;
  if (autoTyping.timeoutId) {
    clearTimeout(autoTyping.timeoutId);
  }
  autoTyping.timeoutId = setTimeout(runAutoTyping, Math.max(0, autoTyping.delay));
};

const runAutoTyping = () => {
  if (!autoTyping.enabled || !isTargetTypingPage()) return;

  const currentScreen = getCurrentScreen();
  if (currentScreen === 'IDLE') {
    clickStartButtonIfIdle();
    scheduleNextTick();
    return;
  }

  if (currentScreen !== 'PLAYING') {
    return;
  }

  let nextKey = getNextTypingKey();
  let batchCount = 0;

  while (autoTyping.enabled && nextKey && batchCount < AUTO_TYPE_BATCH_LIMIT) {
    dispatchTypingKey(nextKey);
    batchCount += 1;

    if (getCurrentScreen() !== 'PLAYING') {
      return;
    }

    nextKey = getNextTypingKey();
  }

  scheduleNextTick();
};

const startAutoTyping = (delay) => {
  stopAutoTyping();
  autoTyping.enabled = true;
  autoTyping.delay = Number.isFinite(delay) ? delay : AUTO_TYPE_DELAY_DEFAULT;
  runAutoTyping();
};

const stopAutoTyping = () => {
  if (autoTyping.timeoutId) {
    clearTimeout(autoTyping.timeoutId);
    autoTyping.timeoutId = null;
  }
  autoTyping.enabled = false;
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message.type !== 'string') return;

  if (message.type === 'AUTO_TYPE_START') {
    startAutoTyping(message.payload?.delay ?? AUTO_TYPE_DELAY_DEFAULT);
    sendResponse({ status: 'started' });
  }

  if (message.type === 'AUTO_TYPE_STOP') {
    stopAutoTyping();
    sendResponse({ status: 'stopped' });
  }
});

if (isTargetTypingPage()) {
  // ページを開いた時点で自動起動する
  startAutoTyping(AUTO_TYPE_DELAY_DEFAULT);
  window.addEventListener('beforeunload', stopAutoTyping);
}
