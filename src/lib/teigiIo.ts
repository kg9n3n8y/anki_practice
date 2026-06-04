import type { AreaId, Poem, TeigiData, TeigiDataV1 } from "../types";
import { ALL_AREAS } from "./areas";
import { emptyTeigiState, poemOrderMap, stateFromTeigi, teigiFromState } from "./teigiState";

export function createEmptyTeigi(): TeigiData {
  return teigiFromState(emptyTeigiState());
}

function validatePoemNo(no: unknown): number {
  if (typeof no !== "number" || no < 1 || no > 100) {
    throw new Error(`歌番号が不正です: ${no}`);
  }
  return no;
}

function validateArea(area: unknown): AreaId {
  if (typeof area !== "string" || !ALL_AREAS.includes(area as AreaId)) {
    throw new Error(`エリアが不正です: ${area}`);
  }
  return area as AreaId;
}

function parseV1(data: TeigiDataV1, poems: Poem[]): TeigiData {
  const seen = new Set<number>();
  const placements: TeigiDataV1["placements"] = [];
  for (const p of data.placements) {
    const no = validatePoemNo(p.no);
    const area = validateArea(p.area);
    if (seen.has(no)) continue;
    seen.add(no);
    placements.push({ no, area });
  }
  return stateFromTeigiToData(
    {
      version: 1,
      updatedAt: data.updatedAt ?? new Date().toISOString(),
      placements,
    },
    poems,
  );
}

function stateFromTeigiToData(
  raw: TeigiDataV1,
  poems: Poem[],
): TeigiData {
  const order = poemOrderMap(poems);
  return teigiFromState(stateFromTeigi(raw, order));
}

function parseV2(data: TeigiData, poems: Poem[]): TeigiData {
  if (!data.areas || typeof data.areas !== "object") {
    throw new Error("areas が不正です");
  }
  const state = emptyTeigiState();
  const seen = new Set<number>();
  for (const area of ALL_AREAS) {
    const rawList = data.areas[area];
    if (!Array.isArray(rawList)) continue;
    for (const item of rawList) {
      const no = validatePoemNo(item);
      if (seen.has(no)) continue;
      seen.add(no);
      state[area].push(no);
    }
  }
  const order = poemOrderMap(poems);
  for (const area of ALL_AREAS) {
    state[area] = state[area].filter((no) => order.has(no));
  }
  return teigiFromState(state);
}

export function parseTeigiJson(raw: string, poems: Poem[]): TeigiData {
  const data = JSON.parse(raw) as TeigiData | TeigiDataV1;
  if (data.version === 2) {
    return parseV2(data as TeigiData, poems);
  }
  if (data.version === 1) {
    return parseV1(data as TeigiDataV1, poems);
  }
  throw new Error("未対応のバージョンです");
}

export function normalizeTeigi(
  raw: unknown,
  poems: Poem[],
): TeigiData | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as { version?: number };
  try {
    if (data.version === 2) {
      return parseV2(raw as TeigiData, poems);
    }
    if (data.version === 1) {
      return parseV1(raw as TeigiDataV1, poems);
    }
  } catch {
    return null;
  }
  return null;
}

export function downloadTeigiJson(teigi: TeigiData): void {
  const blob = new Blob([JSON.stringify(teigi, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `teigi-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
