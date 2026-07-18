# autotype

このフォルダはタイピング自動化のサンプルを含みます。

## 概要
`fast_typist.py` は Playwright を使ってウェブページに対して超高速でキーイベントを送信する簡易スクリプトです。あなたのサイト https://otonasi-muonn.github.io/typing_game/ などのクライアント側タイピングゲームで利用できます。

## セットアップ

Windows での手順（Python 3.8+ 推奨）:

```powershell
pip install -r autotype/requirements.txt
python -m playwright install
```

## 実行例

ページ上でフォーカスすべき入力要素が分かっている場合:

```powershell
python autotype/fast_typist.py --url "https://otonasi-muonn.github.io/typing_game/" --selector "#input" --text "hello world" --headless
```

ページに表示されている文章を自動で取得して打ちたい場合（一般的なセレクタに一致する要素があるとき）:

```powershell
python autotype/fast_typist.py --url "https://otonasi-muonn.github.io/typing_game/" --headless
```

### 遅延オプション

一部のゲームは瞬時すぎるキーイベントを無視するため、`--delay-ms` でキー間の遅延をミリ秒単位で指定できます（例: `--delay-ms 10`）。

## 注意
- このスクリプトは自分が管理するサイトやテスト目的でのみ使用してください。他サイトでの無断自動操作は利用規約違反や法律違反になる可能性があります。
- ゲームによってはキーイベントの検知方法が独特で、本スクリプトで期待通り動かない場合があります。その場合はページ内のイベントハンドラに合わせて `JS_TYPER` を調整してください。
