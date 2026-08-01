#!/usr/bin/env node
/**
 * apply-sections.mjs — SevenDevX Enterprise Code Documentation
 * ─────────────────────────────────────────────────────────────────────
 * Codemod que insere divisores de seção internos (📦 IMPORTS, 🧩 TYPES…)
 * em arquivos médios/grandes. Só adiciona comentários — nunca altera código.
 *
 * Uso: node scripts/apply-sections.mjs [--dry]
 * ─────────────────────────────────────────────────────────────────────
 */
import fs from "node:fs";
import path from "node:path";

const DRY = process.argv.includes("--dry");
const CHECK = process.argv.includes("--check");
const ROOTS = ["src", "supabase/functions", "scripts"];
const EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);
const MIN_LINES = 80;
const SKIP = [
  "src/components/ui/",
  "src/integrations/supabase/types.ts",
  "src/integrations/supabase/client.ts",
  "src/vite-env.d.ts",
  "scripts/apply-sections.mjs",
];

const DIV = (emoji, title) =>
  `// ============================================================================\n// ${emoji} ${title}\n// ============================================================================`;

const SECTIONS = {
  imports: DIV("📦", "IMPORTS"),
  types: DIV("🧩", "TYPES & CONTRACTS"),
  constants: DIV("⚙️", "CONSTANTS & CONFIGURATION"),
  logic: DIV("🧠", "BUSINESS LOGIC"),
  hook: DIV("🪝", "HOOK IMPLEMENTATION"),
  internal: DIV("🎨", "INTERNAL COMPONENTS"),
  main: DIV("🏗️", "MAIN COMPONENT"),
  handler: DIV("🌐", "REQUEST HANDLER"),
  exports: DIV("📤", "EXPORTS"),
};

const ORDER = ["imports", "types", "constants", "logic", "hook", "internal", "main", "handler", "exports"];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist") continue;
      walk(p, out);
    } else if (EXT.has(path.extname(entry.name))) out.push(p);
  }
  return out;
}

/** Classifica uma linha top-level (coluna 0) em uma seção, ou null. */
function classify(line, file) {
  const isTsx = file.endsWith(".tsx");
  if (/^import[\s{*]/.test(line) || /^import\s*["']/.test(line)) return "imports";
  if (/^(export\s+)?(interface|type)\s+[A-Za-z_]/.test(line)) return "types";
  if (/^(export\s+)?(declare\s+)?enum\s+/.test(line)) return "types";
  if (/^(export\s+)?const\s+[A-Z0-9_]+\s*[:=]/.test(line)) return "constants";
  if (/^Deno\.serve\(/.test(line)) return "handler";
  if (/^(export\s+)?(async\s+)?function\s+use[A-Z]/.test(line)) return "hook";
  if (/^(export\s+)?const\s+use[A-Z][A-Za-z0-9_]*\s*[:=]/.test(line)) return "hook";
  if (isTsx) {
    const comp = /^(export\s+)?(default\s+)?(function\s+([A-Z][A-Za-z0-9_]*)|const\s+([A-Z][A-Za-z0-9_]*)\s*[:=])/.exec(line);
    if (comp) return "component";
  }
  if (/^(export\s+)?(async\s+)?function\s+[a-z]/.test(line)) return "logic";
  if (/^(export\s+)?const\s+[a-z][A-Za-z0-9_]*\s*(:\s*[^=]+)?=\s*(async\s*)?(\(|function|<)/.test(line)) return "logic";
  if (/^export\s+default\s/.test(line) || /^export\s*\{/.test(line)) return "exports";
  return null;
}

/** Marca as linhas top-level seguras (fora de strings/templates/comentários). */
function topLevelLines(lines) {
  const safe = [];
  let inBlock = false;
  let tickParity = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const wasSafe = !inBlock && tickParity === 0;
    if (wasSafe && /^\S/.test(line) && !trimmed.startsWith("//") && !trimmed.startsWith("*") && !trimmed.startsWith("/*")) {
      safe.push(i);
    }
    // atualiza estados grosseiros
    if (!inBlock) {
      const openIdx = line.indexOf("/*");
      const closeIdx = line.lastIndexOf("*/");
      if (openIdx !== -1 && closeIdx < openIdx) inBlock = true;
    } else if (line.includes("*/")) {
      inBlock = false;
    }
    if (!inBlock) {
      const ticks = (line.match(/`/g) || []).length;
      if (ticks % 2 === 1) tickParity ^= 1;
    }
  }
  return safe;
}

/** Encontra o início do bloco (JSDoc/decorator/comentário) que precede a linha. */
function blockStart(lines, idx) {
  let i = idx;
  while (i > 0) {
    const prev = lines[i - 1].trim();
    if (prev.startsWith("*") || prev.startsWith("/**") || prev.startsWith("/*") || prev.endsWith("*/") || prev.startsWith("//")) {
      i--;
    } else break;
  }
  return i;
}

/** Detecta qualquer divisor de seção já existente (independente do emoji usado). */
const HAS_DIVIDER = /^\/\/ ={20,}$/m;

function processFile(file) {
  const src = fs.readFileSync(file, "utf8");
  if (HAS_DIVIDER.test(src)) return false;
  // normaliza arquivos indentados por 1 espaço no topo (legado)
  const lines = src.split("\n");
  if (lines.length < MIN_LINES) return false;

  const safe = topLevelLines(lines);
  if (safe.length < 6) return false;

  // Primeira passagem: coleta categorias por linha
  const hits = [];
  for (const i of safe) {
    let cat = classify(lines[i].trimStart(), file);
    if (cat) hits.push({ line: i, cat });
  }
  if (!hits.length) return false;

  // "component" → último vira MAIN, os anteriores viram INTERNAL
  const compIdx = hits.map((h, k) => (h.cat === "component" ? k : -1)).filter((k) => k >= 0);
  if (compIdx.length) {
    const lastK = compIdx[compIdx.length - 1];
    for (const k of compIdx) hits[k].cat = k === lastK ? "main" : "internal";
    if (compIdx.length === 1) hits[lastK].cat = "main";
  }

  // Seleciona pontos de inserção: primeira ocorrência de cada categoria, em ordem monotônica
  const used = new Set();
  const inserts = [];
  let lastRank = -1;
  for (const h of hits) {
    const rank = ORDER.indexOf(h.cat);
    if (rank === -1 || used.has(h.cat) || rank < lastRank) continue;
    used.add(h.cat);
    lastRank = rank;
    inserts.push({ line: blockStart(lines, h.line), cat: h.cat });
  }
  // Evita ruído: precisa de pelo menos 2 seções distintas
  if (inserts.length < 2) return false;

  // Aplica de baixo para cima
  const out = lines.slice();
  for (let k = inserts.length - 1; k >= 0; k--) {
    const { line, cat } = inserts[k];
    if (line === 0 && cat !== "imports") continue;
    const block = SECTIONS[cat];
    const before = out[line - 1] === undefined ? [] : out[line - 1].trim() === "" ? [] : [""];
    out.splice(line, 0, ...before, block, "");
  }

  const result = out.join("\n");
  if (result === src) return false;
  if (!DRY && !CHECK) fs.writeFileSync(file, result);
  return true;
}

// ============================================================================
// 🌐 RUNNER
// ============================================================================

let changed = 0;
const pending = [];
const files = ROOTS.flatMap((r) => (fs.existsSync(r) ? walk(r) : []))
  .filter((f) => !SKIP.some((s) => f.startsWith(s)));

let sectioned = 0;
for (const f of files) {
  try {
    if (HAS_DIVIDER.test(fs.readFileSync(f, "utf8"))) sectioned++;
    if (processFile(f)) {
      changed++;
      pending.push(f);
      console.log("✓", f);
    }
  } catch (e) {
    console.error("✗", f, e.message);
  }
}

const coverage = files.length ? ((sectioned / files.length) * 100).toFixed(1) : "0.0";
console.log(`\nSection Coverage: ${sectioned}/${files.length} (${coverage}%)`);

if (CHECK) {
  if (changed) {
    console.error(
      `\n✗ ${changed} arquivo(s) sem divisores de seção. Rode: npm run docs:sections`,
    );
    process.exit(1);
  }
  console.log("✓ Todos os arquivos elegíveis possuem divisores de seção.");
} else {
  console.log(`${changed}/${files.length} arquivos atualizados${DRY ? " (dry-run)" : ""}.`);
}

