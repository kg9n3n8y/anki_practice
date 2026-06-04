/** 定位置編集画面用: 長い決まり字をコンパクト表示 */
export function formatTeigiKimariji(kimariji: string): string {
  const chars = [...kimariji];
  if (chars.length === 5) {
    return `${chars[0]}${chars[1]}・${chars[4]}`;
  }
  if (chars.length === 6) {
    return `${chars[0]}${chars[1]}・${chars[5]}`;
  }
  return kimariji;
}
