import { useRegisterSW } from "virtual:pwa-register/react";
import { warmTorifudaCache } from "../lib/offlineImageCache";
import { isStandaloneDisplay } from "../lib/pwaInstallHint";
import { scheduleUpdateChecks } from "../lib/pwaRegistration";

/** ホーム画面追加ユーザー向け: 新バージョン検出時に短いバナーを表示 */
export function PwaUpdateBanner() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      void warmTorifudaCache();
      if (registration) {
        scheduleUpdateChecks(registration);
      }
    },
    onOfflineReady() {
      void warmTorifudaCache();
    },
  });

  if (!needRefresh || !isStandaloneDisplay()) {
    return null;
  }

  const applyUpdate = () => {
    void updateServiceWorker(true);
  };

  return (
    <button
      type="button"
      className="pwa-update-banner"
      onClick={applyUpdate}
    >
      更新がありました
    </button>
  );
}
