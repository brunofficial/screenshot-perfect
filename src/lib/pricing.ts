export const SECOND_HOUR_DISCOUNT = 0.4;

export function priceBreakdown(base: number, hours: 1 | 2) {
  const first = base;
  const second = hours === 2 ? Math.round(base * (1 - SECOND_HOUR_DISCOUNT) * 100) / 100 : 0;
  const discount = hours === 2 ? base - second : 0;
  return { first, second, discount, full: base * hours, total: first + second };
}

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 2 });
