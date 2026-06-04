const STORAGE_KEY = "pwaInstallHintDismissed";

export function shouldShowPwaInstallHint(): boolean {
  if (typeof window === "undefined") return false;
  if (isStandaloneDisplay()) return false;
  try {
    return localStorage.getItem(STORAGE_KEY) !== "1";
  } catch {
    return false;
  }
}

export function dismissPwaInstallHint(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function isStandaloneDisplay(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export type PwaInstallPlatform = "ios" | "android" | "other";

export function detectPwaInstallPlatform(): PwaInstallPlatform {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return "android";
  if (
    /iPad|iPhone|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  ) {
    return "ios";
  }
  return "other";
}

export function pwaInstallInstructions(platform: PwaInstallPlatform): string {
  switch (platform) {
    case "ios":
      return "Safari の共有ボタン（□↑）から「ホーム画面に追加」を選ぶと、全画面表示でオフラインでも開けます。";
    case "android":
      return "ブラウザのメニュー（⋮）から「アプリをインストール」または「ホーム画面に追加」を選ぶと、全画面表示でオフラインでも開けます。";
    default:
      return "ブラウザのメニューから「アプリをインストール」や「ホーム画面に追加」があれば、全画面表示でオフラインでも使えます。";
  }
}
