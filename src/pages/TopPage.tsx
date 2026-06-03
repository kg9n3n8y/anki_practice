import { useState } from "react";
import { Link } from "react-router-dom";
import { modeLabel } from "../lib/poemImage";
import { hasTeigi, loadResults, saveTeigi } from "../lib/storage";
import { parseTeigiJson } from "../lib/teigiIo";

export function TopPage() {
  const results = loadResults();
  const teigiSaved = hasTeigi();
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const [importOk, setImportOk] = useState("");

  const doImport = () => {
    setImportError("");
    setImportOk("");
    try {
      const data = parseTeigiJson(importText);
      saveTeigi(data);
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
      <section className="app-card">
        <h2>暗記練習</h2>
        <Link to="/practice/start" className="app-button">
          暗記練習を始める
        </Link>
      </section>

      <section className="app-card">
        <h2>定位置</h2>
        <p>保存状態: {teigiSaved ? "保存済み" : "未保存"}</p>
        <div className="app-nav">
          <Link to="/teigi" className="app-button">
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
                {new Date(r.at).toLocaleString("ja-JP")} — {modeLabel(r.mode)}{" "}
                {r.cardCount}枚 / 暗記 {r.memorizeMinutes}分 / 正答{" "}
                {r.correctCount}/{r.questionCount}（
                {Math.round((r.correctCount / r.questionCount) * 100)}%）/ 確認{" "}
                {r.confirmSeconds}秒
              </li>
            ))}
          </ul>
        )}
      </section>

      {importOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal app-card">
            <h2>定位置の取りこみ</h2>
            <p>JSON を貼り付けるか、ファイルを選択してください。</p>
            <textarea
              className="import-textarea"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows={8}
              placeholder='{"version":1,...}'
            />
            <input
              type="file"
              accept="application/json,.json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  setImportText(String(reader.result ?? ""));
                };
                reader.readAsText(file);
              }}
            />
            {importError && <p className="error-msg">{importError}</p>}
            {importOk && <p className="save-msg">{importOk}</p>}
            <div className="app-nav">
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
