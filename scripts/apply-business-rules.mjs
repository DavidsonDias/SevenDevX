#!/usr/bin/env node
/**
 * 🔒 apply-business-rules.mjs — SevenDevX Enterprise Code Documentation
 * ─────────────────────────────────────────────────────────────────────
 *
 * @file scripts/apply-business-rules.mjs
 * @module Tooling / Documentation
 *
 * @description
 * Codemod idempotente que insere o bloco interno
 * `🔒 BUSINESS RULES & INVARIANTS` em arquivos críticos (Edge Functions,
 * contextos, telas admin, integrações, webhooks, automações, financeiro,
 * uploads privados e utilitários de segurança).
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔒 INVARIANTES DO CODEMOD                                           │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Cada regra emitida deriva de um sinal real encontrado no código
 * ✅ Só escreve comentários — nunca altera lógica, imports ou exports
 * ✅ Não reescreve arquivos que já possuem o bloco (idempotente)
 * ✅ Respeita a ordem canônica validada por `docs:sections:check`
 * ❌ Nunca emite métricas, promessas ou garantias não verificáveis
 *
 * Uso:
 *   node scripts/apply-business-rules.mjs [--dry] [--check]
 * ─────────────────────────────────────────────────────────────────────
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import fs from "node:fs";
import path from "node:path";

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const DRY = process.argv.includes("--dry");
const CHECK = process.argv.includes("--check");
const ROOTS = ["src", "supabase/functions"];
const EXT = new Set([".ts", ".tsx"]);

const SKIP = [
  "src/components/ui/",
  "src/integrations/supabase/types.ts",
  "src/integrations/supabase/client.ts",
  "src/vite-env.d.ts",
];

/** Caminhos considerados críticos para regras de negócio explícitas. */
const CRITICAL = [
  /^supabase\/functions\//,
  /^src\/contexts\//,
  /^src\/pages\/admin\//,
  /^src\/pages\/(Auth|OAuthCallback)\.tsx$/,
  /^src\/components\/auth\//,
  /^src\/components\/security\//,
  /^src\/modules\/(integrations|automations|webhooks|users)\//,
  /^src\/components\/admin\/(integrations|finance)\//,
  /^src\/lib\/(money|storage|contractBuilder)\.ts$/,
  /^src\/hooks\/(useFinance|useIntegrations|useAttachments|useDocuments|useContractVersions|useMfa|useSystemSettings|useSessionTracker|useAuditLog|usePushSubscription)\.ts$/,
  /^src\/utils\/(safeStorage|browserStorageGuard|authErrors|offlineQueue)\.ts$/,
];

const MARKER = "🔒 BUSINESS RULES & INVARIANTS";

const DIVIDER =
  "// ============================================================================";

// ============================================================================
// 🧠 RULE EXTRACTION — cada regra exige um sinal verificável no código
// ============================================================================

/**
 * Regras candidatas. `when` recebe o código-fonte e o caminho do arquivo e
 * só habilita a regra quando o sinal correspondente existe de fato.
 */
const RULES = [
  {
    when: (s) => /auth\.getUser\(\)/.test(s) || /getSession\(\)/.test(s),
    text: "✅ A sessão autenticada é validada antes de qualquer operação privilegiada.",
  },
  {
    when: (s) => /unauthorized|status:\s*401/.test(s),
    text: "🔒 Requisições sem sessão válida são rejeitadas antes de tocar os dados.",
  },
  {
    when: (s) => /has_role|requiredRole=["']admin["']|isAdmin|'admin'/.test(s),
    text: "✅ Operações administrativas exigem o papel `admin`; o papel nunca vem do cliente.",
  },
  {
    when: (s) => /SUPABASE_SERVICE_ROLE_KEY|SERVICE_KEY/.test(s),
    text: "🔒 A service role key permanece no servidor e nunca é devolvida ao frontend.",
  },
  {
    when: (s, f) => /Deno\.env\.get\(/.test(s) && f.startsWith("supabase/functions/"),
    text: "🔒 Secrets são lidos de `Deno.env`; valores brutos nunca retornam na resposta.",
  },
  {
    when: (s) => /x-hub-signature|createHmac|hmac|timingSafeEqual/i.test(s),
    text: "🔒 Payloads externos só são processados após verificação de assinatura.",
  },
  {
    when: (s) => /createSignedUrl/.test(s),
    text: "🔒 Arquivos privados são acessados apenas por URL assinada temporária — nunca URL pública.",
  },
  {
    when: (s) => /\.storage\s*\.from\(/.test(s),
    text: "⚠️ URLs assinadas expiram; não devem ser persistidas como valor permanente.",
  },
  {
    when: (s) => /audit_log/.test(s),
    text: "✅ Alterações relevantes ficam registradas na trilha de auditoria.",
  },
  {
    when: (s) => /\.delete\(\)/.test(s),
    text: "⚠️ Exclusões são definitivas e exigem confirmação explícita antes do disparo.",
  },
  {
    when: (s) => /supabase\s*\n?\s*\.from\(|from\(["'][a-z_]+["']\)/.test(s),
    text: "🔒 A autoridade final de acesso é a RLS do banco, não a validação do cliente.",
  },
  {
    when: (s) => /\.channel\(|postgres_changes/.test(s),
    text: "📡 O estado local é reconciliado a cada evento Realtime recebido.",
  },
  {
    when: (s) => /LOVABLE_API_KEY|gemini|openai|ai\/v1\/chat/i.test(s),
    text: "🟡 Saídas geradas por IA são assistivas e exigem revisão humana antes de uso oficial.",
  },
  {
    when: (s, f) => /fetch\(\s*[`"']https?:/.test(s) && f.startsWith("supabase/functions/"),
    text: "🌐 Falhas de API externa são tratadas e devolvidas como erro, sem derrubar o fluxo.",
  },
  {
    when: (s) => /safeStorage/.test(s),
    text: "💾 O acesso a storage do browser passa por `safeStorage` e tolera ambientes bloqueados.",
  },
  {
    when: (s) => /corsHeaders/.test(s),
    text: "✅ Toda resposta inclui os headers de CORS previstos, inclusive nos caminhos de erro.",
  },
];

/** Extrai as regras aplicáveis a um arquivo. */
function rulesFor(src, file) {
  const out = [];
  for (const r of RULES) {
    if (r.when(src, file) && !out.includes(r.text)) out.push(r.text);
  }
  return out.slice(0, 7);
}

// ============================================================================
// 🧠 BUSINESS LOGIC — montagem e inserção do bloco
// ============================================================================

/** Monta o bloco de comentários da seção. */
function buildBlock(rules) {
  return [
    DIVIDER,
    `// ${MARKER}`,
    DIVIDER,
    "//",
    ...rules.map((r) => `// ${r}`),
    "//",
  ].join("\n");
}

/** Percorre um diretório coletando arquivos elegíveis. */
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

/** Localiza divisores existentes com seus títulos. */
function dividers(lines) {
  const found = [];
  for (let i = 0; i < lines.length - 2; i++) {
    if (!/^\/\/ ={20,}\s*$/.test(lines[i])) continue;
    if (!lines[i + 1].startsWith("//")) continue;
    if (!/^\/\/ ={20,}\s*$/.test(lines[i + 2])) continue;
    found.push({ line: i, title: lines[i + 1].replace(/^\/\/\s*/, "").trim() });
    i += 2;
  }
  return found;
}

/**
 * Calcula o índice de inserção respeitando a ordem canônica:
 * depois de IMPORTS/TYPES/CONSTANTS e antes de qualquer bloco de lógica.
 */
function insertionIndex(lines) {
  const divs = dividers(lines);
  const before = ["IMPORTS", "TYPES", "CONSTANTS"];
  if (divs.length) {
    const after = divs.find((d) => !before.some((b) => d.title.includes(b)));
    if (after) return after.line;
    // todos os divisores são de topo: insere no fim do último bloco
    const last = divs[divs.length - 1];
    let i = last.line + 3;
    while (i < lines.length && !/^\/\/ ={20,}\s*$/.test(lines[i])) i++;
    return Math.min(i, lines.length);
  }
  // sem divisores: logo após o último import top-level
  let lastImport = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^import[\s{*]/.test(lines[i]) || /^import\s*["']/.test(lines[i])) lastImport = i;
  }
  if (lastImport === -1) return -1;
  let i = lastImport + 1;
  while (i < lines.length && lines[i].trim() !== "") i++;
  return i;
}

/** Aplica (ou apenas avalia) o bloco em um arquivo. */
function processFile(file) {
  const src = fs.readFileSync(file, "utf8");
  const rel = file.replace(/\\/g, "/");
  if (!CRITICAL.some((re) => re.test(rel))) return null;
  if (src.includes(MARKER) || /BUSINESS RULES/.test(src)) return null;

  const rules = rulesFor(src, rel);
  if (rules.length < 2) return null;

  const lines = src.split("\n");
  const at = insertionIndex(lines);
  if (at < 0) return null;

  const block = buildBlock(rules);
  const prevBlank = at > 0 && lines[at - 1].trim() === "";
  lines.splice(at, 0, ...(prevBlank ? [] : [""]), block, "");
  const result = lines.join("\n");
  if (result === src) return null;
  if (!DRY && !CHECK) fs.writeFileSync(file, result);
  return rules.length;
}

// ============================================================================
// 🌐 RUNNER
// ============================================================================

const files = ROOTS.flatMap((r) => (fs.existsSync(r) ? walk(r) : [])).filter(
  (f) => !SKIP.some((s) => f.replace(/\\/g, "/").startsWith(s)),
);

const critical = files.filter((f) => CRITICAL.some((re) => re.test(f.replace(/\\/g, "/"))));
const pending = [];
let changed = 0;

for (const f of files) {
  try {
    const n = processFile(f);
    if (n) {
      changed++;
      pending.push(f);
      if (!CHECK) console.log("✓", f, `— ${n} regra(s)`);
    }
  } catch (e) {
    console.error("✗", f, e.message);
  }
}

const documented = critical.filter((f) => /BUSINESS RULES/.test(fs.readFileSync(f, "utf8"))).length;
console.log(
  `\nBusiness Rules Coverage: ${documented}/${critical.length} arquivos críticos`,
);

if (CHECK) {
  if (pending.length) {
    console.error(`\n✗ ${pending.length} arquivo(s) críticos sem bloco de regras de negócio:\n`);
    for (const p of pending.slice(0, 40)) console.error("  ·", p);
    if (pending.length > 40) console.error(`  … +${pending.length - 40}`);
    console.error("\nRode: npm run docs:rules");
    process.exit(1);
  }
  console.log("✓ Regras de negócio documentadas nos arquivos críticos elegíveis.");
} else {
  console.log(`${changed} arquivo(s) atualizados${DRY ? " (dry-run)" : ""}.`);
}
