/**
 * money.ts — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/lib/money.ts
 * @module Lib
 *
 * @description
 * Formatação e aritmética monetária (evita erros de ponto flutuante).
 *
 * @see src/lib/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

// ============================================================================
// 🧩 TYPES & CONFIGURATION
// ============================================================================

/** Moedas suportadas pelo módulo financeiro do SevenOS. */
export type CurrencyCode = "BRL" | "USD" | "EUR";

/** Símbolo usado no fallback de formatação (quando `Intl` falha). */
export const CURRENCY_SYMBOL: Record<CurrencyCode, string> = {
  BRL: "R$",
  USD: "US$",
  EUR: "€",
};

/**
 * Locale aplicado a cada moeda.
 *
 * O locale acompanha a moeda, e não o idioma da interface: um valor em EUR
 * deve manter separadores europeus mesmo com a UI em português.
 */
export const CURRENCY_LOCALE: Record<CurrencyCode, string> = {
  BRL: "pt-BR",
  USD: "en-US",
  EUR: "de-DE",
};

// ============================================================================
// 🧠 FORMATTERS & CONVERSION
// ============================================================================

/**
 * Formata um valor monetário para exibição.
 *
 * @param value - Valor na unidade principal da moeda; `null`/`undefined` viram 0.
 * @param currency - Moeda de exibição.
 * @returns String formatada com duas casas decimais.
 *
 * @remarks
 * O `catch` cobre ambientes sem a moeda registrada no ICU: em vez de quebrar a
 * tela financeira, cai para `SÍMBOLO 0.00`.
 */
export const formatMoney = (value: number | null | undefined, currency: CurrencyCode = "BRL"): string => {
  const n = Number(value || 0);
  try {
    return n.toLocaleString(CURRENCY_LOCALE[currency], {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } catch {
    return `${CURRENCY_SYMBOL[currency]} ${n.toFixed(2)}`;
  }
};

/**
 * Converte minutos apontados em duração legível (`12h30`).
 *
 * @param minutes - Total de minutos registrados no time tracking.
 * @returns Duração no formato `Hh MM`, sem arredondar para cima.
 */
export const formatHours = (minutes: number | null | undefined): string => {
  const m = Number(minutes || 0);
  const h = Math.floor(m / 60);
  const r = Math.floor(m % 60);
  return `${h}h${String(r).padStart(2, "0")}`;
};

/**
 * Converte um valor para BRL, moeda base dos relatórios consolidados.
 *
 * @param amount - Valor na moeda de origem.
 * @param currency - Moeda de origem; `BRL` retorna o valor intacto.
 * @param rates - Mapa `moeda → taxa em BRL`. Taxa ausente usa 1, preservando o
 *                valor nominal em vez de zerar a linha do relatório.
 * @returns Valor em BRL arredondado a duas casas.
 */
export const convertToBRL = (
  amount: number,
  currency: CurrencyCode,
  rates: Record<string, number>,
): number => {
  if (currency === "BRL") return amount;
  const rate = rates[currency] || 1;
  return +(amount * rate).toFixed(2);
};
