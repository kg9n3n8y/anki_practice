# かるた暗記練

競技かるたの配置暗記練習 Web アプリ（Vite + React + TypeScript）。

仕様は [`doc/`](doc/) を参照（Phase 1 の実装内容と同期済み。未実装はモバイル陣ズームのみ）。

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

公開 URL（例）: https://kg9n3n8y.github.io/anki_practice/

**重要:** リポジトリ直下の `index.html`（開発用）をそのまま公開しても動きません。必ず **`npm run build` で生成した `dist/`** をデプロイしてください。

### 推奨: GitHub Actions で自動デプロイ

1. GitHub リポジトリ → **Settings** → **Pages**
2. **Build and deployment** → **Source** を **GitHub Actions** に設定  
   - **「Deploy from a branch」＋ `main` / `/ (root)` のままだと真っ白になります**（未ビルドの `index.html` が公開される）
3. `main` に push すると `.github/workflows/deploy.yml` が実行される
4. **Actions** で「Deploy to GitHub Pages」が **成功**するまで待つ
5. https://kg9n3n8y.github.io/anki_practice/ を開く（反映に 1〜2 分）

**今すぐ直す手順（真っ白なとき）**

1. **Settings → Pages → Source** を **GitHub Actions** に変更して Save
2. **Actions** タブ → 「Deploy to GitHub Pages」→ **Run workflow**（または空コミットで push）
3. 完了後、ブラウザで **スーパーリロード**（キャッシュ削除）

**代替:** Source を **Deploy from a branch** にする場合は、ブランチ **`gh-pages`**・フォルダ **`/ (root)`** を選ぶ（ワークフローがビルド結果を `gh-pages` にも push します）。**`main` / root は選ばないでください。**

ワークフローは `VITE_BASE_PATH=/${リポジトリ名}/` でビルドします。

`username.github.io` リポジトリ（ユーザーサイト）の場合は `VITE_BASE_PATH=/` に変更します。

### ローカルで Pages 向けビルドを試す

```bash
npm run build:pages
npm run preview
```

ブラウザの開発者ツール → Network で、JS/CSS が `/anki_practice/assets/...` から **200** で読み込まれていることを確認してください。`/src/main.tsx` を参照していたら base path が間違っています。

### うまく表示されないとき

| 症状 | 原因の例 |
| --- | --- |
| 真っ白・何も表示されない | Pages の Source が branch の `/ (root)` になっている（未ビルドの index.html を公開している） |
| デザインなし・真っ白 | `VITE_BASE_PATH` が `/` のままビルドしている |
| 404 | URL が `...github.io/anki_practice`（末尾スラッシュなし）→ `.../anki_practice/` を試す |

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

Phase 1 は実装済み。仕様の詳細は [`doc/`](doc/) を参照。

- [x] Vite + React + TS + React Router + PWA（アイコン含む）
- [x] GitHub Actions による GitHub Pages デプロイ
- [x] トップ（成績・定位置テキスト取りこみ・URLコピー・作者リンク）
- [x] 暗記練習スタート（2列設定 UI・LocalStorage 保存）
- [x] 暗記練習メイン（暗記タイマー・確認モード・近接正解・効果音・結果）
- [x] 定位置編集（`/position`、D&D・テキストコピー・旧 `/teigi` リダイレクト）
- [ ] モバイル陣ズーム（Phase 2・未実装）
