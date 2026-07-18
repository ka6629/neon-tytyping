const openBtn = document.getElementById('open-btn');
const stopBtn = document.getElementById('stop-btn');
const statusEl = document.getElementById('status');
const targetUrlInput = document.getElementById('target-url');
const delayInput = document.getElementById('delay-ms');

let childWindow = null;
let checkIntervalId = null;

const setStatus = (text) => {
  statusEl.textContent = text;
};

const getAutoTyperCode = (delayMs) => {
  return `(() => {
    const AUTO_TYPE_DELAY_DEFAULT = ${delayMs};
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

    const scheduleNextTick = () => {
      if (!enabled) return;
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(runAutoTyping, AUTO_TYPE_DELAY_DEFAULT);
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
    window.neonTypingAutoTyper = {
      start: startAutoTyping,
      stop: stopAutoTyping,
    };
    startAutoTyping();
  })();`;
};

const injectAutoTyperToChild = (win, delayMs) => {
  try {
    const code = getAutoTyperCode(delayMs);
    const script = win.document.createElement('script');
    script.type = 'text/javascript';
    script.textContent = code;
    win.document.documentElement.appendChild(script);
    script.remove();
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

const waitForChildReady = (win) => {
  return new Promise((resolve, reject) => {
    const checkReady = () => {
      if (!win || win.closed) {
        reject(new Error('子ウィンドウが閉じられました。'));
        return;
      }
      try {
        if (win.document.readyState === 'complete') {
          resolve();
          return;
        }
      } catch (error) {
        reject(new Error('子ウィンドウにアクセスできません。origin を確認してください。'));
        return;
      }
      setTimeout(checkReady, 200);
    };
    checkReady();
  });
};

const openTargetPage = async () => {
  const targetUrl = targetUrlInput.value.trim();
  const delayMs = Math.max(0, parseInt(delayInput.value, 10) || 0);

  if (!targetUrl) {
    setStatus('ターゲット URL を入力してください。');
    return;
  }

  if (childWindow && !childWindow.closed) {
    childWindow.focus();
    setStatus('既に開かれているウィンドウがあります。停止してから再開してください。');
    return;
  }

  childWindow = window.open(targetUrl, 'neonTypingAutoTyperWindow', 'width=560,height=420,left=0,top=0');
  if (!childWindow) {
    setStatus('ポップアップがブロックされました。ブラウザの設定を確認してください。');
    return;
  }

  setStatus('ページを開きました。読み込み完了を待機しています...');
  stopBtn.disabled = true;

  try {
    await waitForChildReady(childWindow);
    const injected = injectAutoTyperToChild(childWindow, delayMs);
    if (!injected) {
      setStatus('自動タイパーの挿入に失敗しました。origin を確認してください。');
      return;
    }
    setStatus('自動タイパーを挿入し、実行を開始しました。子ウィンドウ内で動作します。');
    stopBtn.disabled = false;
  } catch (error) {
    setStatus(error.message);
  }
};

const stopTargetTyping = () => {
  if (!childWindow || childWindow.closed) {
    setStatus('現在操作中のウィンドウがありません。');
    stopBtn.disabled = true;
    return;
  }

  try {
    if (childWindow.neonTypingAutoTyper && typeof childWindow.neonTypingAutoTyper.stop === 'function') {
      childWindow.neonTypingAutoTyper.stop();
      setStatus('自動タイピングを停止しました。子ウィンドウは開いたままです。');
    } else {
      setStatus('子ウィンドウに自動タイパーが見つかりませんでした。');
    }
  } catch (error) {
    setStatus('子ウィンドウにアクセスできません。origin を確認してください。');
  }
};

openBtn.addEventListener('click', openTargetPage);
stopBtn.addEventListener('click', stopTargetTyping);

window.addEventListener('beforeunload', () => {
  if (childWindow && !childWindow.closed) {
    childWindow.close();
  }
});
