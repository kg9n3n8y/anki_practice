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
        registerType: "prompt",
        injectRegister: null,
        includeAssets: [
          "pwa-icon-180.png",
          "pwa-icon-192.png",
          "pwa-icon-512.png",
          "thumbnail.png",
        ],
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
              src: "pwa-icon-192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "pwa-icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "pwa-icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          globPatterns: [
            "**/*.{js,css,ico,svg,png,jpg,jpeg,woff2,webmanifest}",
          ],
          /** HTML はプリキャッシュしない（オンライン時は常にネットワーク優先） */
          globIgnores: ["**/index.html", "**/404.html"],
          cleanupOutdatedCaches: true,
          navigateFallback: "index.html",
          navigateFallbackDenylist: [
            /\/torifuda\//,
            /\/assets\//,
            /\.(?:png|jpg|jpeg|webp|gif|svg|ico|woff2?)$/i,
          ],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.mode === "navigate",
              handler: "NetworkFirst",
              options: {
                cacheName: "html-document",
                expiration: {
                  maxEntries: 2,
                  maxAgeSeconds: 60 * 60 * 24,
                },
                networkTimeoutSeconds: 5,
              },
            },
            {
              urlPattern: ({ url }) => url.pathname.includes("/torifuda/"),
              handler: "CacheFirst",
              options: {
                cacheName: "torifuda-images",
                expiration: {
                  maxEntries: 250,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
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
