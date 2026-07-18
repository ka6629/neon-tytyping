const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const speedRange = document.getElementById('speed');
const speedValue = document.getElementById('speed-value');
const status = document.getElementById('status');

const updateStatus = (message) => {
  if (status) status.textContent = message;
};

const sendMessageToTab = (message) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab?.id) {
      updateStatus('アクティブなタブが見つかりません。');
      return;
    }

    chrome.tabs.sendMessage(tab.id, message, (response) => {
      if (chrome.runtime.lastError) {
        updateStatus('対象ページに接続できません。ネオンタイピングのページを開いてください。');
        return;
      }

      if (response?.status === 'started') {
        updateStatus('自動タイピングを開始しました。');
      } else if (response?.status === 'stopped') {
        updateStatus('自動タイピングを停止しました。');
      } else {
        updateStatus('拡張機能は対象ページで動作中です。');
      }
    });
  });
};

if (speedRange && speedValue) {
  speedValue.textContent = `${speedRange.value}ms`;
  speedRange.addEventListener('input', () => {
    speedValue.textContent = `${speedRange.value}ms`;
  });
}

if (startButton) {
  startButton.addEventListener('click', () => {
    sendMessageToTab({
      type: 'AUTO_TYPE_START',
      payload: {
        delay: parseInt(speedRange.value, 10)
      }
    });
  });
}

if (stopButton) {
  stopButton.addEventListener('click', () => {
    sendMessageToTab({ type: 'AUTO_TYPE_STOP' });
  });
}
