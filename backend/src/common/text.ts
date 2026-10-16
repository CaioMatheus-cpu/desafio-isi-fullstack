// Chave para ordenar nomes como o enunciado manda: minúsculas, sem acento
// (decompõe em NFD e tira as marcas) e comparação caractere a caractere pela
// ordem Unicode. Nessa ordem o espaço vem antes do hífen, e o hífen antes das
// letras: "Ana Lima" fica antes de "Ana-Maria".
export function nameSortKey(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .toLowerCase();
}

export function compareText(a: string, b: string): number {
  if (a < b) {
    return -1;
  }
  return a > b ? 1 : 0;
}
