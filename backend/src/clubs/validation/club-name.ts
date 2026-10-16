import { nameSortKey } from '../../common/text';

const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 60;
const MIN_WORDS = 2;
const MAX_WORDS = 5;

// Só letras (com ou sem acento), espaços, hífen e ponto.
const ALLOWED_CHARACTERS = /^[\p{L} .-]+$/u;
const LETTER = /\p{L}/u;
const ACRONYM_FORMAT = /^[A-Z]{3}$/;

// Devolve o motivo da recusa do nome do clube, ou null se está ok. O nome
// já chega normalizado (espaços repetidos e das pontas tratados). Palavra é
// um trecho sem espaços com pelo menos uma letra.
export function clubNameError(name: string): string | null {
  const length = Array.from(name).length;
  if (length < MIN_NAME_LENGTH || length > MAX_NAME_LENGTH) {
    return `name deve ter de ${MIN_NAME_LENGTH} a ${MAX_NAME_LENGTH} caracteres`;
  }
  if (!ALLOWED_CHARACTERS.test(name)) {
    return 'name só pode ter letras, espaços, hífen e ponto';
  }
  const words = name.split(' ').filter((part) => LETTER.test(part)).length;
  if (words < MIN_WORDS || words > MAX_WORDS) {
    return `name deve ter de ${MIN_WORDS} a ${MAX_WORDS} palavras`;
  }
  return null;
}

// Devolve o motivo da recusa da sigla, ou null se está ok. A sigla tem 3
// letras de A a Z, maiúsculas e sem acento, que aparecem no nome nessa ordem
// (sem diferenciar maiúsculas, minúsculas e acentos). A primeira é a primeira
// letra do nome, e as três não podem ser todas iguais.
export function acronymError(acronym: string, name: string): string | null {
  if (!ACRONYM_FORMAT.test(acronym)) {
    return 'acronym deve ter exatamente 3 letras de A a Z, maiúsculas';
  }
  if (new Set(acronym).size === 1) {
    return 'acronym não pode ter as três letras iguais';
  }
  const normalizedName = nameSortKey(name);
  if (acronym[0].toLowerCase() !== normalizedName[0]) {
    return 'acronym deve começar com a primeira letra do name';
  }
  if (!appearsInOrder(acronym.toLowerCase(), normalizedName)) {
    return 'acronym deve ter letras que aparecem no name, na mesma ordem';
  }
  return null;
}

// As letras da sigla aparecem no nome, uma depois da outra?
function appearsInOrder(letters: string, text: string): boolean {
  let from = 0;
  for (const letter of letters) {
    const found = text.indexOf(letter, from);
    if (found === -1) {
      return false;
    }
    from = found + 1;
  }
  return true;
}
