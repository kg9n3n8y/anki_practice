import { BOARD_ROW_UNITS } from "./areas";

export { fudaWidthFromContainer, useBoardFudaWidth } from "../hooks/useBoardFudaWidth";
export { BOARD_ROW_UNITS };

/** @deprecated useBoardFudaWidth を使用 */
export function boardRowWidth(fudaWidth: number): number {
  return fudaWidth * BOARD_ROW_UNITS;
}
