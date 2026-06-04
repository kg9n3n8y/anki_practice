import { useLayoutEffect, useRef, useState } from "react";
import { BOARD_ROW_UNITS } from "../lib/areas";

const MIN_FUDA_WIDTH = 20;

/** 1画面に収めるため、算出幅をわずかに縮小（縦横ともに約5%） */
const BOARD_DISPLAY_SCALE = 0.95;

/** コンテナ幅から取り札1枚の幅を算出（BOARD_ROW_UNITS 単位レイアウト） */
export function fudaWidthFromContainer(containerWidth: number): number {
  if (containerWidth <= 0) return MIN_FUDA_WIDTH;
  const fitted = Math.floor(containerWidth / BOARD_ROW_UNITS);
  return Math.max(MIN_FUDA_WIDTH, Math.floor(fitted * BOARD_DISPLAY_SCALE));
}

/** 盤面コンテナの実幅に合わせて --fuda-w を決める */
export function useBoardFudaWidth() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fudaWidth, setFudaWidth] = useState(MIN_FUDA_WIDTH);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      setFudaWidth(fudaWidthFromContainer(el.clientWidth));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { containerRef, fudaWidth };
}
