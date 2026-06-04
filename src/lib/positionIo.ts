import type { Poem, PositionData, PositionDataV1 } from "../types";
import { parsePositionCompact } from "./positionCompact";
import {
  emptyPositionState,
  poemOrderMap,
  positionFromState,
  stateFromPosition,
} from "./positionState";

export { copyPositionCompact, serializePositionCompact } from "./positionCompact";

export function createEmptyPosition(): PositionData {
  return positionFromState(emptyPositionState());
}

/** コンパクトテキスト形式のみ */
export function parsePositionText(raw: string, poems: Poem[]): PositionData {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error("入力が空です");
  }
  if (trimmed.startsWith("{")) {
    throw new Error("JSON 形式は非対応です。コンパクトテキストを貼り付けてください");
  }
  return parsePositionCompact(trimmed, poems);
}

/** LocalStorage 読み込み用（v2 オブジェクト / 旧 v1 を正規化） */
export function normalizePosition(
  raw: unknown,
  poems: Poem[],
): PositionData | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as { version?: number };
  try {
    if (data.version === 2) {
      return positionFromState(
        stateFromPosition(raw as PositionData, poemOrderMap(poems)),
      );
    }
    if (data.version === 1) {
      return positionFromState(
        stateFromPosition(raw as PositionDataV1, poemOrderMap(poems)),
      );
    }
  } catch {
    return null;
  }
  return null;
}
