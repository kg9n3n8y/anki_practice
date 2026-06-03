import type { AreaId, TeigiData } from "../types";
import { ALL_AREAS } from "./areas";

export function createEmptyTeigi(): TeigiData {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    placements: [],
  };
}

export function parseTeigiJson(raw: string): TeigiData {
  const data = JSON.parse(raw) as TeigiData;
  if (data.version !== 1) {
    throw new Error("未対応のバージョンです");
  }
  if (!Array.isArray(data.placements)) {
    throw new Error("placements が不正です");
  }
  const seen = new Set<number>();
  const placements: TeigiData["placements"] = [];
  for (const p of data.placements) {
    if (typeof p.no !== "number" || p.no < 1 || p.no > 100) {
      throw new Error(`歌番号が不正です: ${p.no}`);
    }
    if (!ALL_AREAS.includes(p.area as AreaId)) {
      throw new Error(`エリアが不正です: ${p.area}`);
    }
    if (seen.has(p.no)) continue;
    seen.add(p.no);
    placements.push({ no: p.no, area: p.area as AreaId });
  }
  return {
    version: 1,
    updatedAt: data.updatedAt ?? new Date().toISOString(),
    placements,
  };
}

export function teigiToMap(
  teigi: TeigiData,
): Map<number, import("../types").AreaId> {
  return new Map(teigi.placements.map((p) => [p.no, p.area]));
}

export function mapToTeigi(
  map: Map<number, import("../types").AreaId>,
): TeigiData {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    placements: [...map.entries()]
      .map(([no, area]) => ({ no, area }))
      .sort((a, b) => a.no - b.no),
  };
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
