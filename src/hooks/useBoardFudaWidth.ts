import { useLayoutEffect, useRef, useState } from "react";
import { BOARD_ROW_UNITS } from "../lib/areas";

const MIN_FUDA_WIDTH = 20;

/** コンテナ幅から取り札1枚の幅を算出（13単位レイアウト） */
export function fudaWidthFromContainer(containerWidth: number): number {
  if (containerWidth <= 0) return MIN_FUDA_WIDTH;
  return Math.max(MIN_FUDA_WIDTH, Math.floor(containerWidth / BOARD_ROW_UNITS));
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
