import { BadRequestException } from '@nestjs/common';

export const MAX_ID = 2147483647;
const POSITIVE_INTEGER = /^[1-9][0-9]*$/;

// Lê um parâmetro da query string. Ausente devolve undefined (não filtra);
// presente e vazio, ou repetido (que chega como lista), é erro.
export function readQueryParam(
  raw: Record<string, unknown>,
  name: string,
): string | undefined {
  const value = raw[name];
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== 'string' || value === '') {
    throw new BadRequestException(`${name} está vazio ou repetido.`);
  }
  return value;
}

// Inteiro positivo, só com dígitos, sem sinal, sem zero à esquerda, sem
// ponto e sem expoente: "25" vale; "025", "+5", "1e2" e "2.0" não.
export function parseQueryInteger(
  value: string | undefined,
  name: string,
  min = 1,
  max = MAX_ID,
): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  const number = POSITIVE_INTEGER.test(value) ? Number(value) : NaN;
  if (!Number.isSafeInteger(number) || number < min || number > max) {
    throw new BadRequestException(
      `${name} deve ser um inteiro de ${min} a ${max}.`,
    );
  }
  return number;
}
