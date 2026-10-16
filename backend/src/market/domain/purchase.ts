import { roundDivision } from '../../players/domain/rounding';

const FEE_THRESHOLD_CENTS = 3000;
const FEE_PERCENT = 5;
const MAX_SPEND_DENOMINATOR = 2;

// RN13: taxa de compra de 5% do valor de mercado, arredondada, cobrada
// SOMENTE quando o valor é maior que 30,00. Com exatamente 30,00 não há taxa.
export function calculatePurchaseFeeCents(valueCents: number): number {
  if (valueCents <= FEE_THRESHOLD_CENTS) {
    return 0;
  }
  return roundDivision(valueCents * FEE_PERCENT, 100);
}

// RN13: o custo total não pode passar de 50% do caixa (pode ser igual). Sem
// arredondar nada: com caixa de 261,15 o limite é 130,575, então 130,58 é
// recusado. Por isso a conta é "custo × 2 <= caixa", tudo em centavos.
export function isWithinCashLimit(
  totalCostCents: number,
  cashCents: number,
): boolean {
  return totalCostCents * MAX_SPEND_DENOMINATOR <= cashCents;
}
