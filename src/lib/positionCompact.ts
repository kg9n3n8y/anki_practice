import type { AreaId, Poem, PositionData } from "../types";
import { ALL_AREAS } from "./areas";
import {
  emptyPositionState,
  positionFromState,
  type PositionAreaState,
} from "./positionState";

const AREA_PATTERN =
  /^(leftUpper|rightUpper|leftMiddle|rightMiddle|leftLower|rightLower)$/;

/** 1行1エリア: `leftUpper:3,12`（空エリアは行を省略） */
export function serializePositionCompact(state: PositionAreaState): string {
  const lines = ["# position v2"];
  for (const area of ALL_AREAS) {
    if (state[area].length > 0) {
      lines.push(`${area}:${state[area].join(",")}`);
    }
  }
  return lines.join("\n");
}

function validatePoemNo(raw: string): number {
  const no = Number(raw.trim());
  if (!Number.isFinite(no) || no < 1 || no > 100) {
    throw new Error(`歌番号が不正です: ${raw}`);
  }
  return no;
}

export function parsePositionCompact(raw: string, _poems: Poem[]): PositionData {
  const state = emptyPositionState();
  const seen = new Set<number>();

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    if (trimmed === "v2") continue;

    const colon = trimmed.match(/^(\w+)\s*:\s*(.+)$/);
    if (!colon) {
      throw new Error(`行の形式が不正です: ${line}`);
    }

    const area = colon[1];
    if (!AREA_PATTERN.test(area)) {
      throw new Error(`エリアが不正です: ${area}`);
    }

    const nos = colon[2]
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    for (const token of nos) {
      const no = validatePoemNo(token);
      if (seen.has(no)) continue;
      seen.add(no);
      state[area as AreaId].push(no);
    }
  }

  return positionFromState(state);
}

export async function copyPositionCompact(
  state: PositionAreaState,
): Promise<void> {
  const text = serializePositionCompact(state);
  if (!navigator.clipboard?.writeText) {
    throw new Error("このブラウザではクリップボードにコピーできません");
  }
  await navigator.clipboard.writeText(text);
}
