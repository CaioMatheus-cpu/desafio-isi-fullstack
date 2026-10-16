import { acronymError, clubNameError } from './club-name';

describe('clubNameError', () => {
  it.each([
    'Águias FC',
    'Delta FC',
    'Gama SC',
    'Atlético Mineiro Futebol Clube',
    'A. B.',
  ])('aceita %p', (name) => {
    expect(clubNameError(name)).toBeNull();
  });

  it.each<[string, string]>([
    ['uma palavra só', 'Aguias'],
    ['mais de 5 palavras', 'Um Dois Tres Quatro Cinco Seis'],
    ['curto demais', 'Ab'],
    ['com número', 'Clube 2 FC'],
    ['com apóstrofo', "D'Ávila FC"],
    ['com tabulação', 'Aguias\tFC'],
    ['longo demais', `${'A'.repeat(40)} ${'B'.repeat(40)}`],
    ['com símbolo', 'Águias & Co'],
  ])('recusa nome %s', (_motivo, name) => {
    expect(clubNameError(name)).not.toBeNull();
  });

  it('só símbolos soltos não contam como palavra', () => {
    expect(clubNameError('Águias - -')).not.toBeNull();
  });
});

describe('acronymError', () => {
  it.each<[string, string]>([
    ['AGU', 'Águias FC'],
    ['DEL', 'Delta FC'],
    ['GAM', 'Gama SC'],
    ['AFC', 'Águias FC'],
    ['DFC', 'Delta FC'],
  ])('aceita %s para %p', (acronym, name) => {
    expect(acronymError(acronym, name)).toBeNull();
  });

  it.each<[string, string, string]>([
    ['minúsculas', 'agu', 'Águias FC'],
    ['com acento', 'ÁGU', 'Águias FC'],
    ['com 2 letras', 'AG', 'Águias FC'],
    ['com 4 letras', 'AGUI', 'Águias FC'],
    ['letras iguais', 'AAA', 'Aaa FC'],
    ['não começa com a letra do nome', 'GUI', 'Águias FC'],
    ['letras fora de ordem', 'AUG', 'Águias FC'],
    ['letra que não está no nome', 'AXE', 'Águias FC'],
    ['com número', 'AG1', 'Águias FC'],
  ])('recusa sigla %s', (_motivo, acronym, name) => {
    expect(acronymError(acronym, name)).not.toBeNull();
  });
});
