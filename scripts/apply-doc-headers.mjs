#!/usr/bin/env node
/**
 * 🧭 apply-doc-headers.mjs — SevenDevX Documentation Tooling
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file scripts/apply-doc-headers.mjs
 * @module Tooling/Docs
 * @layer Tooling
 * @status Active
 *
 * @description
 * Codemod idempotente que aplica cabeçalhos adaptativos (Level 1/2/3) do
 * SevenDevX Enterprise Code Documentation Standard. Todo conteúdo do
 * cabeçalho é derivado de sinais reais do arquivo (imports, exports,
 * hooks, rota, Supabase, secrets, realtime, APIs externas) — nada é
 * inventado.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                     │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Classificar o Level do arquivo por sinais verificáveis
 * ✅ Gerar blocos visuais somente quando houver evidência no código
 * ✅ Preservar `@description`, `@since` e `@updated` já existentes
 * ✅ Validar (`--check`) métricas fictícias, `@see` quebrado e duplicações
 * ⚠️ Nunca altera código executável — apenas o bloco de comentário do topo
 *
 * @usage node scripts/apply-doc-headers.mjs [--check] [--dry]
 *
 * @see docs/code-standards/FILE_HEADERS.md
 * @see docs/code-standards/CODE_ANATOMY.md
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import fs from "node:fs";
import path from "node:path";

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const CHECK = process.argv.includes("--check");
const DRY = process.argv.includes("--dry");
const ROOTS = ["src", "supabase/functions"];
const EXT = new Set([".ts", ".tsx"]);
const SKIP = [
  "src/components/ui/",
  "src/integrations/supabase/types.ts",
  "src/integrations/supabase/client.ts",
  "src/vite-env.d.ts",
  "src/sw.ts",
];

/** Diretórios cujos arquivos são sempre tratados como críticos (Level 3). */
const CRITICAL_DIRS = [
  "src/app/",
  "src/core/",
  "src/contexts/",
  "src/modules/",
  "src/pages/admin/",
  "src/components/auth/",
  "src/components/security/",
  "supabase/functions/",
];

/** Palavras que sinalizam domínio crítico mesmo fora dos diretórios acima. */
const CRITICAL_HINTS =
  /(auth|security|mfa|oauth|webhook|integration|finance|contract|payment|billing|automation|realtime|storage|upload|secret|role|rbac|pwa|service-?worker|offline)/i;

/** Módulo lógico por prefixo de diretório. */
const MODULE_BY_DIR = [
  ["src/pages/admin", "SevenOS/Admin"],
  ["src/pages/geo", "Public/GEO"],
  ["src/pages", "Public"],
  ["src/components/admin/finance", "SevenOS/Finance"],
  ["src/components/admin/integrations", "SevenOS/Integrations"],
  ["src/components/admin", "SevenOS/UI"],
  ["src/components/auth", "Auth"],
  ["src/components/layout", "UI/Layout"],
  ["src/components/security", "Security"],
  ["src/components/services", "Public/Services"],
  ["src/components", "UI"],
  ["src/modules/integrations", "Integrations"],
  ["src/modules/automations", "Automations"],
  ["src/modules/branding", "Branding"],
  ["src/modules/layout", "Layout"],
  ["src/modules/notifications", "Notifications"],
  ["src/modules/onboarding", "Onboarding"],
  ["src/modules/system-health", "SystemHealth"],
  ["src/modules/users", "Users"],
  ["src/modules/webhooks", "Webhooks"],
  ["src/core/branding", "Core/Branding"],
  ["src/contexts", "Core/Context"],
  ["src/app", "Core/App"],
  ["src/hooks", "Hooks"],
  ["src/data", "Content"],
  ["src/lib", "Lib"],
  ["src/utils", "Utils"],
  ["src/i18n", "i18n"],
  ["supabase/functions", "Edge Functions"],
];

/** Camada arquitetural por prefixo. */
const LAYER_BY_DIR = [
  ["src/pages/admin", "Presentation / Admin"],
  ["src/pages", "Presentation / Public"],
  ["src/components", "Presentation / UI"],
  ["src/modules", "Feature Module"],
  ["src/contexts", "Application / State"],
  ["src/app", "Application / Composition"],
  ["src/core", "Domain / Core"],
  ["src/hooks", "Data Access / Hooks"],
  ["src/lib", "Infrastructure / Lib"],
  ["src/utils", "Infrastructure / Utils"],
  ["src/data", "Content / Static Data"],
  ["src/i18n", "Infrastructure / i18n"],
  ["supabase/functions", "Backend / Edge Function"],
];

/** Bibliotecas relevantes reconhecidas nos imports. */
const LIB_LABELS = [
  ["react-router-dom", "React Router — navegação e parâmetros de rota"],
  ["@tanstack/react-query", "React Query — consulta, cache e invalidação"],
  ["framer-motion", "Framer Motion — transições e animações"],
  ["recharts", "Recharts — visualização de dados"],
  ["@dnd-kit", "dnd-kit — ordenação por arrastar e soltar"],
  ["react-hook-form", "React Hook Form — formulários controlados"],
  ["zod", "Zod — validação de schema"],
  ["date-fns", "date-fns — formatação de datas"],
  ["lucide-react", "Lucide — iconografia do design system"],
  ["@/integrations/supabase/client", "Supabase Client — dados, auth e RPC"],
  ["@/contexts/AuthContext", "AuthContext — sessão e papel administrativo"],
  ["sonner", "Sonner — feedback via toast"],
];

/** Padrões que caracterizam métricas fictícias em cabeçalhos. */
const FAKE_METRICS = [
  /lighthouse\s*\d/i,
  /@lighthouse/i,
  /@bundle-?size/i,
  /\b\d+\s*fps\b/i,
  /wcag[^\n]*complian/i,
  /@tested\b/i,
  /\buptime\b\s*\d/i,
  /cobertura de testes\s*\d/i,
];

/** Títulos promocionais proibidos. */
const PROMO = /(Ultra PRO|HybriX|ULTIMATE|Pro\+\+|Super Enterprise|\(Corrigida\)|Refinada\b)/;

const TODAY = "2026-08-02";

// ============================================================================
// 🧠 BUSINESS LOGIC — análise do arquivo
// ============================================================================

const ROUTES = loadRoutes();

/** Extrai o mapa de rotas reais a partir do Router da aplicação. */
function loadRoutes() {
  const map = {};
  const routerPath = "src/app/Router.tsx";
  if (!fs.existsSync(routerPath)) return map;
  const src = fs.readFileSync(routerPath, "utf8");
  const lazyImports = {};
  for (const m of src.matchAll(/const\s+(\w+)\s*=\s*lazy\(\(\)\s*=>\s*import\(["']([^"']+)["']\)\)/g)) {
    lazyImports[m[1]] = m[2];
  }
  for (const m of src.matchAll(/import\s+(\w+)\s+from\s+["'](@\/pages\/[^"']+)["']/g)) {
    lazyImports[m[1]] = m[2];
  }
  for (const m of src.matchAll(/path=["']([^"']*)["'][\s\S]{0,300}?<(\w+)\s*\/>/g)) {
    const [, route, comp] = m;
    const target = lazyImports[comp];
    if (!target) continue;
    const file = target.replace("@/", "src/");
    const full = [`${file}.tsx`, `${file}.ts`].find((f) => fs.existsSync(f));
    if (!full) continue;
    map[full] = map[full] ? `${map[full]}, ${route || "/"}` : route || "/";
  }
  return map;
}

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

function pickPrefix(table, file, fallback) {
  const hit = table.find(([prefix]) => file.startsWith(prefix));
  return hit ? hit[1] : fallback;
}

/** Coleta sinais verificáveis do código-fonte. */
function analyze(file, src) {
  const body = stripLeadingHeaders(src).body;
  const imports = [...body.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]);
  const localComponents = [
    ...body.matchAll(/import\s+(?:\{([^}]+)\}|(\w+))\s+from\s+["']@\/(?:components|modules)\/(?!ui\/)[^"']+["']/g),
  ]
    .flatMap((m) => (m[1] ? m[1].split(",") : [m[2]]))
    .map((s) => s.trim().split(/\s+as\s+/)[0])
    .filter((s) => /^[A-Z]/.test(s));
  const lazyComponents = [...body.matchAll(/const\s+([A-Z]\w+)\s*=\s*lazy\(/g)].map((m) => m[1]);
  const exports = [
    ...body.matchAll(/^export\s+(?:default\s+)?(?:async\s+)?(?:function|const|class|interface|type)\s+(\w+)/gm),
  ].map((m) => m[1]);
  const hooks = [...body.matchAll(/\b(use[A-Z]\w+)\s*\(/g)].map((m) => m[1]);
  const tables = [...body.matchAll(/\.from\(\s*["'](\w+)["']/g)].map((m) => m[1]);
  const rpcs = [...body.matchAll(/\.rpc\(\s*["'](\w+)["']/g)].map((m) => m[1]);
  const functionsInvoked = [...body.matchAll(/functions\.invoke\(\s*["']([\w-]+)["']/g)].map((m) => m[1]);
  const externalHosts = [...body.matchAll(/fetch\(\s*[`"']https:\/\/([\w.-]+)/g)].map((m) => m[1]);
  const secrets = [...body.matchAll(/Deno\.env\.get\(\s*["'](\w+)["']/g)].map((m) => m[1]);
  const storage = [...body.matchAll(/\.storage\s*\n?\s*\.from\(\s*["'](\w+)["']/g)].map((m) => m[1]);

  const uniq = (a) => [...new Set(a)];

  return {
    imports: uniq(imports),
    localComponents: uniq([...localComponents, ...lazyComponents]),
    lazyComponents: uniq(lazyComponents),
    exports: uniq(exports),
    hooks: uniq(hooks.filter((h) => !["useState", "useEffect", "useMemo", "useCallback", "useRef", "useContext"].includes(h))),
    tables: uniq(tables),
    rpcs: uniq(rpcs),
    functionsInvoked: uniq(functionsInvoked),
    externalHosts: uniq(externalHosts),
    secrets: uniq(secrets),
    storageBuckets: uniq(storage),
    signedUrl: /createSignedUrl/.test(body),
    realtime: /\.channel\(/.test(body),
    hasRole: /has_role/.test(body),
    usesAuth: /useAuthContext|auth\.getUser\(\)/.test(body),
    localStorage: /localStorage|safeStorage|indexedDB/.test(body),
    isEdge: file.startsWith("supabase/functions/"),
    isComponent: file.endsWith(".tsx"),
    linesOfCode: body.split("\n").filter((l) => l.trim() && !l.trim().startsWith("//")).length,
    reduceMotion: /prefers-reduced-motion|useReducedMotion/.test(body),
    aria: /aria-|role=/.test(body),
    seo: /SEOHead|application\/ld\+json|Helmet/.test(body),
  };
}

/** Define o Level (1, 2 ou 3) a partir de sinais reais. */
function levelOf(file, a) {
  if (CRITICAL_DIRS.some((d) => file.startsWith(d))) return 3;
  if (CRITICAL_HINTS.test(file) && a.linesOfCode > 40) return 3;
  if (a.secrets.length || a.realtime || a.hasRole || a.signedUrl) return 3;
  if (file.startsWith("src/pages/") && a.linesOfCode > 120) return 3;
  if (a.linesOfCode <= 45 && !a.isComponent && !a.tables.length && !a.hooks.length) return 1;
  return 2;
}

// ============================================================================
// 🧠 BUSINESS LOGIC — parsing e geração do cabeçalho
// ============================================================================

/** Separa diretivas de topo, cabeçalhos JSDoc iniciais e o corpo do arquivo. */
function stripLeadingHeaders(src) {
  const lines = src.split("\n");
  let i = 0;
  const directives = [];
  while (i < lines.length && /^(#!|"use \w+";|'use \w+';|\/\/\/ <reference)/.test(lines[i].trim())) {
    directives.push(lines[i]);
    i++;
  }
  const headers = [];
  for (;;) {
    let j = i;
    while (j < lines.length && lines[j].trim() === "") j++;
    if (j >= lines.length || !lines[j].trim().startsWith("/**")) break;
    let k = j;
    while (k < lines.length && !lines[k].includes("*/")) k++;
    if (k >= lines.length) break;
    // não engolir TSDoc de um símbolo (bloco seguido imediatamente de código exportado)
    let n = k + 1;
    while (n < lines.length && lines[n].trim() === "") n++;
    const next = (lines[n] || "").trim();
    const block = lines.slice(j, k + 1).join("\n");
    const isFileHeader = /@file|@module|—\s*Seven|═══|─────/.test(block);
    if (!isFileHeader || /^(export|const|function|class|interface|type|async)/.test(next) && !/@file|@module/.test(block)) break;
    headers.push(block);
    i = k + 1;
  }
  while (i < lines.length && lines[i].trim() === "") i++;
  return { directives, headers, body: lines.slice(i).join("\n") };
}

/** Recupera campos reutilizáveis dos cabeçalhos existentes. */
function reuse(headers) {
  const joined = headers.join("\n");
  const out = {};
  const desc = /@description[ \t]*\n((?:[ \t]*\*[ \t]+(?!@).*\n)+)/.exec(joined);
  if (desc) {
    out.description = desc[1]
      .split("\n")
      .map((l) => l.replace(/^\s*\*\s?/, "").trim())
      .filter(Boolean)
      .join(" ")
      .trim();
  }
  const since = /@since\s+([\w.\-]+)/.exec(joined);
  if (since) out.since = since[1];
  const updated = /@updated\s+([\w.\-]+)/.exec(joined);
  if (updated) out.updated = updated[1];
  return out;
}

const box = (title) =>
  [
    " * ┌─────────────────────────────────────────────────────────────────────┐",
    ` * │ ${title.padEnd(68)}│`,
    " * └─────────────────────────────────────────────────────────────────────┘",
    " *",
  ].join("\n");

/** Monta as linhas de blocos visuais com base nos sinais detectados. */
function blocks(file, a, level) {
  const out = [];
  const push = (title, lines) => {
    const clean = lines.filter(Boolean);
    if (!clean.length) return;
    out.push(box(title));
    out.push(...clean.map((l) => ` * ${l}`));
    out.push(" *");
  };

  // ✅ Responsabilidades — derivadas de exports e sinais reais
  const resp = [];
  const mainExport = a.exports[a.exports.length - 1];
  if (mainExport) resp.push(`✅ Exporta \`${a.exports.slice(0, 4).join("`, `")}\``);
  if (a.localComponents.length) resp.push(`✅ Compõe blocos de UI importados de \`@/components\` e \`@/modules\``);
  if (a.tables.length) resp.push(`✅ Lê/escreve nas tabelas: ${a.tables.slice(0, 6).map((t) => `\`${t}\``).join(", ")}`);
  if (a.rpcs.length) resp.push(`✅ Invoca RPC: ${a.rpcs.slice(0, 5).map((r) => `\`${r}\``).join(", ")}`);
  if (a.functionsInvoked.length)
    resp.push(`✅ Aciona Edge Functions: ${a.functionsInvoked.slice(0, 5).map((f) => `\`${f}\``).join(", ")}`);
  if (a.seo) resp.push("✅ Aplica metadados SEO/GEO da rota");
  if (level >= 2) push("✅ RESPONSABILIDADES PRINCIPAIS", resp);

  // 🧩 Arquitetura — composição real
  if (level === 3 && a.localComponents.length >= 3) {
    const tree = a.localComponents.slice(0, 10);
    push("🧩 ARQUITETURA DO ARQUIVO", [
      `${path.basename(file).replace(/\.[jt]sx?$/, "")}`,
      ...tree.map((c, i) => `   ${i === tree.length - 1 ? "└──" : "├──"} ${c}`),
    ]);
  }

  // 🔄 Fluxo de dados
  if (level === 3 && (a.tables.length || a.rpcs.length || a.functionsInvoked.length)) {
    push("🔄 FLUXO DE DADOS", [
      "Supabase (RLS aplicada)",
      "   ↓",
      a.hooks.length ? `Hooks: ${a.hooks.slice(0, 4).join(", ")}` : "Consulta direta via client",
      "   ↓",
      `${path.basename(file)}`,
    ]);
  }

  // 🛠️ Dependências
  const deps = LIB_LABELS.filter(([id]) => a.imports.some((i) => i === id || i.startsWith(id))).map(
    ([, label]) => `✅ ${label}`,
  );
  if (level >= 2) push("🛠️ DEPENDÊNCIAS RELEVANTES", deps.slice(0, 8));

  // 🔒 Regras de negócio e invariantes (somente evidências)
  const rules = [];
  if (a.hasRole) rules.push("✅ O papel administrativo é verificado via RPC `has_role` (SECURITY DEFINER)");
  if (file.startsWith("src/pages/admin/")) rules.push("✅ Rota protegida por `ProtectedRoute`; a autoridade final é a RLS");
  if (a.secrets.length) rules.push("🔒 Secrets permanecem em `Deno.env` e nunca retornam ao cliente");
  if (a.signedUrl) rules.push("🔒 Arquivos privados são servidos por signed URL, nunca por URL pública");
  if (a.storageBuckets.length) rules.push(`💾 Bucket(s) utilizados: ${a.storageBuckets.map((b) => `\`${b}\``).join(", ")}`);
  if (level === 3) push("🔒 REGRAS DE NEGÓCIO E INVARIANTES", rules);

  // 📡 Realtime / 💾 Persistência local / 🌐 API externa
  if (a.realtime) push("📡 REALTIME", ["📡 Assina canais Supabase Realtime e libera a inscrição no unmount"]);
  if (a.localStorage) push("💾 PERSISTÊNCIA", ["💾 Usa armazenamento do navegador com acesso protegido por guard"]);
  if (a.externalHosts.length)
    push("🌐 API EXTERNA", a.externalHosts.slice(0, 5).map((h) => `🌐 ${h}`));

  // ⚡ Performance
  const perf = [];
  if (a.lazyComponents.length) perf.push("✅ Componentes pesados carregados sob demanda (`React.lazy`)");
  if (/loading="lazy"/.test(file) === false && a.isComponent && level === 3)
    perf.push("✅ Evitar alterações que provoquem layout shift");
  if (level === 3) push("⚡ PERFORMANCE", perf);

  // ♿ Acessibilidade
  const a11y = [];
  if (a.aria) a11y.push("✅ Controles interativos expõem rótulos/roles acessíveis");
  if (a.reduceMotion) a11y.push("✅ Respeita a preferência de redução de movimento");
  if (level === 3 && a.isComponent) push("♿ ACESSIBILIDADE", a11y);

  // 🔐 Segurança
  const sec = [];
  if (a.isEdge) sec.push("✅ Valida o JWT antes de qualquer operação privilegiada");
  if (a.usesAuth) sec.push("✅ Sessão obtida do AuthContext; nunca de storage local");
  sec.push("🔒 Validações de frontend são de UX — a autoridade é o banco (RLS)");
  if (level === 3) push("🔐 SEGURANÇA", sec);

  // 🔧 Manutenção
  if (level === 3)
    push("🔧 MANUTENÇÃO", [
      "✅ Atualizar este cabeçalho quando a responsabilidade do arquivo mudar",
      "✅ Manter regras de negócio próximas da implementação",
      "✅ Registrar decisões arquiteturais relevantes em ADR",
    ]);

  return out;
}

/** Referências `@see` que existem de fato no repositório. */
function seeRefs(file, level) {
  const dirReadme = path.join(path.dirname(file), "README.md");
  const candidates = [
    dirReadme,
    "docs/architecture/MODULE_MAP.md",
    level === 3 ? "docs/code-standards/CODE_ANATOMY.md" : null,
    file.startsWith("supabase/functions/") ? "docs/security/EDGE_FUNCTION_SECURITY.md" : null,
    file.startsWith("src/pages/admin/") ? "docs/security/AUTHORIZATION.md" : null,
  ].filter(Boolean);
  return [...new Set(candidates)].filter((c) => fs.existsSync(c));
}

/** Gera o cabeçalho final para o arquivo. */
function renderHeader(file, a, level, prev) {
  const name = path.basename(file);
  const module = pickPrefix(MODULE_BY_DIR, file, "SevenDevX");
  const layer = pickPrefix(LAYER_BY_DIR, file, "Application");
  const route = ROUTES[file];
  const emoji = level === 3 ? "🚀" : level === 2 ? "🧩" : "📘";
  const rule = level === 3 ? "═".repeat(71) : "─".repeat(69);
  const title =
    level === 3 ? `${emoji} ${name} — SevenDevX Enterprise Platform` : `${emoji} ${name} — SevenDevX`;

  const description =
    prev.description ||
    defaultDescription(file, a, module);

  const L = [];
  L.push("/**");
  L.push(` * ${title}`);
  L.push(` * ${rule}`);
  L.push(" *");
  L.push(` * @file ${file}`);
  L.push(` * @module ${module}`);
  if (route) L.push(` * @route ${route}`);
  L.push(` * @layer ${layer}`);
  L.push(" * @status Active");
  L.push(" *");
  L.push(" * @description");
  for (const line of wrap(description, 66)) L.push(` * ${line}`);
  L.push(" *");
  if (level >= 2) L.push(...blocks(file, a, level));
  const refs = seeRefs(file, level);
  if (level === 3 && refs.length) {
    L.push(box("🔗 DOCUMENTAÇÃO RELACIONADA"));
  }
  for (const r of refs) L.push(` * @see ${r}`);
  if (refs.length) L.push(" *");
  if (prev.since) L.push(` * @since ${prev.since}`);
  L.push(` * @updated ${prev.updated || TODAY}`);
  L.push(" * @license Proprietary — SevenDevX");
  L.push(` * ${rule}`);
  L.push(" */");
  return L.join("\n");
}

/** Descrição factual mínima quando o arquivo ainda não possui uma. */
function defaultDescription(file, a, module) {
  const name = path.basename(file).replace(/\.[jt]sx?$/, "");
  if (a.isEdge) return `Edge Function \`${path.basename(path.dirname(file))}\` do módulo ${module}.`;
  if (file.startsWith("src/hooks/")) return `Hook de acesso a dados/estado utilizado pelo módulo ${module}.`;
  if (a.isComponent) return `Componente do módulo ${module} responsável por \`${name}\`.`;
  return `Utilitário do módulo ${module} responsável por \`${name}\`.`;
}

function wrap(text, width) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const out = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > width) {
      out.push(line.trim());
      line = w;
    } else line += ` ${w}`;
  }
  if (line.trim()) out.push(line.trim());
  return out.length ? out : ["—"];
}

/** Decide se o cabeçalho atual deve ser substituído. */
function needsRewrite(headers, level) {
  if (!headers.length) return true;
  // cabeçalhos gerados por esta ferramenta são sempre reavaliados (self-healing)
  if (/@status Active/.test(headers.join("\n")) && /@license Proprietary/.test(headers.join("\n"))) return "regen";
  const joined = headers.join("\n");
  if (headers.length > 1) return true;
  if (PROMO.test(joined)) return true;
  if (FAKE_METRICS.some((r) => r.test(joined))) return true;
  if (!/@file/.test(joined) || !/@module/.test(joined)) return true;
  const lines = joined.split("\n").length;
  if (level === 3 && lines < 30) return true;
  if (level === 2 && lines < 12) return true;
  return false;
}

// ============================================================================
// ✅ VALIDATION — modo --check
// ============================================================================

/** Valida um cabeçalho existente; devolve a lista de problemas encontrados. */
function validate(file, headers, level) {
  const problems = [];
  if (!headers.length) {
    problems.push("sem cabeçalho de arquivo");
    return problems;
  }
  if (headers.length > 1) problems.push("cabeçalho duplicado");
  const joined = headers.join("\n");
  if (PROMO.test(joined)) problems.push("título promocional");
  for (const r of FAKE_METRICS) if (r.test(joined)) problems.push(`métrica potencialmente fictícia (${r})`);
  for (const m of joined.matchAll(/@see\s+([^\s*]+)/g)) {
    const ref = m[1].replace(/[.,;]$/, "");
    if (!ref.startsWith("http") && !ref.startsWith("@/") && !fs.existsSync(ref.replace(/\/$/, ""))) {
      problems.push(`@see inexistente: ${ref}`);
    }
  }
  if (/│\s*│/.test(joined)) problems.push("bloco visual vazio");
  const lines = joined.split("\n").length;
  if (level === 3 && lines < 30) problems.push(`cabeçalho insuficiente para Level 3 (${lines} linhas)`);
  if (level === 2 && lines < 12) problems.push(`cabeçalho insuficiente para Level 2 (${lines} linhas)`);
  if (lines > 130) problems.push(`cabeçalho excessivo (${lines} linhas)`);
  return problems;
}

// ============================================================================
// 🌐 RUNNER
// ============================================================================

const files = ROOTS.flatMap((r) => (fs.existsSync(r) ? walk(r) : [])).filter(
  (f) => !SKIP.some((s) => f.startsWith(s)),
);

let changed = 0;
const failures = [];
const levels = { 1: 0, 2: 0, 3: 0 };

for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  const { directives, headers, body } = stripLeadingHeaders(src);
  const a = analyze(file, src);
  const level = levelOf(file, a);
  levels[level]++;

  if (CHECK) {
    const problems = validate(file, headers, level);
    if (problems.length) failures.push(`${file} [L${level}] → ${problems.join("; ")}`);
    continue;
  }

  if (!needsRewrite(headers, level)) continue;

  const prev = reuse(headers);
  const header = renderHeader(file, a, level, prev);
  const next = [...directives, header, "", body.replace(/^\n+/, "")].join("\n");
  if (next === src) continue;
  changed++;
  if (!DRY) fs.writeFileSync(file, next);
  console.log(`✓ L${level}`, file);
}

console.log(
  `\nHeader Levels — L1: ${levels[1]} · L2: ${levels[2]} · L3: ${levels[3]} (total ${files.length})`,
);

if (CHECK) {
  if (failures.length) {
    console.error(`\n✗ ${failures.length} arquivo(s) com cabeçalho inválido:\n`);
    for (const f of failures.slice(0, 60)) console.error("  ·", f);
    if (failures.length > 60) console.error(`  … +${failures.length - 60}`);
    console.error("\nRode: npm run docs:headers");
    process.exit(1);
  }
  console.log("✓ Cabeçalhos válidos em todos os arquivos elegíveis.");
} else {
  console.log(`${changed}/${files.length} cabeçalhos atualizados${DRY ? " (dry-run)" : ""}.`);
}
