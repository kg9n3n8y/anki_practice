import type { PracticeMode, PracticeSettings } from "../types";

export const DEFAULT_PRACTICE_SETTINGS: PracticeSettings = {
  mode: "opponent",
  cardCount: 25,
  memorizeMinutes: 5,
  usePosition: false,
  confirmOrder: "order",
  emptyCardCount: 15,
};

export function cardCountOptions(mode: PracticeMode): number[] {
  if (mode === "both") {
    return Array.from({ length: 5 }, (_, i) => (i + 1) * 10);
  }
  return Array.from({ length: 5 }, (_, i) => (i + 1) * 5);
}

export function emptyCardCountOptions(mode: PracticeMode): number[] {
  if (mode === "both") {
    return [0, ...Array.from({ length: 5 }, (_, i) => (i + 1) * 10)];
  }
  return [0, ...Array.from({ length: 5 }, (_, i) => (i + 1) * 5)];
}

export function defaultCardCountForMode(mode: PracticeMode): number {
  return mode === "both" ? 50 : 25;
}

export function defaultEmptyCardCountForMode(mode: PracticeMode): number {
  return mode === "both" ? 30 : 15;
}

export function campCounts(
  mode: PracticeMode,
  totalOrSingle: number,
): { opponent: number; self: number } {
  switch (mode) {
    case "opponent":
      return { opponent: totalOrSingle, self: 0 };
    case "self":
      return { opponent: 0, self: totalOrSingle };
    case "both":
      return {
        opponent: totalOrSingle / 2,
        self: totalOrSingle / 2,
      };
  }
}
