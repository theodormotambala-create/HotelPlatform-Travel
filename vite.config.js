import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Config de deploiement : React + PWA installable + service worker hors-ligne
// STRUCTURE A PLAT : tous les fichiers (main.jsx, App.jsx, index.css, logo.svg,
// icones...) sont a la racine du depot, PAS dans des dossiers src/ ou public/.
export default defineConfig({
  base: "/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["logo.svg", "icon-192.png", "icon-512.png"],
      manifest: {
        name: "HotelPlatform Travel",
        short_name: "HotelPlatform",
        description:
          "Reservez hotels et restaurants, decouvrez, partagez et echangez.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#09090F",
        theme_color: "#FF6B00",
        lang: "fr",
        categories: ["travel", "lifestyle", "food"],
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png}"],
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
