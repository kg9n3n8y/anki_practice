import type { AreaId, Poem, PositionData, PositionDataV1 } from "../types";
import { ALL_AREAS } from "./areas";

export type PositionAreaState = Record<AreaId, number[]>;

export function emptyPositionState(): PositionAreaState {
  return {
    leftUpper: [],
    rightUpper: [],
    leftMiddle: [],
    rightMiddle: [],
    leftLower: [],
    rightLower: [],
  };
}

export function poemOrderMap(poems: Poem[]): Map<number, number> {
  return new Map(poems.map((p) => [p.no, p.order]));
}

export function stateFromPosition(
  position: PositionData | PositionDataV1 | null,
  poemOrder: Map<number, number>,
): PositionAreaState {
  if (!position) return emptyPositionState();

  if (position.version === 2) {
    const state = emptyPositionState();
    const seen = new Set<number>();
    for (const area of ALL_AREAS) {
      for (const no of position.areas[area] ?? []) {
        if (seen.has(no)) continue;
        seen.add(no);
        state[area].push(no);
      }
    }
    return state;
  }

  const state = emptyPositionState();
  const seen = new Set<number>();
  for (const p of position.placements) {
    if (seen.has(p.no)) continue;
    seen.add(p.no);
    state[p.area].push(p.no);
  }
  for (const area of ALL_AREAS) {
    state[area].sort(
      (a, b) => (poemOrder.get(a) ?? a) - (poemOrder.get(b) ?? b),
    );
  }
  return state;
}

export function positionFromState(state: PositionAreaState): PositionData {
  const areas = emptyPositionState();
  for (const area of ALL_AREAS) {
    areas[area] = [...state[area]];
  }
  return {
    version: 2,
    updatedAt: new Date().toISOString(),
    areas,
  };
}

export function poolNos(state: PositionAreaState, allNos: number[]): number[] {
  const assigned = new Set<number>();
  for (const area of ALL_AREAS) {
    for (const no of state[area]) assigned.add(no);
  }
  return allNos.filter((no) => !assigned.has(no));
}

export function clonePositionState(state: PositionAreaState): PositionAreaState {
  return Object.fromEntries(
    ALL_AREAS.map((a) => [a, [...state[a]]]),
  ) as PositionAreaState;
}
