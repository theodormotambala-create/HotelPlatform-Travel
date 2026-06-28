import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "logo.svg",
        "icons/*.png",
        ".well-known/assetlinks.json"
      ],
      manifest: {
        // Identifiant unique de l'application
        id: "com.hotelplatform.travel",
        name: "HotelPlatform Travel",
        short_name: "HotelPlatform",
        description: "Reservez hotels et restaurants, decouvrez, partagez et echangez avec la communaute voyageurs.",
        start_url: "./index.html",
        scope: "./",

        // Affichage natif (barre status et navigation cachées — comme une appli native)
        display: "standalone",
        display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
        orientation: "portrait",

        // Couleurs
        background_color: "#09090F",
        theme_color: "#FF6B00",

        // Langue et catégories stores
        lang: "fr",
        dir: "ltr",
        categories: ["travel", "lifestyle", "food"],

        // Classification de contenu (IARC — requise par Google Play)
        iarc_rating_id: "e84b072d-71b3-4d3e-86ae-31a8ce4e53b7",

        // Comportement de lancement
        launch_handler: { client_mode: "navigate-existing" },

        // Préférer l'app web (ne pas proposer l'app native alternative)
        prefer_related_applications: false,

        // Raccourcis (actions rapides sur l'écran d'accueil)
        shortcuts: [
          {
            name: "Rechercher un hôtel",
            short_name: "Hôtels",
            description: "Trouver et réserver un hôtel",
            url: "./index.html?action=search&type=hotel",
            icons: [{ src: "icons/icon-96.png", sizes: "96x96", type: "image/png" }]
          },
          {
            name: "Rechercher un restaurant",
            short_name: "Restaurants",
            description: "Trouver et réserver un restaurant",
            url: "./index.html?action=search&type=restaurant",
            icons: [{ src: "icons/icon-96.png", sizes: "96x96", type: "image/png" }]
          },
          {
            name: "Mes réservations",
            short_name: "Réservations",
            description: "Voir mes réservations en cours",
            url: "./index.html?action=reservations",
            icons: [{ src: "icons/icon-96.png", sizes: "96x96", type: "image/png" }]
          }
        ],

        // Captures d'écran pour les stores (Google Play + App Store)
        screenshots: [
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            form_factor: "narrow",
            label: "HotelPlatform Travel — Accueil"
          }
        ],

        // Icônes — toutes les tailles pour App Store + Google Play + PWA
        icons: [
          { src: "icons/icon-48.png",           sizes: "48x48",     type: "image/png", purpose: "any" },
          { src: "icons/icon-72.png",            sizes: "72x72",     type: "image/png", purpose: "any" },
          { src: "icons/icon-96.png",            sizes: "96x96",     type: "image/png", purpose: "any" },
          { src: "icons/icon-120.png",           sizes: "120x120",   type: "image/png", purpose: "any" },
          { src: "icons/icon-128.png",           sizes: "128x128",   type: "image/png", purpose: "any" },
          { src: "icons/icon-144.png",           sizes: "144x144",   type: "image/png", purpose: "any" },
          { src: "icons/icon-152.png",           sizes: "152x152",   type: "image/png", purpose: "any" },
          { src: "icons/icon-167.png",           sizes: "167x167",   type: "image/png", purpose: "any" },
          { src: "icons/icon-180.png",           sizes: "180x180",   type: "image/png", purpose: "any" },
          { src: "icons/icon-192.png",           sizes: "192x192",   type: "image/png", purpose: "any" },
          { src: "icons/icon-256.png",           sizes: "256x256",   type: "image/png", purpose: "any" },
          { src: "icons/icon-384.png",           sizes: "384x384",   type: "image/png", purpose: "any" },
          { src: "icons/icon-512.png",           sizes: "512x512",   type: "image/png", purpose: "any" },
          { src: "icons/icon-1024.png",          sizes: "1024x1024", type: "image/png", purpose: "any" },
          { src: "icons/icon-maskable-512.png",  sizes: "512x512",   type: "image/png", purpose: "maskable" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        // Ne pas mettre en cache les appels API Stripe et Supabase
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "unsplash-images",
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: { cacheName: "supabase-api", networkTimeoutSeconds: 10 }
          }
        ]
      }
    })
  ],
  build: {
    outDir: "dist",
    sourcemap: false,
    target: "es2018"
  }
});
