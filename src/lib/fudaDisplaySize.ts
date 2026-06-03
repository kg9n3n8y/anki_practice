/** 盤面上の取り札表示幅（px）。viewport と枚数で調整 */
export function fudaDisplayWidth(
  cardCount: number,
  viewportWidth: number,
): number {
  let base: number;
  if (viewportWidth >= 1280) {
    base = 60;
  } else if (viewportWidth >= 960) {
    base = 54;
  } else if (viewportWidth >= 640) {
    base = 46;
  } else {
    base = 38;
  }

  if (cardCount > 40) base -= 8;
  else if (cardCount > 30) base -= 6;
  else if (cardCount > 20) base -= 4;
  else if (cardCount > 10) base -= 2;

  return Math.max(32, base);
}
