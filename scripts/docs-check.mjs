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
  "src/integrations",
  "src/components/auth",
  "src/components/layout",
  "src/components/security",
  "src/components/services",
  "src/components/admin/finance",
  "src/components/admin/integrations",
  "src/core/branding",
  "src/pages/admin",
  "src/pages/geo",
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

/**
 * Cobertura Level 1/2: todo arquivo de código em src/ (fora das exclusões)
 * precisa declarar `@file` no topo, conforme FILE_HEADERS.md.
 */
const REQUIRE_FILE_TAG = ["src"];

/** Nunca exigir documentação nestes caminhos. */
const EXCLUDED = [
  "src/components/ui/",
  "src/integrations/supabase/",
  "src/vite-env.d.ts",
];

/**
 * Modo lint: além dos checks de saúde, aplica regras semânticas (Onda 7).
 * Ativado por `--lint` (npm run docs:lint). Continua sendo warning-only.
 */
const LINT_MODE = process.argv.includes("--lint");

/** Marcador de tarefa aceito: TAG(SEVEN-123). */
const TASK_TAG = /\b(TODO|FIXME|HACK)\b(\(SEVEN-\d+\))?/g;

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

/** Fontes TS/TSX de src/ sujeitas às regras do padrão. */
const sourceFiles = () =>
  walk("src").filter(
    (f) => /\.(ts|tsx)$/.test(f) && !isExcluded(f) && !f.endsWith(".d.ts"),
  );

/** Métricas agregadas exibidas no Documentation Coverage Report. */
const coverage = {
  files: 0,
  headers: 0,
  exportedApis: 0,
  documentedApis: 0,
  modules: 0,
  moduleReadmes: 0,
  criticalFiles: 0,
  criticalDocumented: 0,
};

/** 1. Cabeçalho em arquivos críticos. */
function checkCriticalHeaders() {
  const targets = new Set(CRITICAL_GLOBS);
  for (const fn of readdirSync("supabase/functions", { withFileTypes: true })) {
    if (fn.isDirectory()) targets.add(`supabase/functions/${fn.name}/index.ts`);
  }
  for (const rel of targets) {
    if (!existsSync(rel)) continue;
    coverage.criticalFiles++;
    const head = readFileSync(rel, "utf8").slice(0, 600);
    if (head.includes("/**")) coverage.criticalDocumented++;
    else warnings.push(`[header] arquivo crítico sem cabeçalho: ${rel}`);
  }
}

/** 1b. Tag @file em todo arquivo de código de src/. */
function checkFileTags() {
  for (const file of sourceFiles()) {
    coverage.files++;
    const head = readFileSync(file, "utf8").slice(0, 700);
    if (head.includes("@file")) coverage.headers++;
    else warnings.push(`[header] arquivo sem @file: ${file.replace(/\\/g, "/")}`);
  }
}

/** 2. README obrigatório por diretório. */
function checkReadmes() {
  for (const dir of REQUIRE_README) {
    if (!existsSync(dir)) continue;
    coverage.modules++;
    if (existsSync(join(dir, "README.md"))) coverage.moduleReadmes++;
    else warnings.push(`[readme] diretório sem README.md: ${dir}`);
  }
  for (const mod of existsSync("src/modules") ? readdirSync("src/modules") : []) {
    const dir = join("src/modules", mod);
    if (!statSync(dir).isDirectory()) continue;
    coverage.modules++;
    if (existsSync(join(dir, "README.md"))) coverage.moduleReadmes++;
    else warnings.push(`[readme] módulo sem README.md: ${dir}`);
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

/**
 * 4. Cobertura de TSDoc em APIs exportadas.
 *
 * Considera "API" toda função/const/hook/interface/type exportada. Uma API é
 * tratada como documentada quando existe um bloco `/** ... *\/` imediatamente
 * antes da declaração — a heurística é textual de propósito, para evitar a
 * dependência de um parser TypeScript completo no pipeline de docs.
 */
function checkTsdocCoverage() {
  const EXPORT_DECL = /^export\s+(?:default\s+)?(?:async\s+)?(?:const|function|class|interface|type|enum)\s+([A-Za-z0-9_]+)/;

  for (const file of sourceFiles()) {
    const lines = readFileSync(file, "utf8").split("\n");
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(EXPORT_DECL);
      if (!match) continue;
      coverage.exportedApis++;

      // Um bloco TSDoc pode terminar na linha imediatamente anterior.
      const previous = (lines[i - 1] ?? "").trim();
      const documented = previous.endsWith("*/") || previous.startsWith("/**");
      if (documented) {
        coverage.documentedApis++;
      } else if (LINT_MODE && lines[i].length > 60) {
        // Apenas declarações não triviais são reportadas, para evitar ruído
        // em re-exports e aliases de uma linha.
        warnings.push(
          `[tsdoc] API exportada sem TSDoc: ${file.replace(/\\/g, "/")}:${i + 1} → ${match[1]}`,
        );
      }
    }
  }
}

/** 5. Marcadores de tarefa fora do padrão TAG(SEVEN-###). */
function checkTaskTags() {
  if (!LINT_MODE) return;
  for (const file of [...sourceFiles(), ...walk("supabase/functions").filter((f) => f.endsWith(".ts"))]) {
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      if (!line.includes("//") && !line.includes("*")) return;
      for (const m of line.matchAll(TASK_TAG)) {
        if (!m[2]) {
          warnings.push(
            `[todo] marcador sem ticket: ${file.replace(/\\/g, "/")}:${i + 1} → use ${m[1]}(SEVEN-###)`,
          );
        }
      }
    });
  }
}

// ============================================================================
// 📤 REPORT
// ============================================================================

checkCriticalHeaders();
checkFileTags();
checkReadmes();
checkMarkdownLinks();
checkTsdocCoverage();
checkTaskTags();

const pad = (label, value) => `${label}${".".repeat(Math.max(2, 22 - label.length))} ${value}`;

console.log(`\n📚 SevenDevX Documentation Health${LINT_MODE ? " (lint)" : ""}\n`);
console.log("Documentation Coverage");
console.log("──────────────────────");
console.log(pad("Files", coverage.files));
console.log(pad("Headers", coverage.headers));
console.log(pad("Exported APIs", coverage.exportedApis));
console.log(pad("Documented APIs", coverage.documentedApis));
console.log(pad("Modules", coverage.modules));
console.log(pad("Module READMEs", coverage.moduleReadmes));
console.log(pad("Critical files", coverage.criticalFiles));
console.log(pad("Critical documented", coverage.criticalDocumented));
console.log("");

if (warnings.length === 0) {
  console.log("✅ Nenhum aviso encontrado.\n");
} else {
  for (const w of warnings) console.log(`⚠️  ${w}`);
  console.log(`\n${warnings.length} aviso(s). Não bloqueia o build.\n`);
}

// Sempre 0: nesta versão a checagem é informativa.
process.exit(0);
