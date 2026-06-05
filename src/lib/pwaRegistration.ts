import { registerSW } from "virtual:pwa-register";

const UPDATE_INTERVAL_MS = 60 * 60 * 1000;

let refreshing = false;

function scheduleUpdateChecks(registration: ServiceWorkerRegistration): void {
  const check = () => {
    void registration.update();
  };

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      check();
    }
  });

  window.setInterval(check, UPDATE_INTERVAL_MS);
}

/**
 * Service Worker を登録し、新バージョン検出時に自動で反映する。
 * タブを開き直したとき・フォーカス復帰時にも更新を確認する。
 */
export function setupPwaRegistration(onCacheReady?: () => void): void {
  registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      onCacheReady?.();
      if (registration) {
        scheduleUpdateChecks(registration);
      }
    },
    onOfflineReady() {
      onCacheReady?.();
    },
  });

  navigator.serviceWorker?.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}
