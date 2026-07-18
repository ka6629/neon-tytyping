# ネオンタイピング自動タイパー

このリポジトリには、`https://otonasi-muonn.github.io/typing_game/` 向けの Chrome 拡張機能が含まれています。

## 使い方

このリポジトリでは、拡張機能を使わずに `https://otonasi-muonn.github.io/typing_game/` 上で自動入力するためのスクリプトを提供します。

### 方法 1: Tampermonkey / Violentmonkey で使う

1. `Tampermonkey` または `Violentmonkey` をブラウザにインストールします。
2. `autotyper.user.js` を開いて内容をコピーします。
3. Tampermonkey の新しいスクリプトとして貼り付けて保存します。
4. `https://otonasi-muonn.github.io/typing_game/` を開くと、自動で入力が開始します。

### 方法 2: ブラウザの開発者ツール Console で使う

1. `https://otonasi-muonn.github.io/typing_game/` を開きます。
2. `F12` または `Ctrl+Shift+I` で開発者ツールを開きます。
3. `Console` タブを選択します。
4. `autotyper-console.js` の中身を全てコピーして貼り付け、Enter を押します。
5. ページを再読み込みすると自動入力が始まります。

### 方法 3: デプロイページから URL を共有する (推奨)

1. このリポジトリを GitHub にプッシュします。
2. GitHub Pages で `index.html` を公開します。
3. 公開された URL を相手の PC に送ります。
4. 送られた先でその URL を開きます。
5. 「ブックマークレットをコピー」を押して、コピーしたコードをブックマークバーの URL 項目に貼り付けます。
6. `https://otonasi-muonn.github.io/typing_game/` を開いた状態でそのブックマークレットをクリックすると、自動入力が開始します。

> `controller.html` は `file://` から開くと動作しにくいため、URL 共有する場合は `index.html` 経由のブックマークレット方式を使ってください。

### ストップ方法

- Tampermonkey を使っている場合: Tampermonkey で該当スクリプトをオフにします。
- Console 実行の場合: ページをリロードします。
- ブックマークレットを使った場合: `https://otonasi-muonn.github.io/typing_game/` をリロードします。

## 追加ファイル

- `autotyper.user.js` - Tampermonkey/Violetmonkey 用のユーザースクリプト
- `autotyper-console.js` - ブラウザ Console に貼り付けて使うスクリプト
- `controller.html` - `file://` から開いた場合に動作しにくい補助ページ
- `controller.js` - `controller.html` から子ウィンドウへ自動入力スクリプトを挿入するコード
- `index.html` - GitHub Pages 等で公開して URL を共有するためのページ
- `deploy.js` - `index.html` のブックマークレット生成スクリプト
