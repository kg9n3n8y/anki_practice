import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  DEFAULT_PRACTICE_SETTINGS,
  cardCountOptions,
  defaultCardCountForMode,
} from "../lib/practiceDefaults";
import { hasTeigi, loadPracticeSettings, savePracticeSettings } from "../lib/storage";
import type { PracticeMode, PracticeSettings } from "../types";

export function PracticeStartPage() {
  const navigate = useNavigate();
  const teigiAvailable = hasTeigi();
  const [settings, setSettings] = useState<PracticeSettings>(() => {
    const saved = loadPracticeSettings();
    const base = saved ?? DEFAULT_PRACTICE_SETTINGS;
    if (!teigiAvailable) return { ...base, useTeigi: false };
    return base;
  });

  const countOptions = useMemo(
    () => cardCountOptions(settings.mode),
    [settings.mode],
  );

  useEffect(() => {
    if (!countOptions.includes(settings.cardCount)) {
      setSettings((s) => ({
        ...s,
        cardCount: defaultCardCountForMode(s.mode),
      }));
    }
  }, [countOptions, settings.cardCount]);

  const update = <K extends keyof PracticeSettings>(
    key: K,
    value: PracticeSettings[K],
  ) => {
    setSettings((s) => {
      const next = { ...s, [key]: value };
      if (key === "mode") {
        const mode = value as PracticeMode;
        next.cardCount = defaultCardCountForMode(mode);
        if (mode !== "self" && !teigiAvailable) next.useTeigi = false;
      }
      return next;
    });
  };

  const start = () => {
    savePracticeSettings(settings);
    navigate("/practice/main", { state: { settings } });
  };

  return (
    <section className="app-card practice-start">
      <h2>暗記練習スタート</h2>
      <form
        className="practice-start-form"
        onSubmit={(e) => {
          e.preventDefault();
          start();
        }}
      >
        <label>
          モード
          <select
            value={settings.mode}
            onChange={(e) => update("mode", e.target.value as PracticeMode)}
          >
            <option value="opponent">相手陣のみ</option>
            <option value="self">自陣のみ</option>
            <option value="both">両方</option>
          </select>
        </label>

        <label>
          取り札の枚数
          <select
            value={settings.cardCount}
            onChange={(e) => update("cardCount", Number(e.target.value))}
          >
            {countOptions.map((n) => (
              <option key={n} value={n}>
                {n}枚
                {settings.mode === "both" ? `（各 ${n / 2}枚）` : ""}
              </option>
            ))}
          </select>
        </label>

        <label>
          制限時間
          <select
            value={settings.memorizeMinutes}
            onChange={(e) =>
              update("memorizeMinutes", Number(e.target.value))
            }
          >
            {Array.from({ length: 15 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {m}分
              </option>
            ))}
          </select>
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.useTeigi}
            disabled={!teigiAvailable || settings.mode === "opponent"}
            onChange={(e) => update("useTeigi", e.target.checked)}
          />
          自陣の定位置を適用
          {!teigiAvailable && (
            <span className="hint">（定位置が未保存です）</span>
          )}
          {settings.mode === "opponent" && teigiAvailable && (
            <span className="hint">（相手陣のみのときは使えません）</span>
          )}
        </label>

        <label>
          確認モードの出題順
          <select
            value={settings.confirmOrder}
            onChange={(e) =>
              update("confirmOrder", e.target.value as PracticeSettings["confirmOrder"])
            }
          >
            <option value="order">決まり字順</option>
            <option value="random">ランダム順</option>
          </select>
        </label>

        <div className="app-nav">
          <button type="submit" className="app-button">
            練習を開始
          </button>
          <Link to="/" className="app-button secondary">
            トップへ戻る
          </Link>
        </div>
      </form>
    </section>
  );
}
