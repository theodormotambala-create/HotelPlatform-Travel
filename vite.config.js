import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Config de deploiement : React + PWA installable + service worker hors-ligne
export default defineConfig({
  base: "./",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["logo.svg", "icons/icon-192.png", "icons/icon-512.png"],
      manifest: {
        name: "HotelPlatform Travel",
        short_name: "HotelPlatform",
        description:
          "Reservez hotels et restaurants, decouvrez, partagez et echangez.",
        start_url: "./index.html",
        scope: "./",
        display: "standalone",
        orientation: "portrait",
        background_color: "#09090F",
        theme_color: "#FF6B00",
        lang: "fr",
        categories: ["travel", "lifestyle", "food"],
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      },
      workbox: {
        // Met en cache l'app pour un chargement instantane + mode hors-ligne
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true
      }
    })
  ],
  build: {
    outDir: "dist",
    sourcemap: false,
    target: "es2018"
  }
});
