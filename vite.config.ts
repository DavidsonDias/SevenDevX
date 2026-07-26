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
import { componentTagger } from "lovable-tagger";
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

    // Executa o componentTagger apenas no modo desenvolvimento
    mode === "development" && componentTagger(),

    // ==================================================================
    // PWA InjectManifest (SevenDevX)
    // ==================================================================
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",

      manifest: {
        name: "SevenDevX - Desenvolvimento Web Premium",
        short_name: "SevenDevX",
        description:
          "Desenvolvimento web profissional com React, TypeScript e tecnologias modernas.",
        theme_color: "#000000",
        background_color: "#000000",
        display: "standalone",
        orientation: "portrait-primary",
        scope: "/",
        start_url: "/",
        id: "/",

        icons: [
          { src: "/icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
          { src: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
          {
            src: "/icons/icon-128x128.png",
            sizes: "128x128",
            type: "image/png",
          },
          {
            src: "/icons/icon-144x144.png",
            sizes: "144x144",
            type: "image/png",
          },
          {
            src: "/icons/icon-152x152.png",
            sizes: "152x152",
            type: "image/png",
          },
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-384x384.png",
            sizes: "384x384",
            type: "image/png",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icons/icon-maskable-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/icons/icon-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],

        categories: ["business", "productivity", "development"],

        shortcuts: [
          {
            name: "Dashboard SevenOS",
            short_name: "Admin",
            description: "Acessar painel administrativo",
            url: "/admin",
            icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
          },
          {
            name: "Pipeline de Vendas",
            short_name: "Pipeline",
            description: "Acompanhar funil de leads",
            url: "/admin/pipeline",
            icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
          },
          {
            name: "WhatsApp Inbox",
            short_name: "WhatsApp",
            description: "Conversas em tempo real",
            url: "/admin/whatsapp",
            icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
          },
          {
            name: "Logo Lab",
            short_name: "Brand",
            description: "Editor de marca e logos",
            url: "/admin/logo-lab",
            icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
          },
        ],

        screenshots: [
          {
            src: "/screenshots/desktop-1920x1080.png",
            sizes: "1920x1080",
            type: "image/png",
            form_factor: "wide",
            label: "SevenDevX Desktop",
          },
          {
            src: "/screenshots/mobile-750x1334.png",
            sizes: "750x1334",
            type: "image/png",
            form_factor: "narrow",
            label: "SevenDevX Mobile",
          },
        ],
      },

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
          "**/sw.ts",
          "**/workbox-*.js",
          "**/*.mp4",
          "**/screenshots/**",
          "**/splashscreens/**",
        ],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
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
      "@": path.resolve(__dirname, "./src"),
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
