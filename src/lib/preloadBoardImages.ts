import type { AreaBoard, GeneratedBoard } from "../types/board";
import { ALL_AREAS } from "./areas";
import { poemImageSrc } from "./poemImage";

function preloadCamp(areas: AreaBoard, camp: "opponent" | "self"): void {
  for (const area of ALL_AREAS) {
    for (const card of areas[area]) {
      const img = new Image();
      img.src = poemImageSrc(card.poem, camp);
    }
  }
}

/** 確認モードで表向きにしたときの画像を先読みする */
export function preloadBoardImages(board: GeneratedBoard): void {
  const { mode } = board.settings;
  if (mode === "opponent" || mode === "both") {
    preloadCamp(board.opponent, "opponent");
  }
  if (mode === "self" || mode === "both") {
    preloadCamp(board.self, "self");
  }
}
