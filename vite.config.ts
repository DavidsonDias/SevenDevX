/**
 * ⚡ vite.config.ts — SevenDevX Ultra Build Enterprise Fusion + PWA v8.0
 * =========================================================================
 * Combina:
 *  - v7.2 Enterprise Build PRO (otimização máxima)
 *  - + VitePWA InjectManifest (controle total do SW)
 *
 * 🔥 Recursos principais:
 * - React SWC ultrarrápido
 * - PWA com InjectManifest (sw.ts)
 * - Code splitting avançado (vendor / ui / animation / gsap / core)
 * - Cache agressivo (365 dias)
 * - Brotli + gzip report
 * - Module preload polyfill
 * =========================================================================
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { componentTagger } from "lovable-tagger";
import { techIconAssets } from "./scripts/tech-icon-assets";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  /* ==================================================================
     🌐 DEV SERVER
     ================================================================== */
  server: {
    host: "::",
    port: 8080,
  },

  /* ==================================================================
     🔌 PLUGINS
     ================================================================== */
  plugins: [
    react(),
    techIconAssets(),

    // Executa o componentTagger apenas no modo desenvolvimento
    mode === "development" && componentTagger(),

    // ==================================================================
    // PWA InjectManifest (SevenDevX)
    // ==================================================================
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",

      // One canonical static manifest; do not inject a second manifest link.
      manifest: false,

      injectManifest: {
        // Precache apenas o app shell + fontes + ícones leves.
        // Imagens pesadas (webp/jpg/png de projetos) são servidas pelo
        // runtime cache do sw.ts (CacheFirst same-origin), evitando um
        // download de ~11MB no primeiro acesso.
        globPatterns: [
          "**/*.{js,css,html,ico,svg,woff,woff2}",
          "logo-*.png",
          "favicon*.png",
          "apple-touch-icon.png",
        ],
        globIgnores: [
          "**/node_modules/**/*",
          "**/tech-icons/**",
          "**/sw.ts",
          "**/workbox-*.js",
          "**/*.mp4",
          "**/screenshots/**",
          "**/splashscreens/**",
        ],
        // Bundles grandes (dev não minificado e chunk principal do admin)
        // exigem um limite alto; caso contrário o Workbox aborta o build.
        maximumFileSizeToCacheInBytes: 12 * 1024 * 1024,
      },

      registerType: "prompt",

      devOptions: {
        enabled: false,
      },

      includeAssets: [
        "favicon.ico",
        "robots.txt",
        "icons/**/*",
        "screenshots/**/*",
      ],
    }),
  ].filter(Boolean),

  /* ==================================================================
     📁 PATH ALIAS
     ================================================================== */
  resolve: {
    alias: {
      "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "./src"),
    },
  },

  /* ==================================================================
     ⚙️ BUILD ULTRA OTIMIZADO
     ================================================================== */
  build: {
    target: ["es2020", "safari14"],
    minify: "esbuild",
    cssMinify: "esbuild",
    assetsDir: "assets",
    chunkSizeWarningLimit: 900,
    reportCompressedSize: true,

    cssCodeSplit: true,
    sourcemap: false,

    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],

          animation: ["framer-motion"],
          gsap: ["gsap", "gsap/ScrollTrigger"],

          ui: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-tabs",
            "@radix-ui/react-accordion",
            "@radix-ui/react-tooltip",
          ],

          "landing-core": [
            "@/components/Header",
            "@/components/Footer",
            "@/components/WhatsAppButton",
            "@/components/SEOHead",
          ],
        },

        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },

    modulePreload: {
      polyfill: true,
    },
  },

  /* ==================================================================
     🚀 Cold Start — optimizeDeps
     ================================================================== */
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "framer-motion",
      "gsap",
      "gsap/ScrollTrigger",
      "@radix-ui/react-dialog",
      "@radix-ui/react-tabs",
      "@radix-ui/react-accordion",
      "@radix-ui/react-tooltip",
    ],
    esbuildOptions: {
      target: "es2020",
    },
  },
}));
