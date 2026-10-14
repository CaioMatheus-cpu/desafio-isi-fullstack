const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 100;
const MIN_WORDS = 2;

const DIGITS = /[0-9]/;
const LETTER = /\p{L}/u;

// V4: espaços repetidos viram um só e os das pontas somem. Só o espaço
// comum (U+0020) conta aqui: tabulação e quebra de linha são caracteres de
// controle e o enunciado manda recusar, então não podemos "limpar" eles.
export function normalizeName(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }
  return value.replace(/ +/g, ' ').replace(/^ | $/g, '');
}

// Caracteres de controle: de U+0000 a U+001F e de U+007F a U+009F.
function hasControlCharacters(value: string): boolean {
  return Array.from(value).some((character) => {
    const code = character.codePointAt(0) ?? 0;
    return code <= 0x1f || (code >= 0x7f && code <= 0x9f);
  });
}

// Devolve o motivo da recusa, ou null se o nome do jogador está ok.
// Palavra, no enunciado, é um trecho sem espaços com pelo menos uma letra.
export function playerNameError(value: string): string | null {
  const length = Array.from(value).length;
  if (length < MIN_NAME_LENGTH || length > MAX_NAME_LENGTH) {
    return `name deve ter de ${MIN_NAME_LENGTH} a ${MAX_NAME_LENGTH} caracteres`;
  }
  if (hasControlCharacters(value)) {
    return 'name não pode ter caracteres de controle';
  }
  if (DIGITS.test(value)) {
    return 'name não pode ter números';
  }
  const words = value.split(' ').filter((part) => LETTER.test(part));
  if (words.length < MIN_WORDS) {
    return `name deve ter pelo menos ${MIN_WORDS} palavras`;
  }
  return null;
}
