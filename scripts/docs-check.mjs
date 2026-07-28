#!/usr/bin/env node
/**
 * 🩺 docs-check.mjs — SevenDevX Documentation Health
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file scripts/docs-check.mjs
 * @module Tooling/Docs
 *
 * @description
 * Verificador da saúde da documentação, conforme o SevenDevX Enterprise
 * Code Documentation Standard. Reporta (como WARNING, sem falhar o build):
 *   1. Arquivos críticos sem cabeçalho de documentação
 *   2. Diretórios relevantes sem README.md
 *   3. Links Markdown relativos apontando para arquivos inexistentes
 *
 * @responsibilities
 *   - Percorrer src/ e supabase/functions/
 *   - Emitir relatório legível no terminal
 *   - Sempre encerrar com código 0 (não bloqueia CI nesta versão)
 *
 * @usage npm run docs:check
 *
 * @see docs/code-standards/DOCUMENTATION_CHECKLIST.md
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, dirname, resolve, relative } from "node:path";

// ============================================================================
// ⚙️ CONFIGURATION
// ============================================================================

const ROOT = process.cwd();

/** Diretórios ignorados na varredura. */
const IGNORED_DIRS = new Set([
  "node_modules", "dist", "dev-dist", ".git", "assets", "icons", "public",
]);

/** Diretórios que devem obrigatoriamente possuir README.md. */
const REQUIRE_README = [
  "src",
  "src/app",
  "src/components",
  "src/components/ui",
  "src/components/admin",
  "src/contexts",
  "src/core",
  "src/data",
  "src/hooks",
  "src/i18n",
  "src/lib",
  "src/modules",
  "src/pages",
  "src/utils",
  "supabase/functions",
  "docs",
];

/**
 * Arquivos considerados críticos (Level 3): precisam de cabeçalho de bloco.
 * Componentes gerados pelo shadcn e arquivos auto-gerados ficam de fora.
 */
const CRITICAL_GLOBS = [
  "src/main.tsx",
  "src/App.tsx",
  "src/app/Providers.tsx",
  "src/app/Router.tsx",
  "src/contexts/AuthContext.tsx",
  "src/components/auth/ProtectedRoute.tsx",
  "src/sw.ts",
];

/** Nunca exigir documentação nestes caminhos. */
const EXCLUDED = [
  "src/components/ui/",
  "src/integrations/supabase/",
  "src/vite-env.d.ts",
];

// ============================================================================
// 🧠 CHECKS
// ============================================================================

const warnings = [];

/** Percorre recursivamente um diretório retornando caminhos de arquivo. */
function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    if (IGNORED_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const isExcluded = (p) => EXCLUDED.some((e) => p.replace(/\\/g, "/").includes(e));

/** 1. Cabeçalho em arquivos críticos. */
function checkCriticalHeaders() {
  const targets = new Set(CRITICAL_GLOBS);
  for (const fn of readdirSync("supabase/functions", { withFileTypes: true })) {
    if (fn.isDirectory()) targets.add(`supabase/functions/${fn.name}/index.ts`);
  }
  for (const rel of targets) {
    if (!existsSync(rel)) continue;
    const head = readFileSync(rel, "utf8").slice(0, 600);
    if (!head.includes("/**")) {
      warnings.push(`[header] arquivo crítico sem cabeçalho: ${rel}`);
    }
  }
}

/** 2. README obrigatório por diretório. */
function checkReadmes() {
  for (const dir of REQUIRE_README) {
    if (!existsSync(dir)) continue;
    if (!existsSync(join(dir, "README.md"))) {
      warnings.push(`[readme] diretório sem README.md: ${dir}`);
    }
  }
  for (const mod of existsSync("src/modules") ? readdirSync("src/modules") : []) {
    const dir = join("src/modules", mod);
    if (statSync(dir).isDirectory() && !existsSync(join(dir, "README.md"))) {
      warnings.push(`[readme] módulo sem README.md: ${dir}`);
    }
  }
}

/** 3. Links Markdown relativos quebrados. */
function checkMarkdownLinks() {
  const mdFiles = [...walk("docs"), ...walk("src").filter((f) => f.endsWith(".md")), "README.md"]
    .filter((f) => f.endsWith(".md") && existsSync(f));

  for (const file of mdFiles) {
    const content = readFileSync(file, "utf8");
    for (const [, target] of content.matchAll(/\]\(([^)]+)\)/g)) {
      if (/^(https?:|mailto:|#)/.test(target)) continue;
      const clean = target.split("#")[0];
      if (!clean) continue;
      const abs = resolve(dirname(file), clean);
      if (!existsSync(abs)) {
        warnings.push(`[link] link quebrado em ${relative(ROOT, file)} → ${target}`);
      }
    }
  }
}

// ============================================================================
// 📤 REPORT
// ============================================================================

checkCriticalHeaders();
checkReadmes();
checkMarkdownLinks();

console.log("\n📚 SevenDevX Documentation Health\n");
if (warnings.length === 0) {
  console.log("✅ Nenhum aviso encontrado.\n");
} else {
  for (const w of warnings) console.log(`⚠️  ${w}`);
  console.log(`\n${warnings.length} aviso(s). Não bloqueia o build.\n`);
}

// Sempre 0: nesta versão a checagem é informativa.
process.exit(0);
