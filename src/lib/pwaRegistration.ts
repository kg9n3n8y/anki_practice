const UPDATE_INTERVAL_MS = 60 * 60 * 1000;

/** タブ復帰時・定期で Service Worker の更新を確認する */
export function scheduleUpdateChecks(
  registration: ServiceWorkerRegistration,
): void {
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
