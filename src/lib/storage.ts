import type { PracticeResult, PracticeSettings, TeigiData } from "../types";

const KEYS = {
  teigi: "teigi",
  practiceSettings: "practiceSettings",
  results: "results",
} as const;

const MAX_RESULTS = 5;

export function loadTeigi(): TeigiData | null {
  try {
    const raw = localStorage.getItem(KEYS.teigi);
    if (!raw) return null;
    return JSON.parse(raw) as TeigiData;
  } catch {
    return null;
  }
}

export function saveTeigi(data: TeigiData): void {
  localStorage.setItem(KEYS.teigi, JSON.stringify(data));
}

export function hasTeigi(): boolean {
  return loadTeigi() !== null;
}

export function loadPracticeSettings(): PracticeSettings | null {
  try {
    const raw = localStorage.getItem(KEYS.practiceSettings);
    if (!raw) return null;
    return JSON.parse(raw) as PracticeSettings;
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
