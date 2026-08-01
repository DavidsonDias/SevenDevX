/**
 * theme.ts — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/utils/theme.ts
 * @module Utils
 *
 * @description
 * Alternância e persistência de tema.
 *
 * @see src/utils/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🌌 SevenDevX | Theme Manager v1.0 PRO++
 * ---------------------------------------------------------
 * ✅ Suporte a dark, light e temas dinâmicos (neon, matrix…)
 * ✅ Persistência no localStorage
 * ✅ Detecta tema do sistema (prefers-color-scheme)
 * ✅ 100% tipado para React + Vite + TypeScript
 * ✅ Compatível com Tailwind + CSS Vars (index.css v1.5)
 * ---------------------------------------------------------
 */

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const THEME_KEY = "sevendevx-theme";

/**
 * Lista oficial de temas suportados no sistema.
 */
export type ThemeName = "dark" | "light" | "neon" | "matrix";

// ============================================================================
// 🧠 BUSINESS LOGIC
// ============================================================================

/**
 * Detecta automaticamente o tema do sistema operacional.
 * @returns {'dark' | 'light'}
 */
function detectSystemTheme(): ThemeName {
  if (window.matchMedia("(prefers-color-scheme: light)").matches) return "light";
  return "dark";
}

/**
 * Obtém o tema atual armazenado ou o detectado pelo sistema.
 */
export function getCurrentTheme(): ThemeName {
  const stored = localStorage.getItem(THEME_KEY) as ThemeName | null;
  return stored ?? detectSystemTheme();
}

/**
 * Define e aplica o tema globalmente.
 * Atualiza o atributo `data-theme` do elemento <html>.
 */
export function setTheme(theme: ThemeName): void {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
}

/**
 * Alterna entre os modos dark e light.
 * Se o tema for dinâmico (ex: "neon" ou "matrix"), volta para dark.
 */
export function toggleTheme(): void {
  const current = getCurrentTheme();
  const nextTheme: ThemeName =
    current === "dark"
      ? "light"
      : current === "light"
      ? "dark"
      : "dark"; // Fallback pro dark
  setTheme(nextTheme);
}

/**
 * Inicializa o tema quando a aplicação é carregada.
 * Ideal para ser chamado no `main.tsx`.
 */
export function initTheme(): void {
  const savedTheme = getCurrentTheme();
  setTheme(savedTheme);
  console.log(`🌓 SevenDevX Theme loaded: ${savedTheme}`);
}

/**
 * Aplica um tema dinâmico (ex: neon, matrix, cyberpunk...).
 * Pode ser usado futuramente para paletas animadas via CSS vars.
 */
export function setDynamicTheme(theme: ThemeName): void {
  setTheme(theme);
}