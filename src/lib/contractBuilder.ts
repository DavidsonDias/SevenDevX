/**
 * contractBuilder.ts — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/lib/contractBuilder.ts
 * @module Lib
 *
 * @description
 * Montagem do documento de contrato a partir do projeto e cláusulas.
 *
 * @see src/lib/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🧱 contractBuilder — tipos, máscaras e cálculos do Contract Builder profissional.
 */

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

/**
 * Formas de pagamento aceitas em contratos.
 */
export type PaymentMethod = "pix" | "boleto" | "transferencia" | "cartao";
/**
 * Modalidades de entrega do serviço contratado.
 */
export type DeliveryType = "remoto" | "presencial" | "hibrido";

export interface ContractConfig {
  // Identificação
  project_name: string;
  project_scope: string;
  // Cliente
  client_name: string;
  client_document: string;        // CPF/CNPJ
  client_address: string;
  client_email: string;
  // Financeiro
  price_total: number;            // BRL
  installments_count: number;     // ex: 2
  price_entry: number;            // calculado
  price_remaining: number;        // calculado
  payment_method: PaymentMethod;
  pix_key: string;
  // Prazo / SLA
  deadline_days: number;
  delivery_type: DeliveryType;
  revisions_limit: number;
  support_days: number;
  // Outros
  foro: string;
  extras: string;
}

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

export const DEFAULT_CONTRACT_CONFIG: ContractConfig = {
  project_name: "",
  project_scope: "",
  client_name: "",
  client_document: "",
  client_address: "",
  client_email: "",
  price_total: 0,
  installments_count: 2,
  price_entry: 0,
  price_remaining: 0,
  payment_method: "pix",
  pix_key: "contato@sevendevx.com",
  deadline_days: 30,
  delivery_type: "remoto",
  revisions_limit: 2,
  support_days: 15,
  foro: "São Paulo/SP",
  extras: "",
};

// ============================================================================
// 🧠 BUSINESS LOGIC
// ============================================================================

/* ───────── Cálculos ───────── */
export const recalcInstallments = (cfg: ContractConfig): ContractConfig => {
  const total = Number(cfg.price_total) || 0;
  const n = Math.max(1, Number(cfg.installments_count) || 1);
  const entry = +(total * 0.5).toFixed(2);
  const remaining = +(total - entry).toFixed(2);
  return { ...cfg, price_entry: entry, price_remaining: remaining, installments_count: n };
};

/* ───────── Máscaras BR ───────── */
export const maskBRL = (value: number | string): string => {
  const n = typeof value === "string" ? Number(value.replace(/\D/g, "")) / 100 : Number(value);
  if (!Number.isFinite(n)) return "R$ 0,00";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

export const parseBRL = (s: string): number => {
  const digits = (s || "").replace(/\D/g, "");
  if (!digits) return 0;
  return Number(digits) / 100;
};

export const maskDocument = (s: string): string => {
  const v = (s || "").replace(/\D/g, "").slice(0, 14);
  if (v.length <= 11) {
    return v
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return v
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

/* ───────── Validação leve ───────── */
export const validateContract = (cfg: ContractConfig): string[] => {
  const errs: string[] = [];
  if (!cfg.project_name.trim()) errs.push("Nome do projeto");
  if (!cfg.project_scope.trim() || cfg.project_scope.length < 30) errs.push("Escopo (mín. 30 caracteres)");
  if (!cfg.client_name.trim()) errs.push("Nome do cliente");
  if (!cfg.price_total || cfg.price_total <= 0) errs.push("Valor total");
  if (!cfg.deadline_days || cfg.deadline_days <= 0) errs.push("Prazo");
  return errs;
};

/* ───────── Pricing Engine ───────── */
export type ProjectType = "landing_page" | "website" | "system" | "ecommerce" | "mobile";
export type Complexity = "simple" | "medium" | "advanced";
export type PricingFeature =
  | "form" | "api_integration" | "auth" | "dashboard" | "payment"
  | "blog" | "i18n" | "admin_panel" | "ai" | "realtime";

const BASE_PRICE: Record<ProjectType, number> = {
  landing_page: 1800,
  website: 4500,
  system: 12000,
  ecommerce: 9000,
  mobile: 15000,
};
const COMPLEXITY_MULT: Record<Complexity, number> = { simple: 1, medium: 1.6, advanced: 2.4 };
const FEATURE_PRICE: Record<PricingFeature, number> = {
  form: 350, api_integration: 900, auth: 800, dashboard: 1800, payment: 1200,
  blog: 700, i18n: 600, admin_panel: 2200, ai: 2500, realtime: 1400,
};

export interface PricingInput {
  type: ProjectType;
  complexity: Complexity;
  features: PricingFeature[];
}
export interface PricingOutput {
  suggested_price: number;
  breakdown: { label: string; value: number }[];
  weeks_estimate: number;
}

/**
 * Calcula o preço estimado do projeto a partir de tipo, complexidade e recursos.
 *
 * @returns Total e o detalhamento por item que compõe o valor.
 */
export const estimatePrice = ({ type, complexity, features }: PricingInput): PricingOutput => {
  const base = BASE_PRICE[type] * COMPLEXITY_MULT[complexity];
  const breakdown: PricingOutput["breakdown"] = [
    { label: `Base (${type.replace("_", " ")} · ${complexity})`, value: +base.toFixed(2) },
  ];
  let total = base;
  features.forEach((f) => {
    const v = FEATURE_PRICE[f];
    breakdown.push({ label: `Feature: ${f}`, value: v });
    total += v;
  });
  // arredonda para múltiplos de 50
  const suggested = Math.round(total / 50) * 50;
  const weeks = Math.max(1, Math.round(suggested / 1500));
  return { suggested_price: suggested, breakdown, weeks_estimate: weeks };
};
