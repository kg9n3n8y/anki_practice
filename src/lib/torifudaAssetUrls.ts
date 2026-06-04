import { fudalist } from "../data/fudalist";
import { assetUrl } from "./assetUrl";

/** 取り札・裏札の静的画像 URL（base path 付き） */
export function allTorifudaAssetUrls(): string[] {
  const paths = new Set<string>(["torifuda/tori_ura.png"]);
  for (const poem of fudalist) {
    paths.add(poem.normal);
    paths.add(poem.reverse);
  }
  return [...paths].map(assetUrl);
}
