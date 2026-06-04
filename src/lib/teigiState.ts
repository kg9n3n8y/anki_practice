import type { AreaId, Poem, TeigiData, TeigiDataV1 } from "../types";
import { ALL_AREAS } from "./areas";

export type TeigiAreaState = Record<AreaId, number[]>;

export function emptyTeigiState(): TeigiAreaState {
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

export function stateFromTeigi(
  teigi: TeigiData | TeigiDataV1 | null,
  poemOrder: Map<number, number>,
): TeigiAreaState {
  if (!teigi) return emptyTeigiState();

  if (teigi.version === 2) {
    const state = emptyTeigiState();
    const seen = new Set<number>();
    for (const area of ALL_AREAS) {
      for (const no of teigi.areas[area] ?? []) {
        if (seen.has(no)) continue;
        seen.add(no);
        state[area].push(no);
      }
    }
    return state;
  }

  const state = emptyTeigiState();
  const seen = new Set<number>();
  for (const p of teigi.placements) {
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

export function teigiFromState(state: TeigiAreaState): TeigiData {
  const areas = emptyTeigiState();
  for (const area of ALL_AREAS) {
    areas[area] = [...state[area]];
  }
  return {
    version: 2,
    updatedAt: new Date().toISOString(),
    areas,
  };
}

export function poolNos(state: TeigiAreaState, allNos: number[]): number[] {
  const assigned = new Set<number>();
  for (const area of ALL_AREAS) {
    for (const no of state[area]) assigned.add(no);
  }
  return allNos.filter((no) => !assigned.has(no));
}

export function cloneTeigiState(state: TeigiAreaState): TeigiAreaState {
  return Object.fromEntries(
    ALL_AREAS.map((a) => [a, [...state[a]]]),
  ) as TeigiAreaState;
}
