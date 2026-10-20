import { roundDivision } from '../../players/domain/rounding';
import { penaltyRatePercent } from './loyalty';

const PENALTY_CAP_CENTS = 1000;
const COMMISSION_TIER_CENTS = 1000;
const COMMISSION_LOW_PERCENT = 10;
const COMMISSION_HIGH_PERCENT = 20;

export interface SaleInput {
  marketValueCents: number;
  purchaseValueCents: number;
  remainingDays: number;
}

export interface SaleOutcome {
  penaltyRatePercent: number;
  penaltyCents: number;
  profitCents: number;
  commissionCents: number;
  creditCents: number;
}

// RN15: multa = valor de mercado no momento da venda × percentual, arredondada
// e limitada a 10,00 (se o cálculo der mais, a multa é 10,00).
export function calculatePenaltyCents(
  marketValueCents: number,
  ratePercent: number,
): number {
  const penalty = roundDivision(marketValueCents * ratePercent, 100);
  return Math.min(penalty, PENALTY_CAP_CENTS);
}

// RN16: comissão PROGRESSIVA, cobrada só se o lucro for maior que zero.
// 10% sobre a parte do lucro até 10,00, mais 20% sobre a parte acima disso.
// As duas parcelas são somadas e arredondadas uma única vez, no final.
export function calculateCommissionCents(profitCents: number): number {
  if (profitCents <= 0) {
    return 0;
  }
  const lowPart = Math.min(profitCents, COMMISSION_TIER_CENTS);
  const highPart = Math.max(profitCents - COMMISSION_TIER_CENTS, 0);
  return roundDivision(
    lowPart * COMMISSION_LOW_PERCENT + highPart * COMMISSION_HIGH_PERCENT,
    100,
  );
}

// Junta as regras da venda: a multa pela fidelidade que falta, o lucro sobre
// o que foi pago na compra (a taxa de compra não entra), a comissão e o
// crédito que cai no caixa do clube.
export function calculateSale(input: SaleInput): SaleOutcome {
  const ratePercent = penaltyRatePercent(input.remainingDays);
  const penaltyCents = calculatePenaltyCents(
    input.marketValueCents,
    ratePercent,
  );
  const profitCents = input.marketValueCents - input.purchaseValueCents;
  const commissionCents = calculateCommissionCents(profitCents);

  return {
    penaltyRatePercent: ratePercent,
    penaltyCents,
    profitCents,
    commissionCents,
    creditCents: input.marketValueCents - penaltyCents - commissionCents,
  };
}
