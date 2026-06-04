import { useMemo, useState } from "react";
import {
  detectPwaInstallPlatform,
  dismissPwaInstallHint,
  pwaInstallInstructions,
  shouldShowPwaInstallHint,
} from "../lib/pwaInstallHint";

export function PwaInstallHint() {
  const [open, setOpen] = useState(shouldShowPwaInstallHint);
  const platform = useMemo(() => detectPwaInstallPlatform(), []);

  if (!open) return null;

  const close = () => {
    dismissPwaInstallHint();
    setOpen(false);
  };

  return (
    <div className="modal-backdrop pwa-hint-backdrop" role="dialog" aria-modal="true">
      <div className="modal app-card pwa-hint-modal">
        <h2>ホーム画面に追加</h2>
        <p className="pwa-hint-lead">
          かるた暗記練をホーム画面に置くと、全画面表示でオフラインでも開けます。
        </p>
        <p className="pwa-hint-body">{pwaInstallInstructions(platform)}</p>
        <div className="app-nav">
          <button type="button" className="app-button" onClick={close}>
            了解
          </button>
        </div>
      </div>
    </div>
  );
}
