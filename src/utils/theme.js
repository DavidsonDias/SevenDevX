/**
 * 🌌 SevenDevX | Theme Manager v1.0 PRO
 * ---------------------------------------------------------
 * ✅ Suporte a dark, light e temas dinâmicos (neon, matrix…)
 * ✅ Persistência no localStorage
 * ✅ Detecta tema do sistema (prefers-color-scheme)
 * ✅ Hook para alternar tema em tempo real
 * ✅ 100% compatível com Tailwind + CSS Vars
 * ---------------------------------------------------------
 */

const THEME_KEY = "sevendevx-theme";

/**
 * Detecta automaticamente o tema inicial com base no sistema.
 * @returns {'dark' | 'light'}
 */
function detectSystemTheme() {
  if (window.matchMedia("(prefers-color-scheme: light)").matches) return "light";
  return "dark";
}

/**
 * Obtém o tema atual do localStorage ou do sistema.
 * @returns {string}
 */
export function getCurrentTheme() {
  return localStorage.getItem(THEME_KEY) || detectSystemTheme();
}

/**
 * Aplica um tema global ao <html data-theme="">
 * @param {string} theme - Nome do tema (ex: "dark", "light", "neon", "matrix")
 */
export function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
}

/**
 * Alterna entre dark/light (ou mantém tema dinâmico).
 */
export function toggleTheme() {
  const current = getCurrentTheme();
  const next =
    current === "dark"
      ? "light"
      : current === "light"
      ? "dark"
      : "dark"; // volta ao dark se for um tema dinâmico

  setTheme(next);
}

/**
 * Inicializa o tema ao carregar a aplicação.
 * Deve ser chamada no main.tsx antes do React renderizar.
 */
export function initTheme() {
  const savedTheme = getCurrentTheme();
  setTheme(savedTheme);
  console.log(`🌓 SevenDevX Theme loaded: ${savedTheme}`);
}