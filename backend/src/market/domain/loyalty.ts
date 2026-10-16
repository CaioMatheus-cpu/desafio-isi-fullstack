const DAY_MS = 24 * 60 * 60 * 1000;

const MAX_LOYALTY_DAYS = 1095;
const SHORT_TERM_MAX_DAYS = 30;
const MEDIUM_TERM_MAX_DAYS = 180;

// RN15: dias restantes de fidelidade, contados com fração e arredondados
// PARA CIMA. Se o fim já passou (ou é este exato momento), são 0 dias.
// Ex.: 116 dias, 17 horas e 35 minutos contam como 117.
export function remainingDays(loyaltyUntil: Date, now: Date): number {
  const remainingMs = loyaltyUntil.getTime() - now.getTime();
  if (remainingMs <= 0) {
    return 0;
  }
  return Math.floor((remainingMs + DAY_MS - 1) / DAY_MS);
}

// RN15: percentual da multa pelos dias que faltam.
// 0 dia: 0%. De 1 a 30: 5%. De 31 a 180: 10%. De 181 em diante: 20%.
export function penaltyRatePercent(days: number): number {
  if (days <= 0) {
    return 0;
  }
  if (days <= SHORT_TERM_MAX_DAYS) {
    return 5;
  }
  return days <= MEDIUM_TERM_MAX_DAYS ? 10 : 20;
}

// RN: o fim da fidelidade tem que ser depois do momento da compra e até 1.095
// dias depois dele. Devolve o motivo da recusa, ou null se está dentro.
export function loyaltyWindowError(
  loyaltyUntil: Date,
  purchaseMoment: Date,
): string | null {
  if (loyaltyUntil.getTime() <= purchaseMoment.getTime()) {
    return 'loyalty_until deve ser depois do momento da compra.';
  }
  const latest = purchaseMoment.getTime() + MAX_LOYALTY_DAYS * DAY_MS;
  if (loyaltyUntil.getTime() > latest) {
    return `loyalty_until pode ser no máximo ${MAX_LOYALTY_DAYS} dias depois do momento da compra.`;
  }
  return null;
}
