import { fudalist } from "../data/fudalist";
import type {
  PracticeResult,
  PracticeSettings,
  PositionData,
} from "../types";
import { defaultEmptyCardCountForMode } from "./practiceDefaults";
import { normalizePosition } from "./positionIo";

const KEYS = {
  position: "position",
  positionLegacy: "teigi",
  practiceSettings: "practiceSettings",
  results: "results",
} as const;

const MAX_RESULTS = 5;

export function loadPosition(): PositionData | null {
  try {
    let raw = localStorage.getItem(KEYS.position);
    if (!raw) {
      raw = localStorage.getItem(KEYS.positionLegacy);
      if (raw) {
        const migrated = normalizePosition(JSON.parse(raw), fudalist);
        if (migrated) {
          savePosition(migrated);
          localStorage.removeItem(KEYS.positionLegacy);
        }
        return migrated;
      }
      return null;
    }
    return normalizePosition(JSON.parse(raw), fudalist);
  } catch {
    return null;
  }
}

export function savePosition(data: PositionData): void {
  localStorage.setItem(KEYS.position, JSON.stringify(data));
}

export function hasPosition(): boolean {
  return loadPosition() !== null;
}

function normalizePracticeSettings(raw: PracticeSettings): PracticeSettings {
  const legacy = raw as PracticeSettings & { useTeigi?: boolean };
  let next = { ...raw };
  if (legacy.usePosition === undefined && legacy.useTeigi !== undefined) {
    next = { ...next, usePosition: legacy.useTeigi };
  }
  if (next.emptyCardCount === undefined) {
    next = {
      ...next,
      emptyCardCount: defaultEmptyCardCountForMode(next.mode),
    };
  }
  return next;
}

export function loadPracticeSettings(): PracticeSettings | null {
  try {
    const raw = localStorage.getItem(KEYS.practiceSettings);
    if (!raw) return null;
    return normalizePracticeSettings(JSON.parse(raw) as PracticeSettings);
  } catch {
    return null;
  }
}

export function savePracticeSettings(settings: PracticeSettings): void {
  localStorage.setItem(KEYS.practiceSettings, JSON.stringify(settings));
}

export function loadResults(): PracticeResult[] {
  try {
    const raw = localStorage.getItem(KEYS.results);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PracticeResult[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendResult(result: PracticeResult): void {
  const next = [result, ...loadResults()].slice(0, MAX_RESULTS);
  localStorage.setItem(KEYS.results, JSON.stringify(next));
}
