/**
 * 🚀 PortfolioBlocksEditor.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/components/admin/PortfolioBlocksEditor.tsx
 * @module SevenOS/Admin
 * @layer Presentation / Admin
 * @status Active
 *
 * @description
 * Editor dirigido por schema de todos os blocos editoriais do Portfólio
 * Davidson servidos por `portfolio-content`: hero, sobre, destaques,
 * skills, stats, navegação, redes, serviços, FAQ, contato, footer, SEO,
 * PWA e feature flags.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔒 REGRAS DE NEGÓCIO E INVARIANTES                                  │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 🔒 Nenhum campo existente é removido no save — o editor faz merge
 * 🔒 Blocos de lista mantêm `sort_order` normalizado (1..n) ao reordenar
 * 🔒 Publicar no painel faz bump de `content_version` (trigger no banco)
 *
 * @updated 2026-08-20
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

type FieldType = "text" | "textarea" | "number" | "bool" | "tags";

type FieldSpec = { key: string; label: string; type?: FieldType; wide?: boolean };

type BlockSpec = {
  key: string;
  label: string;
  hint?: string;
  kind: "object" | "list";
  fields: FieldSpec[];
  titleKey?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BlocksValue = Record<string, any>;

// ============================================================================
// 📐 BUSINESS RULES — schema dos blocos do contrato público
// ============================================================================

const BLOCKS: BlockSpec[] = [
  {
    key: "hero",
    label: "Hero",
    hint: "Primeira dobra do portfólio.",
    kind: "object",
    fields: [
      { key: "greeting", label: "Saudação" },
      { key: "name", label: "Nome exibido" },
      { key: "headline", label: "Headline", wide: true },
      { key: "typewriter_roles", label: "Papéis (typewriter)", type: "tags", wide: true },
      { key: "subtitle", label: "Subtítulo", type: "textarea", wide: true },
      { key: "show_stats", label: "Mostrar números", type: "bool" },
      { key: "background_mode", label: "Fundo (3d / static)" },
    ],
  },
  {
    key: "about",
    label: "Sobre",
    kind: "object",
    fields: [
      { key: "eyebrow", label: "Eyebrow" },
      { key: "title", label: "Título" },
      { key: "bio", label: "Biografia", type: "textarea", wide: true },
      { key: "photo_url", label: "URL da foto", wide: true },
      { key: "photo_alt", label: "Alt da foto", wide: true },
      { key: "manifesto", label: "Manifesto", type: "textarea", wide: true },
    ],
  },
  {
    key: "highlights",
    label: "Destaques",
    hint: "Pilares exibidos na seção Sobre.",
    kind: "list",
    titleKey: "title",
    fields: [
      { key: "icon_key", label: "Ícone (lucide)" },
      { key: "title", label: "Título" },
      { key: "description", label: "Descrição", type: "textarea", wide: true },
    ],
  },
  {
    key: "skills",
    label: "Skills",
    kind: "list",
    titleKey: "name",
    fields: [
      { key: "name", label: "Nome" },
      { key: "category", label: "Categoria" },
      { key: "color", label: "Cor (hex)" },
      { key: "is_featured", label: "Destaque", type: "bool" },
    ],
  },
  {
    key: "stats",
    label: "Números",
    kind: "list",
    titleKey: "label",
    fields: [
      { key: "scope", label: "Seção (hero/about/skills)" },
      { key: "value", label: "Valor" },
      { key: "label", label: "Rótulo" },
    ],
  },
  {
    key: "navigation",
    label: "Navegação",
    hint: "Header, footer e menu mobile.",
    kind: "list",
    titleKey: "label",
    fields: [
      { key: "label", label: "Rótulo" },
      { key: "label_en", label: "Rótulo (EN)" },
      { key: "href", label: "Destino" },
      { key: "location", label: "Local (header/footer)" },
      { key: "is_anchor", label: "Âncora", type: "bool" },
    ],
  },
  {
    key: "links",
    label: "Redes sociais",
    hint: "Fonte única de verdade — o site não deve ter links fixos.",
    kind: "list",
    titleKey: "label",
    fields: [
      { key: "platform", label: "Plataforma" },
      { key: "label", label: "Rótulo" },
      { key: "url", label: "URL", wide: true },
      { key: "brand_color", label: "Cor da marca" },
      { key: "show_in_hero", label: "No hero", type: "bool" },
      { key: "show_in_footer", label: "No footer", type: "bool" },
      { key: "show_in_contact", label: "No contato", type: "bool" },
    ],
  },
  {
    key: "services",
    label: "Serviços",
    kind: "list",
    titleKey: "name",
    fields: [
      { key: "slug", label: "Slug" },
      { key: "name", label: "Nome" },
      { key: "tagline", label: "Tagline", wide: true },
      { key: "price_from", label: "Preço a partir de", type: "number" },
      { key: "price_label", label: "Rótulo de preço" },
      { key: "delivery", label: "Prazo" },
      { key: "features", label: "Features", type: "tags", wide: true },
      { key: "benefits", label: "Benefícios", type: "tags", wide: true },
      { key: "cta_label", label: "CTA" },
      { key: "cta_message", label: "Mensagem WhatsApp", wide: true },
      { key: "is_popular", label: "Mais popular", type: "bool" },
    ],
  },
  {
    key: "faqs",
    label: "FAQ",
    kind: "list",
    titleKey: "question",
    fields: [
      { key: "page", label: "Página" },
      { key: "question", label: "Pergunta", wide: true },
      { key: "answer", label: "Resposta", type: "textarea", wide: true },
    ],
  },
  {
    key: "contact",
    label: "Contato",
    kind: "object",
    fields: [
      { key: "title", label: "Título" },
      { key: "description", label: "Descrição", type: "textarea", wide: true },
      { key: "email", label: "E-mail" },
      { key: "whatsapp", label: "WhatsApp (só dígitos)" },
      { key: "form_enabled", label: "Formulário ativo", type: "bool" },
      { key: "form_destination", label: "Destino do formulário" },
    ],
  },
  {
    key: "footer",
    label: "Footer",
    kind: "object",
    fields: [
      { key: "tagline", label: "Tagline", wide: true },
      { key: "copyright", label: "Copyright", wide: true },
      { key: "show_badge", label: "Mostrar badge", type: "bool" },
    ],
  },
  {
    key: "seo",
    label: "SEO",
    kind: "object",
    fields: [
      { key: "title", label: "Title", wide: true },
      { key: "description", label: "Meta description", type: "textarea", wide: true },
      { key: "keywords", label: "Keywords", type: "tags", wide: true },
      { key: "site_url", label: "Site URL", wide: true },
      { key: "og_image_url", label: "OG image", wide: true },
      { key: "twitter_card", label: "Twitter card" },
    ],
  },
  {
    key: "pwa",
    label: "PWA",
    kind: "object",
    fields: [
      { key: "name", label: "Nome", wide: true },
      { key: "short_name", label: "Nome curto" },
      { key: "description", label: "Descrição", type: "textarea", wide: true },
      { key: "theme_color", label: "Theme color" },
      { key: "background_color", label: "Background color" },
      { key: "start_url", label: "Start URL" },
    ],
  },
  {
    key: "flags",
    label: "Feature flags",
    hint: "Liga e desliga seções do portfólio sem deploy.",
    kind: "object",
    fields: [
      { key: "hero_3d", label: "Hero 3D", type: "bool" },
      { key: "cinematic_intro", label: "Intro cinematográfica", type: "bool" },
      { key: "terminal", label: "Terminal", type: "bool" },
      { key: "blog", label: "Blog", type: "bool" },
      { key: "services", label: "Serviços", type: "bool" },
      { key: "particles", label: "Partículas", type: "bool" },
    ],
  },
];

// ============================================================================
// 🎨 INTERNAL COMPONENTS
// ============================================================================

const inputCls =
  "w-full bg-background/40 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-foreground/40 transition-colors";

function FieldInput({
  spec,
  value,
  onChange,
}: {
  spec: FieldSpec;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (v: any) => void;
}) {
  const label = (
    <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{spec.label}</span>
  );

  if (spec.type === "bool") {
    return (
      <label className="flex items-center gap-2 py-2 cursor-pointer">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="accent-foreground"
        />
        {label}
      </label>
    );
  }

  return (
    <label className={`block space-y-1.5 ${spec.wide ? "sm:col-span-2" : ""}`}>
      {label}
      {spec.type === "textarea" ? (
        <textarea rows={3} className={inputCls} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      ) : spec.type === "tags" ? (
        <textarea
          rows={2}
          className={inputCls}
          placeholder="Um item por linha"
          value={Array.isArray(value) ? value.join("\n") : (value ?? "")}
          onChange={(e) =>
            onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))
          }
        />
      ) : (
        <input
          type={spec.type === "number" ? "number" : "text"}
          className={inputCls}
          value={value ?? ""}
          onChange={(e) => onChange(spec.type === "number" ? Number(e.target.value) : e.target.value)}
        />
      )}
    </label>
  );
}

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

/**
 * Editor completo dos blocos do portfólio.
 *
 * @param value Estado atual de todos os blocos (merge do registro do banco).
 * @param onChange Recebe o estado completo atualizado a cada edição.
 */
export default function PortfolioBlocksEditor({
  value,
  onChange,
}: {
  value: BlocksValue;
  onChange: (next: BlocksValue) => void;
}) {
  const [active, setActive] = useState(BLOCKS[0].key);
  const spec = BLOCKS.find((b) => b.key === active)!;

  const setBlock = (key: string, next: unknown) => onChange({ ...value, [key]: next });

  /** 🔒 Normaliza `sort_order` 1..n após qualquer mutação de lista. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalize = (rows: any[]) => rows.map((r, i) => ({ ...r, sort_order: i + 1 }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const list: any[] = Array.isArray(value[spec.key]) ? value[spec.key] : [];
  const obj = (value[spec.key] ?? {}) as Record<string, unknown>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {BLOCKS.map((b) => (
          <button
            key={b.key}
            onClick={() => setActive(b.key)}
            className={`text-[11px] uppercase tracking-wider rounded-full px-3 py-1.5 border transition-colors ${
              active === b.key
                ? "border-foreground/40 bg-foreground/[0.06] text-foreground"
                : "border-border text-muted-foreground hover:bg-foreground/5"
            }`}
          >
            {b.label}
            {b.kind === "list" ? ` · ${Array.isArray(value[b.key]) ? value[b.key].length : 0}` : ""}
          </button>
        ))}
      </div>

      {spec.hint && <p className="text-[11px] text-muted-foreground">{spec.hint}</p>}

      {spec.kind === "object" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {spec.fields.map((f) => (
            <FieldInput
              key={f.key}
              spec={f}
              value={obj[f.key]}
              onChange={(v) => setBlock(spec.key, { ...obj, [f.key]: v })}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((row, i) => (
            <div key={i} className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium truncate">
                  {row[spec.titleKey ?? "title"] || `Item ${i + 1}`}
                </p>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    aria-label="Subir"
                    disabled={i === 0}
                    onClick={() => {
                      const next = [...list];
                      [next[i - 1], next[i]] = [next[i], next[i - 1]];
                      setBlock(spec.key, normalize(next));
                    }}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    aria-label="Descer"
                    disabled={i === list.length - 1}
                    onClick={() => {
                      const next = [...list];
                      [next[i + 1], next[i]] = [next[i], next[i + 1]];
                      setBlock(spec.key, normalize(next));
                    }}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    aria-label="Remover"
                    onClick={() => setBlock(spec.key, normalize(list.filter((_, j) => j !== i)))}
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {spec.fields.map((f) => (
                  <FieldInput
                    key={f.key}
                    spec={f}
                    value={row[f.key]}
                    onChange={(v) => {
                      const next = [...list];
                      next[i] = { ...row, [f.key]: v };
                      setBlock(spec.key, next);
                    }}
                  />
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={() => setBlock(spec.key, normalize([...list, {}]))}
            className="inline-flex items-center gap-1.5 text-xs border border-foreground/30 rounded px-3 py-1.5 hover:bg-foreground/5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar em {spec.label}
          </button>
        </div>
      )}
    </div>
  );
}
