import type { PracticeMode, PracticeSettings } from "../types";

export const DEFAULT_PRACTICE_SETTINGS: PracticeSettings = {
  mode: "both",
  cardCount: 50,
  memorizeMinutes: 15,
  useTeigi: false,
  confirmOrder: "order",
};

export function cardCountOptions(mode: PracticeMode): number[] {
  if (mode === "both") {
    return Array.from({ length: 5 }, (_, i) => (i + 1) * 10);
  }
  return Array.from({ length: 5 }, (_, i) => (i + 1) * 5);
}

export function defaultCardCountForMode(mode: PracticeMode): number {
  return mode === "both" ? 50 : 25;
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
