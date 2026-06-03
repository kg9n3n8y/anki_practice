# かるた配置暗記

競技かるたの配置暗記練習 Web アプリ（Vite + React + TypeScript）。

仕様は [`doc/`](doc/) を参照。

## セットアップ

```bash
npm install
cp .env.example .env   # 必要に応じて VITE_BASE_PATH を編集
npm run dev
```

ブラウザで http://localhost:5173 を開く。

## スクリプト

| コマンド | 説明 |
| --- | --- |
| `npm run dev` | 開発サーバー |
| `npm run build` | 本番ビルド（`dist/`） |
| `npm run preview` | ビルド結果のプレビュー |

## GitHub Pages

リポジトリ名が `anki_practice` の場合の例:

```bash
# .env
VITE_BASE_PATH=/anki_practice/
npm run build
```

`dist/` を GitHub Pages にデプロイする。Actions を使う場合はワークフロー（`.github/workflows/deploy.yml`）を参照。

## ディレクトリ

| パス | 説明 |
| --- | --- |
| `src/` | アプリ本体 |
| `src/data/fudalist.ts` | 100首データ（`fudalist.js` から生成） |
| `public/torifuda` | 取り札画像（`torifuda/` へのシンボリックリンク） |
| `torifuda/` | 画像原本 |
| `fudalist.js` | 歌データ原本（レガシー。更新時は TS を再生成） |

### fudalist の再生成

`fudalist.js` を編集したあと:

```bash
npm run generate:fudalist
```

## 実装状況

- [x] Vite + React + TS + React Router + PWA
- [x] 暗記練習スタート（設定保存）
- [x] 暗記練習メイン（盤面・タイマー・確認モード・結果）
- [x] 定位置編集（D&D・保存・JSON 出力）
- [x] トップ（成績表示・定位置 JSON 取りこみ）
- [ ] モバイル陣ズーム（Phase 2）
