import type { AreaBoard, GeneratedBoard } from "../types/board";
import { ALL_AREAS } from "./areas";
import { poemImageSrc, uraImageSrc } from "./poemImage";

function preloadCamp(areas: AreaBoard, camp: "opponent" | "self"): void {
  for (const area of ALL_AREAS) {
    for (const card of areas[area]) {
      const img = new Image();
      img.src = poemImageSrc(card.poem, camp);
    }
  }
}

/** 裏向き札画像を先読みする（確認モード移行時のちらつき防止） */
export function preloadUraImage(): Promise<void> {
  const src = uraImageSrc();
  const img = new Image();
  img.src = src;
  if (img.complete && img.naturalWidth > 0) {
    return img.decode?.().catch(() => undefined) ?? Promise.resolve();
  }
  return new Promise((resolve) => {
    const finish = () => {
      void (img.decode?.().catch(() => undefined) ?? Promise.resolve()).then(
        () => resolve(),
      );
    };
    img.addEventListener("load", finish, { once: true });
    img.addEventListener("error", finish, { once: true });
  });
}

function waitForImageElement(img: HTMLImageElement): Promise<void> {
  const decode = async () => {
    if (img.decode) {
      try {
        await img.decode();
      } catch {
        // デコード失敗時も続行
      }
    }
  };
  if (img.complete && img.naturalWidth > 0) {
    return decode();
  }
  return new Promise((resolve) => {
    const finish = () => void decode().then(resolve);
    img.addEventListener("load", finish, { once: true });
    img.addEventListener("error", finish, { once: true });
  });
}

function isUraImageSrc(img: HTMLImageElement, uraHref: string): boolean {
  const src = img.currentSrc || img.src;
  if (!src) return false;
  try {
    return new URL(src, window.location.href).href === uraHref;
  } catch {
    return src.includes("tori_ura");
  }
}

/** 盤面上の裏向き img が描画可能になるまで待つ */
export async function waitForBoardUraImages(
  root: HTMLElement | null,
): Promise<void> {
  if (!root) return;
  const uraHref = new URL(uraImageSrc(), window.location.href).href;
  const cardCount = root.querySelectorAll(".board-card-btn").length;

  for (let attempt = 0; attempt < 30; attempt++) {
    const imgs = root.querySelectorAll<HTMLImageElement>(".board-card-btn img");
    const uraImgs = Array.from(imgs).filter((img) =>
      isUraImageSrc(img, uraHref),
    );
    if (uraImgs.length >= cardCount || cardCount === 0) {
      await Promise.all(uraImgs.map(waitForImageElement));
      break;
    }
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  }

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
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
