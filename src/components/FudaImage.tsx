import { FUDA_INTRINSIC_HEIGHT, FUDA_INTRINSIC_WIDTH } from "../lib/fudaSize";

type FudaImageProps = {
  src: string;
  alt: string;
  /** 盤面以外での表示幅（px） */
  displayWidth?: number;
  /** true のとき CSS 変数 --fuda-w で幅を決める（盤面用） */
  boardSized?: boolean;
  className?: string;
};

export function FudaImage({
  src,
  alt,
  displayWidth = 48,
  boardSized = false,
  className,
}: FudaImageProps) {
  const classes = [
    "fuda-img",
    boardSized ? "fuda-img--board" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <img
      src={src}
      alt={alt}
      className={classes}
      width={FUDA_INTRINSIC_WIDTH}
      height={FUDA_INTRINSIC_HEIGHT}
      style={boardSized ? undefined : { width: displayWidth }}
      decoding="async"
    />
  );
}
