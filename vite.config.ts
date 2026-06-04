import react from "@vitejs/plugin-react";
import { copyFileSync } from "node:fs";
import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const base = env.VITE_BASE_PATH || "/";

  return {
    base,
    plugins: [
      react(),
      {
        name: "copy-404-for-github-pages",
        closeBundle() {
          copyFileSync("dist/index.html", "dist/404.html");
        },
      },
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["torifuda/tori_ura.png"],
        manifest: {
          name: "かるた暗記練",
          short_name: "暗記練",
          description: "競技かるたの配置暗記練習",
          theme_color: "#1a472a",
          background_color: "#f5f0e6",
          display: "standalone",
          start_url: base,
          scope: base,
          icons: [
            {
              src: "pwa-icon.svg",
              sizes: "any",
              type: "image/svg+xml",
              purpose: "any",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,svg,png,woff2}"],
          globIgnores: ["**/torifuda/**"],
          runtimeCaching: [
            {
              urlPattern: /\/torifuda\//,
              handler: "CacheFirst",
              options: {
                cacheName: "torifuda-images",
                expiration: {
                  maxEntries: 250,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
              },
            },
          ],
        },
      }),
    ],
    server: {
      port: 5173,
    },
  };
});
