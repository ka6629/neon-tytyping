# 🎮 ネオンタイピング オートタイパー

ネオンタイピングゲーム（`https://otonasi-muonn.github.io/typing_game/`）を超高速で自動クリアするスクリプトです。

**拡張機能は不要です。ブラウザのコンソール（F12）で実行するだけで動作します。**

---

## 📋 ファイル構成

```
neon-tytyping/
├── neon-autotyper.html          # UIラッパー（このファイルをブラウザで開く）
├── autotyper-console.js         # コンソール実行用スクリプト（改良版）
└── README.md                     # このファイル
```

---

## 🚀 使い方（3つの方法）

### 📌 方法1: ブックマークレット（最も簡単！推奨）

1. `neon-autotyper.html` をブラウザで開く
2. 「🚀 ネオンタイパー自動実行」をブックマークバーにドラッグ&ドロップ
3. ゲームサイトを開いてブックマークをクリック
4. 自動実行開始！

**メリット:**
- コンソール操作不要
- ワンクリックで実行
- どのページからでも実行可能

### 📌 方法2: HTMLファイル（自動実行）

`neon-typing-game.html` をブラウザで開くだけ！  
5秒後に自動的にゲームが開始します。

### 📌 方法3: コンソール（カスタマイズ可能）

1. `neon-autotyper.html` をブラウザで開く
2. 「スクリプトをコピー」ボタンをクリック
3. ゲームサイトのコンソール（F12）に貼り付け
4. 実行

---

## 🎯 最初のステップ
ブラウザで以下のURLを開いてください：
```
https://otonasi-muonn.github.io/typing_game/
```

### ステップ 2: コンソールを開く
**3つの方法のいずれかでコンソールを開きます：**

- **Windows/Linux**: `F12` キー
- **Mac**: `⌘ + Option + J`
- **手動**: 画面を右クリック → `要素を検証` → `コンソール` タブ

### ステップ 3: スクリプトを実行

**方法A: このプロジェクトのHTMLを使用（推奨）**
1. `neon-autotyper.html` をブラウザで開く
2. `コピー` ボタンをクリック
3. ゲームサイトのコンソールに貼り付けて `Enter`

**方法B: 直接コンソールに貼り付け**
1. `autotyper-console.js` の内容をコピー
2. ゲームサイトのコンソールに貼り付けて `Enter`

---

## 🎮 実行後

スクリプトを実行すると：
1. 自動的にゲームが開始します
2. 10問すべてが自動的にクリアされます
3. 結果画面が表示されます

---

## ⏹️ 停止方法

コンソールで以下を実行：
```javascript
stopAutoTyper()
```

---

## 📊 統計情報

実行中の統計情報を確認：
```javascript
getAutoTyperStats()
```

出力例：
```javascript
{
  enabled: true,
  keysPressed: 156,
  cyclesRun: 45,
  uptime: "3.45s"
}
```

---

## ⚙️ カスタマイズ

### 入力遅延を調整
遅いパソコンの場合、`autotyper-console.js` の最上部を編集：

```javascript
const AUTO_TYPE_DELAY = 50;        // ミリ秒単位（0 = 最速）
```

### デバッグモードを有効化
詳細なログを表示：

```javascript
const DEBUG_MODE = true;
```

---

## 🔧 トラブルシューティング

| 問題 | 解決策 |
|------|--------|
| スクリプトが動作しない | コンソール（F12）にエラーメッセージが表示されていないか確認 |
| DOMが見つからないエラー | ゲームサイトが完全に読み込まれるまで待つ |
| 入力が反応しない | デバッグモードを有効にしてログを確認 |
| キー入力が検出されない | 別のプロセスがキーボード入力を横取りしていないか確認 |
| エラー: Uncaught SyntaxError | スクリプト全体がコピーされているか確認（途中で切れていないか） |

---

## 📝 API リファレンス

### グローバル関数

#### `startAutoTyper()`
タイパーを開始します。
```javascript
startAutoTyper();
```

#### `stopAutoTyper()`
タイパーを停止します。
```javascript
stopAutoTyper();
```

#### `getAutoTyperStats()`
実行統計を取得します。
```javascript
const stats = getAutoTyperStats();
console.log(stats);
```

**戻り値:**
```javascript
{
  enabled: boolean,          // 実行中かどうか
  keysPressed: number,       // 入力されたキー数
  cyclesRun: number,         // 実行サイクル数
  uptime: string             // 実行時間
}
```

---

## 🌐 対応ブラウザ

以下のモダンブラウザで動作します：

- ✅ Chrome / Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Opera

**必須条件:** ES6 対応のブラウザ

---

## 📝 コードの動作原理

1. **画面状態の判定**: `getCurrentScreen()` で IDLE/PLAYING/COMPLETED を判定
2. **次の入力キーを取得**: `getNextTypingKey()` で romaji-current と romaji-remaining から次のキーを抽出
3. **キープレスをシミュレート**: `KeyboardEvent` を作成して `dispatchEvent()` で送信
4. **バッチ処理**: 1サイクルで最大120キーを入力（レスポンス向上のため）
5. **再スケジュール**: 次のティックをスケジュール

---

## ⚠️ 注意事項

- **拡張機能は使用していません**（ブラウザ標準機能のみ）
- **Ctrl+Shift+K**でコンソールをクリアしてもスクリプトは続行します
- **ページをリロード**するとスクリプトが停止します（新規実行が必要）
- **他のタイピングサイト**では動作しない可能性があります（DOM構造が異なるため）

---

## 🛠️ ローカルホストで実行する場合

ローカルサーバーを起動する場合：

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js
npx http-server
```

その後、`http://localhost:8000/neon-autotyper.html` で開きます。

---

## 📄 ライセンス

このスクリプトは個人・教育用途での使用を想定しています。

---

## 💡 Tips

- **複数ウィンドウ**: ゲームサイトを1つのウィンドウで、HTMLラッパーを別ウィンドウで開くと使いやすいです
- **キーボード設定**: ローマ字入力が有効になっていることを確認してください
- **最速設定**: `AUTO_TYPE_DELAY = 0` で最高速にカスタマイズ可能

---

## 🐛 バグ報告

問題が発生した場合、以下の情報をまとめてください：

1. ブラウザとバージョン
2. コンソールのエラーメッセージ
3. 実行したスクリプトの設定
4. 再現手順

---

**最終更新**: 2025-07-18  
**バージョン**: 2.0

