// Todo dinheiro do sistema é calculado em centavos inteiros. Assim a gente
// foge das surpresas do float (0.1 + 0.2 e companhia) e o arredondamento
// fica exatamente como o enunciado pede.

export function toCents(value: number): number {
  return Math.round(value * 100);
}

export function fromCents(cents: number): number {
  return cents / 100;
}

// Valor em centavos no formato das colunas DECIMAL do banco ("261.15").
export function centsToDecimalString(cents: number): string {
  return (cents / 100).toFixed(2);
}

// Divide dois inteiros e arredonda o resultado para o inteiro mais próximo.
// Quando cai exatamente no meio (…,5), arredonda para LONGE do zero:
// 14,775 vira 14,78 e -14,775 vira -14,78, que é a regra do enunciado.
export function roundDivision(numerator: number, denominator: number): number {
  const sign = Math.sign(numerator) * Math.sign(denominator);
  const absNumerator = Math.abs(numerator);
  const absDenominator = Math.abs(denominator);
  const rounded = Math.floor(
    (2 * absNumerator + absDenominator) / (2 * absDenominator),
  );
  return sign * rounded;
}
