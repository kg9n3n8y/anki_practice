import type { Poem, PracticeMode } from "../types";
import { assetUrl } from "./assetUrl";

export function poemImageSrc(poem: Poem, side: "self" | "opponent"): string {
  const path = side === "self" ? poem.normal : poem.reverse;
  return assetUrl(path);
}

export function uraImageSrc(): string {
  return assetUrl("torifuda/tori_ura.png");
}

export function modeLabel(mode: PracticeMode): string {
  switch (mode) {
    case "opponent":
      return "相手陣のみ";
    case "self":
      return "自陣のみ";
    case "both":
      return "両方";
  }
}
