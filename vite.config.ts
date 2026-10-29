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
import { lucideIconAssets } from "./scripts/lucide-icon-assets";
import { publicFirstPaint } from "./scripts/public-first-paint";
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
    lucideIconAssets(),
    publicFirstPaint(),

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
          "**/lucide-icons/**",
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
      // The owned deferred helper also waits for essential application modules.
      injectRegister: false,

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
        onlyExplicitManualChunks: true,
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

          // Group data/runtime dependencies without hoisting the complete
          // dynamic icon namespace through the public Header's barrel imports.
          "application-copy": ["@/i18n/LanguageContext", "@/i18n/publicCopy"],
          "supabase-client": ["@supabase/supabase-js"],
          "query-vendor": ["@tanstack/react-query"],
          "public-navigation": ["@/components/Header", "@/components/Footer", "@/components/WhatsAppButton", "@/components/SEOHead"],
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
