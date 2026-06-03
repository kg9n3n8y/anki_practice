import { FUDA_INTRINSIC_HEIGHT, FUDA_INTRINSIC_WIDTH } from "../lib/fudaSize";

type FudaImageProps = {
  src: string;
  alt: string;
  /** 画面上の表示幅（px）。高さは 400:560 の比率で自動 */
  displayWidth?: number;
  className?: string;
};

export function FudaImage({
  src,
  alt,
  displayWidth = 48,
  className,
}: FudaImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={className ? `fuda-img ${className}` : "fuda-img"}
      width={FUDA_INTRINSIC_WIDTH}
      height={FUDA_INTRINSIC_HEIGHT}
      style={{ width: displayWidth }}
      decoding="async"
    />
  );
}
