import type { AreaId, Poem, PracticeSettings } from "./index";

export interface BoardCard {
  id: string;
  poem: Poem;
  faceUp: boolean;
}

export type AreaBoard = Record<AreaId, BoardCard[]>;

export interface GeneratedBoard {
  opponent: AreaBoard;
  self: AreaBoard;
  settings: PracticeSettings;
}

export type PracticePhase = "memorize" | "confirm" | "result";

export type FeedbackKind = "correct" | "incorrect" | "near" | null;
