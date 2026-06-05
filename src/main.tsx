import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { setupPwaRegistration } from "./lib/pwaRegistration";
import { warmTorifudaCache } from "./lib/offlineImageCache";
import "./index.css";

setupPwaRegistration(() => {
  void warmTorifudaCache();
});

const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
