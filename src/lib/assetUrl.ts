/** public 配下の静的アセット URL（GitHub Pages の base path 対応） */
export function assetUrl(path: string): string {
  const normalized = path.replace(/^\//, "");
  const base = import.meta.env.BASE_URL;
  return `${base}${normalized}`;
}
