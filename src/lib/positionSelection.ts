import type { AreaId, Poem, PositionData } from "../types";
import { ALL_AREAS, MAX_CARDS_PER_AREA } from "./areas";
import { poemOrderMap, poolNos, stateFromPosition } from "./positionState";
import { shuffle } from "./shuffle";

/** 各エリアから選べる最大枚数（定位置登録数と7枚上限の小さい方） */
export function positionAreaCaps(
  allPoems: Poem[],
  position: PositionData,
): Record<AreaId, number> {
  const state = stateFromPosition(position, poemOrderMap(allPoems));
  const poemNos = new Set(allPoems.map((p) => p.no));
  return Object.fromEntries(
    ALL_AREAS.map((area) => {
      const registered = state[area].filter((no) => poemNos.has(no)).length;
      return [area, Math.min(MAX_CARDS_PER_AREA, registered)];
    }),
  ) as Record<AreaId, number>;
}

/**
 * エリア上限 caps の下で、合計 count 枚になるよう各エリアの選出枚数を決める
 */
export function computeAreaPickTargets(
  count: number,
  caps: Record<AreaId, number>,
): Record<AreaId, number> {
  const targets = Object.fromEntries(
    ALL_AREAS.map((a) => [a, 0]),
  ) as Record<AreaId, number>;

  if (count <= 0) return targets;

  const eligible = ALL_AREAS.filter((a) => caps[a] > 0);
  const totalCap = eligible.reduce((s, a) => s + caps[a], 0);
  if (totalCap <= 0) return targets;

  const pickTotal = Math.min(count, totalCap);

  if (pickTotal < eligible.length) {
    for (const area of shuffle(eligible).slice(0, pickTotal)) {
      targets[area] = 1;
    }
    return targets;
  }

  for (const area of eligible) {
    targets[area] = 1;
  }
  let remaining = pickTotal - eligible.length;

  while (remaining > 0) {
    const candidates = eligible.filter((a) => targets[a] < caps[a]);
    if (candidates.length === 0) break;

    if (Math.random() < 0.4) {
      const area =
        candidates[Math.floor(Math.random() * candidates.length)];
      targets[area] += 1;
    } else {
      const weights = candidates.map((a) => caps[a] - targets[a]);
      const total = weights.reduce((s, w) => s + w, 0);
      let r = Math.random() * total;
      let area = candidates[candidates.length - 1];
      for (let i = 0; i < candidates.length; i++) {
        r -= weights[i];
        if (r <= 0) {
          area = candidates[i];
          break;
        }
      }
      targets[area] += 1;
    }
    remaining -= 1;
  }

  return targets;
}

/**
 * 定位置 ON 時の自陣選出。
 * 各エリアから最大7枚まで選び、定位置通りに配置可能なセットを作る。
 */
export function pickSelfPoemsWithPosition(
  allPoems: Poem[],
  count: number,
  position: PositionData,
): Poem[] {
  if (count <= 0) return [];

  const poemByNo = new Map(allPoems.map((p) => [p.no, p]));
  const state = stateFromPosition(position, poemOrderMap(allPoems));
  const caps = positionAreaCaps(allPoems, position);
  const targets = computeAreaPickTargets(count, caps);

  const selected: Poem[] = [];
  const pickedNos = new Set<number>();

  for (const area of ALL_AREAS) {
    const need = targets[area];
    if (need <= 0) continue;
    const pool = state[area]
      .map((no) => poemByNo.get(no))
      .filter((p): p is Poem => p !== undefined);
    for (const poem of shuffle(pool).slice(0, need)) {
      selected.push(poem);
      pickedNos.add(poem.no);
    }
  }

  let remaining = count - selected.length;
  if (remaining > 0) {
    const unassigned = poolNos(state, allPoems.map((p) => p.no))
      .map((no) => poemByNo.get(no))
      .filter((p): p is Poem => p !== undefined && !pickedNos.has(p.no));
    for (const poem of shuffle(unassigned).slice(0, remaining)) {
      selected.push(poem);
      pickedNos.add(poem.no);
    }
  }

  return selected;
}
