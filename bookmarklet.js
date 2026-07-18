(() => {
  const TARGET_ORIGIN = "https://otonasi-muonn.github.io";
  const TARGET_PATH = "/typing_game/";
  const MAX_BURST_KEYS = 10000;

  if (location.origin !== TARGET_ORIGIN || !location.pathname.startsWith(TARGET_PATH)) {
    alert("Neon Typing のページで実行してください。\n" + TARGET_ORIGIN + TARGET_PATH);
    return;
  }

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const isScreenActive = (id) => document.getElementById(id)?.classList.contains("active");
  const getButton = (id) => document.getElementById(id);
  const getText = (id) => document.getElementById(id)?.textContent?.trim() || "";

  const getNextKey = () => {
    const current = getText("romaji-current");
    if (current) return current[0];

    const remaining = getText("romaji-remaining");
    if (remaining) return remaining[0];

    return "";
  };

  const dispatchKey = (key) => {
    const event = new KeyboardEvent("keydown", {
      key,
      code: /^[a-z]$/i.test(key) ? `Key${key.toUpperCase()}` : "Unidentified",
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);
  };

  const removeOldPanel = () => {
    document.getElementById("neon-typing-autotype-status")?.remove();
  };

  const createPanel = (stop) => {
    removeOldPanel();

    const panel = document.createElement("button");
    panel.id = "neon-typing-autotype-status";
    panel.type = "button";
    panel.addEventListener("click", stop);

    Object.assign(panel.style, {
      position: "fixed",
      right: "16px",
      bottom: "16px",
      zIndex: "2147483647",
      padding: "10px 14px",
      border: "1px solid rgba(255,255,255,.18)",
      borderRadius: "12px",
      background: "rgba(2,6,23,.88)",
      color: "#fff",
      boxShadow: "0 0 24px rgba(124,58,237,.45)",
      cursor: "pointer",
      font: "13px system-ui, sans-serif",
      lineHeight: "1.45",
      textAlign: "left",
      maxWidth: "300px",
    });

    document.body.appendChild(panel);
    return panel;
  };

  const previous = window.neonTypingAutoTyper;
  if (previous?.running) {
    previous.stop("停止しました");
    return;
  }

  const autoTyper = {
    running: true,
    panel: null,
    idleCycles: 0,
    typedCount: 0,

    setStatus(text) {
      if (!this.panel) return;
      this.panel.textContent = `Neon Typing Auto: ${text}\nクリックで停止`;
    },

    stop(text = "停止しました") {
      this.running = false;
      this.setStatus(text);
    },

    async run() {
      this.panel = createPanel(() => this.stop());
      this.setStatus("起動中...");

      while (this.running) {
        if (isScreenActive("screen-completed")) {
          this.stop(`完了しました / ${this.typedCount}打鍵`);
          break;
        }

        if (isScreenActive("screen-idle")) {
          getButton("btn-start")?.click();
          this.idleCycles = 0;
          this.setStatus("ゲーム開始中...");
          await sleep(120);
          continue;
        }

        if (isScreenActive("screen-playing")) {
          let burstCount = 0;

          while (this.running && isScreenActive("screen-playing") && burstCount < MAX_BURST_KEYS) {
            const nextKey = getNextKey();
            if (!nextKey) break;

            dispatchKey(nextKey);
            burstCount += 1;
            this.typedCount += 1;
          }

          if (burstCount > 0) {
            this.idleCycles = 0;
            this.setStatus(`一括入力中: ${this.typedCount}打鍵`);
            continue;
          }
        }

        if (isScreenActive("screen-completed")) {
          this.stop(`完了しました / ${this.typedCount}打鍵`);
          continue;
        }

        this.idleCycles += 1;
        if (this.idleCycles > 80) {
          this.stop("入力対象が見つからないため停止しました");
          break;
        }

        this.setStatus(`待機中... ${this.idleCycles}`);
        await sleep(50);
      }
    },
  };

  window.neonTypingAutoTyper = autoTyper;
  autoTyper.run();
})();
