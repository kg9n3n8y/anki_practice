import { useState } from "react";
import { Link } from "react-router-dom";
import { fudalist } from "../data/fudalist";
import { modeLabel } from "../lib/poemImage";
import { parsePositionText } from "../lib/positionIo";
import { hasPosition, loadResults, savePosition } from "../lib/storage";

const APP_SHARE_URL = "https://kg9n3n8y.github.io/anki_practice/";
const AUTHOR_SITE_URL =
  "https://sites.google.com/view/hyakunin-issyu-oboekata/";

export function TopPage() {
  const results = loadResults();
  const positionSaved = hasPosition();
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const [importOk, setImportOk] = useState("");
  const [urlCopied, setUrlCopied] = useState(false);

  const copyAppUrl = async () => {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("clipboard unavailable");
      }
      await navigator.clipboard.writeText(APP_SHARE_URL);
      setUrlCopied(true);
      window.setTimeout(() => setUrlCopied(false), 2000);
    } catch {
      window.alert("コピーに失敗しました");
    }
  };

  const doImport = () => {
    setImportError("");
    setImportOk("");
    try {
      const data = parsePositionText(importText, fudalist);
      savePosition(data);
      setImportOk("定位置を取り込みました");
      setImportText("");
      window.setTimeout(() => {
        setImportOpen(false);
        setImportOk("");
      }, 1500);
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "読み込みに失敗しました");
    }
  };

  return (
    <>
      <header className="app-title-header">
        <h1 className="app-title">かるた暗記練</h1>
      </header>

      <section className="app-card">
        <h2>暗記練習</h2>
        <Link to="/practice/start" className="app-button">
          暗記練習を始める
        </Link>
      </section>

      <section className="app-card">
        <h2>定位置</h2>
        <p>保存状態: {positionSaved ? "保存済み" : "未保存"}</p>
        <div className="app-nav">
          <Link to="/position" className="app-button">
            定位置を編集する
          </Link>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              setImportOpen(true);
              setImportError("");
              setImportOk("");
            }}
          >
            定位置の取りこみ
          </button>
        </div>
      </section>

      <section className="app-card">
        <h2>最近の成績（直近5回）</h2>
        {results.length === 0 ? (
          <p className="app-placeholder">まだ成績がありません。</p>
        ) : (
          <ul className="results-list">
            {results.map((r) => (
              <li key={r.at}>
                {new Date(r.at).toLocaleString("ja-JP", {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                — {modeLabel(r.mode)}{" "}
                {r.cardCount}枚 / 暗記 {r.memorizeMinutes}分 / 正答{" "}
                {r.correctCount}/{r.questionCount}（
                {Math.round((r.correctCount / r.questionCount) * 100)}%）/ 確認{" "}
                {r.confirmSeconds}秒
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="app-footer">
        <button
          type="button"
          className="app-footer-copy"
          onClick={() => void copyAppUrl()}
        >
          {urlCopied ? "コピーしました" : "URLをコピー"}
        </button>
        <p className="app-footer-author">
          作者:{" "}
          <a
            href={AUTHOR_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="app-footer-author-link"
          >
            つばさ先輩
          </a>
        </p>
      </footer>

      {importOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal app-card">
            <h2>定位置の取りこみ</h2>
            <p>
              定位置編集でコピーしたテキストを貼り付けて取り込みます。
            </p>
            <div className="import-dialog-body">
              <label className="import-field">
                <span className="import-field-label">テキストを貼り付け</span>
                <textarea
                  className="import-textarea"
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  rows={8}
                  placeholder={"# position v2\nleftUpper:3,12\nrightMiddle:42"}
                />
              </label>

              {importError && <p className="error-msg">{importError}</p>}
              {importOk && <p className="save-msg">{importOk}</p>}
            </div>
            <div className="app-nav import-dialog-actions">
              <button type="button" className="app-button" onClick={doImport}>
                取り込む
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => setImportOpen(false)}
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
