import type { AreaId } from "../types";

export const MAX_CARDS_PER_AREA = 6;

/** 1段の幅 = 左6枚 + 隙間1枚 + 右6枚 */
export const BOARD_ROW_UNITS = MAX_CARDS_PER_AREA * 2 + 1;

export const LEFT_AREAS: AreaId[] = [
  "leftUpper",
  "leftMiddle",
  "leftLower",
];
export const RIGHT_AREAS: AreaId[] = [
  "rightUpper",
  "rightMiddle",
  "rightLower",
];

export const ALL_AREAS: AreaId[] = [...LEFT_AREAS, ...RIGHT_AREAS];

export const AREA_LABELS: Record<AreaId, string> = {
  leftUpper: "左上段",
  rightUpper: "右上段",
  leftMiddle: "左中段",
  rightMiddle: "右中段",
  leftLower: "左下段",
  rightLower: "右下段",
};

export function isLeftArea(area: AreaId): boolean {
  return LEFT_AREAS.includes(area);
}

/**
 * エリア内の外側詰め（flex の justify-content）
 * - 自陣: 左エリアは左端、右エリアは右端
 * - 相手陣: 左エリアは右端、右エリアは左端（自陣と同じ「外側詰め」になるよう反転）
 */
export function areaPackClass(
  area: AreaId,
  camp: "opponent" | "self",
): "pack-start" | "pack-end" {
  const left = isLeftArea(area);
  if (camp === "self") {
    return left ? "pack-start" : "pack-end";
  }
  return left ? "pack-end" : "pack-start";
}

export function emptyAreaMap<T>(): Record<AreaId, T[]> {
  return {
    leftUpper: [],
    rightUpper: [],
    leftMiddle: [],
    rightMiddle: [],
    leftLower: [],
    rightLower: [],
  };
}
