export type AreaId =
  | "leftUpper"
  | "rightUpper"
  | "leftMiddle"
  | "rightMiddle"
  | "leftLower"
  | "rightLower";

export type PracticeMode = "opponent" | "self" | "both";

export type ConfirmOrder = "order" | "random";

export interface Poem {
  no: number;
  kimariji: string;
  normal: string;
  reverse: string;
  order: number;
}

export interface TeigiPlacement {
  no: number;
  area: AreaId;
}

export interface TeigiData {
  version: 1;
  updatedAt: string;
  placements: TeigiPlacement[];
}

export interface PracticeSettings {
  mode: PracticeMode;
  cardCount: number;
  memorizeMinutes: number;
  useTeigi: boolean;
  confirmOrder: ConfirmOrder;
}

export interface PracticeResult {
  at: string;
  mode: PracticeMode;
  cardCount: number;
  memorizeMinutes: number;
  questionCount: number;
  correctCount: number;
  confirmSeconds: number;
}
