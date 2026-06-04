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

/** v1 形式（インポート時のみ。保存は v2） */
export interface TeigiDataV1 {
  version: 1;
  updatedAt: string;
  placements: TeigiPlacement[];
}

/** 各エリアの歌番号を並び順どおりに保持 */
export interface TeigiData {
  version: 2;
  updatedAt: string;
  areas: Record<AreaId, number[]>;
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
