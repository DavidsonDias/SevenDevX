/**
 * 💰 money — utilitários multi-moeda BRL/USD/EUR.
 */
export type CurrencyCode = "BRL" | "USD" | "EUR";

export const CURRENCY_SYMBOL: Record<CurrencyCode, string> = {
  BRL: "R$",
  USD: "US$",
  EUR: "€",
};

export const CURRENCY_LOCALE: Record<CurrencyCode, string> = {
  BRL: "pt-BR",
  USD: "en-US",
  EUR: "de-DE",
};

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

export const formatHours = (minutes: number | null | undefined): string => {
  const m = Number(minutes || 0);
  const h = Math.floor(m / 60);
  const r = Math.floor(m % 60);
  return `${h}h${String(r).padStart(2, "0")}`;
};

export const convertToBRL = (
  amount: number,
  currency: CurrencyCode,
  rates: Record<string, number>,
): number => {
  if (currency === "BRL") return amount;
  const rate = rates[currency] || 1;
  return +(amount * rate).toFixed(2);
};
