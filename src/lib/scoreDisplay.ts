/** 正答数（近接正解の 0.5 点を含む）の表示用 */
export function formatCorrectCount(count: number): string {
  return count % 1 === 0 ? String(count) : count.toFixed(1);
}

/** 正答率（%）の表示用 */
export function formatCorrectRatePercent(
  correctCount: number,
  questionCount: number,
): string {
  if (questionCount === 0) return "0";
  const pct = (correctCount / questionCount) * 100;
  return pct % 1 === 0 ? String(Math.round(pct)) : pct.toFixed(1);
}
