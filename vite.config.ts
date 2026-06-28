import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { VitePWA } from "vite-plugin-pwa";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteSingleFile(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg", "apple-icon-180.png", "favicon-196.png"],
      manifest: {
        name: "Memory Ticket",
        short_name: "MemTicket",
        description: "Every Memory Deserves a Ticket — A cinematic, offline-first memory vault.",
        theme_color: "#09090f",
        background_color: "#09090f",
        display: "standalone",
        display_override: ["window-controls-overlay", "minimal-ui"],
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        id: "/",
        icons: [
          {
            src: "manifest-icon-192.maskable.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "manifest-icon-512.maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any monochrome",
          },
        ],
        categories: ["lifestyle", "photography", "utilities"],
        shortcuts: [
          {
            name: "New Memory",
            short_name: "Add",
            description: "Create a new memory ticket",
            url: "/?tab=add",
            icons: [{ src: "manifest-icon-192.maskable.png", sizes: "192x192" }],
          },
          {
            name: "Gallery",
            short_name: "Tickets",
            description: "Browse your ticket collection",
            url: "/?tab=gallery",
            icons: [{ src: "manifest-icon-192.maskable.png", sizes: "192x192" }],
          },
        ],
        screenshots: [],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,json}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/images\.pexels\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "pexels-images-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
