import type { AreaBoard, BoardCard, GeneratedBoard } from "../types/board";
import type { AreaId, Poem, PracticeSettings, PositionData } from "../types";
import {
  ALL_AREAS,
  LEFT_AREAS,
  MAX_CARDS_PER_AREA,
  RIGHT_AREAS,
  emptyAreaMap,
} from "./areas";
import { campCounts } from "./practiceDefaults";
import { shuffle } from "./shuffle";
import { emptyPositionState, poemOrderMap, stateFromPosition } from "./positionState";

let cardSeq = 0;
function newCardId(): string {
  cardSeq += 1;
  return `card-${cardSeq}`;
}

function leftTotal(targets: Record<AreaId, number>): number {
  return LEFT_AREAS.reduce((s, a) => s + targets[a], 0);
}

function rightTotal(targets: Record<AreaId, number>): number {
  return RIGHT_AREAS.reduce((s, a) => s + targets[a], 0);
}

/** 左右の合計差が大きすぎないよう1枚だけ移す（任意） */
function softenLeftRightImbalance(
  targets: Record<AreaId, number>,
  maxDiff = 5,
): void {
  for (let i = 0; i < 12; i++) {
    const lt = leftTotal(targets);
    const rt = rightTotal(targets);
    if (Math.abs(lt - rt) <= maxDiff) return;

    if (lt > rt) {
      const from = shuffle(LEFT_AREAS).find((a) => targets[a] > 1);
      const to = shuffle(RIGHT_AREAS).find(
        (a) => targets[a] < MAX_CARDS_PER_AREA,
      );
      if (from && to) {
        targets[from] -= 1;
        targets[to] += 1;
      }
    } else {
      const from = shuffle(RIGHT_AREAS).find((a) => targets[a] > 1);
      const to = shuffle(LEFT_AREAS).find(
        (a) => targets[a] < MAX_CARDS_PER_AREA,
      );
      if (from && to) {
        targets[from] -= 1;
        targets[to] += 1;
      }
    }
  }
}

const AREA_COUNT = ALL_AREAS.length;

/**
 * 各エリアの目標枚数（合計 count、各エリア最大7）
 * count >= 6エリア分 のときは全エリアに最低1枚を置き、残りをばらつきありで配分
 */
function computeAreaTargets(count: number): Record<AreaId, number> {
  const targets = Object.fromEntries(
    ALL_AREAS.map((a) => [a, 0]),
  ) as Record<AreaId, number>;

  if (count <= 0) return targets;

  if (count < AREA_COUNT) {
    for (const area of shuffle(ALL_AREAS).slice(0, count)) {
      targets[area] = 1;
    }
    return targets;
  }

  for (const area of ALL_AREAS) {
    targets[area] = 1;
  }
  let remaining = count - AREA_COUNT;
  const order = shuffle(ALL_AREAS);

  for (let i = 0; i < order.length && remaining > 0; i++) {
    const area = order[i];
    const slotsAfter = order.length - 1 - i;
    const maxExtra = Math.min(MAX_CARDS_PER_AREA - 1, remaining);
    const minExtra = Math.max(
      0,
      remaining - slotsAfter * (MAX_CARDS_PER_AREA - 1),
    );

    if (maxExtra <= minExtra) {
      targets[area] += maxExtra;
      remaining -= maxExtra;
      continue;
    }

    const span = maxExtra - minExtra;
    const r = Math.random();
    let extra: number;
    if (r < 0.3) {
      extra = minExtra;
    } else if (r < 0.6) {
      extra = maxExtra;
    } else {
      extra = minExtra + Math.floor(Math.random() * (span + 1));
    }

    targets[area] += extra;
    remaining -= extra;
  }

  while (remaining > 0) {
    const candidates = ALL_AREAS.filter((a) => targets[a] < MAX_CARDS_PER_AREA);
    if (candidates.length === 0) break;
    const area = candidates[Math.floor(Math.random() * candidates.length)];
    targets[area] += 1;
    remaining -= 1;
  }

  softenLeftRightImbalance(targets);
  return targets;
}

/** 余裕があるエリアの中からランダムに選ぶ（偏りすぎないよう headroom に比例） */
function pickAreaForCard(
  candidates: AreaId[],
  remaining: Map<AreaId, number>,
): AreaId {
  if (candidates.length === 1) return candidates[0];

  if (Math.random() < 0.4) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  const weights = candidates.map((a) => {
    const headroom = remaining.get(a) ?? 0;
    return headroom * (0.6 + Math.random() * 0.8);
  });
  const total = weights.reduce((s, w) => s + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < candidates.length; i++) {
    r -= weights[i];
    if (r <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

function positionAreaState(
  position: PositionData | null,
  poems: Poem[],
): ReturnType<typeof stateFromPosition> {
  if (!position) return emptyPositionState();
  return stateFromPosition(position, poemOrderMap(poems));
}

function remainingHeadroom(board: AreaBoard): Map<AreaId, number> {
  const remaining = new Map<AreaId, number>();
  for (const a of ALL_AREAS) {
    remaining.set(a, Math.max(0, MAX_CARDS_PER_AREA - board[a].length));
  }
  return remaining;
}

function pushCardToArea(
  board: AreaBoard,
  area: AreaId,
  poem: Poem,
): boolean {
  if (board[area].length >= MAX_CARDS_PER_AREA) return false;
  board[area].push({ id: newCardId(), poem, faceUp: true });
  return true;
}

/** 定位置 ON：選出札のうち登録があるものを必ずそのエリアへ（空エリア可）。残りは空きスロットへランダム */
function placeCampWithPosition(
  poems: Poem[],
  position: PositionData,
): AreaBoard {
  const board = emptyAreaMap<BoardCard>();
  const poemByNo = new Map(poems.map((p) => [p.no, p]));
  const placed = new Set<number>();
  const positionState = positionAreaState(position, poems);

  for (const area of ALL_AREAS) {
    for (const no of positionState[area]) {
      const poem = poemByNo.get(no);
      if (!poem) continue;
      if (pushCardToArea(board, area, poem)) {
        placed.add(no);
      }
    }
  }

  const unassigned = poems.filter((p) => !placed.has(p.no));
  const shuffled = shuffle(unassigned);
  for (const poem of shuffled) {
    const headroom = remainingHeadroom(board);
    const candidates = ALL_AREAS.filter((a) => (headroom.get(a) ?? 0) > 0);
    if (candidates.length === 0) break;
    const area = pickAreaForCard(candidates, headroom);
    pushCardToArea(board, area, poem);
  }

  return board;
}

function placeCampRandom(poems: Poem[]): AreaBoard {
  const board = emptyAreaMap<BoardCard>();
  const targets = computeAreaTargets(poems.length);
  const remaining = new Map<AreaId, number>();
  for (const a of ALL_AREAS) {
    remaining.set(a, targets[a]);
  }

  const shuffled = shuffle(poems);
  for (const poem of shuffled) {
    const candidates = ALL_AREAS.filter((a) => (remaining.get(a) ?? 0) > 0);
    if (candidates.length === 0) break;
    const area = pickAreaForCard(candidates, remaining);
    if (!pushCardToArea(board, area, poem)) continue;
    remaining.set(area, (remaining.get(area) ?? 0) - 1);
  }

  return board;
}

function placeCamp(
  poems: Poem[],
  position: PositionData | null,
  usePosition: boolean,
): AreaBoard {
  if (usePosition && position) {
    return placeCampWithPosition(poems, position);
  }
  return placeCampRandom(poems);
}

function pickRandomPoems(all: Poem[], count: number): Poem[] {
  return shuffle(all).slice(0, count);
}

export function generateBoard(
  allPoems: Poem[],
  settings: PracticeSettings,
  position: PositionData | null,
): GeneratedBoard {
  cardSeq = 0;
  const { opponent: oppCount, self: selfCount } = campCounts(
    settings.mode,
    settings.cardCount,
  );

  const selected = pickRandomPoems(allPoems, oppCount + selfCount);
  const opponentPoems = selected.slice(0, oppCount);
  const selfPoems = selected.slice(oppCount);

  return {
    opponent: placeCamp(opponentPoems, position, false),
    self: placeCamp(selfPoems, position, settings.usePosition),
    settings,
  };
}

export function allBoardCards(board: GeneratedBoard): BoardCard[] {
  const cards: BoardCard[] = [];
  for (const a of ALL_AREAS) {
    cards.push(...board.opponent[a], ...board.self[a]);
  }
  return cards;
}

export function countFaceUp(board: GeneratedBoard): number {
  return allBoardCards(board).filter((c) => c.faceUp).length;
}

export function countOnBoard(board: GeneratedBoard): number {
  return allBoardCards(board).length;
}

export function findCardOnBoard(
  board: GeneratedBoard,
  poemNo: number,
): BoardCard | null {
  for (const card of allBoardCards(board)) {
    if (card.poem.no === poemNo) return card;
  }
  return null;
}

export function setAllFaceDown(board: GeneratedBoard): GeneratedBoard {
  const flip = (areas: AreaBoard): AreaBoard => {
    const next = emptyAreaMap<BoardCard>();
    for (const a of ALL_AREAS) {
      next[a] = areas[a].map((c) => ({ ...c, faceUp: false }));
    }
    return next;
  };
  return {
    ...board,
    opponent: flip(board.opponent),
    self: flip(board.self),
  };
}

export function cloneBoard(board: GeneratedBoard): GeneratedBoard {
  const cloneAreas = (areas: AreaBoard): AreaBoard => {
    const next = emptyAreaMap<BoardCard>();
    for (const a of ALL_AREAS) {
      next[a] = areas[a].map((c) => ({ ...c }));
    }
    return next;
  };
  return {
    settings: board.settings,
    opponent: cloneAreas(board.opponent),
    self: cloneAreas(board.self),
  };
}
