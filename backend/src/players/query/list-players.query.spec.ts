import { BadRequestException } from '@nestjs/common';
import { parseListPlayersQuery } from './list-players.query';

describe('parseListPlayersQuery', () => {
  it('sem parâmetros usa os padrões e não filtra nada', () => {
    expect(parseListPlayersQuery({})).toEqual({
      sort: ['name'],
      page: 1,
      limit: 10,
    });
  });

  it('lê todos os filtros com o tipo certo', () => {
    const query = parseListPlayersQuery({
      search: '  Meia   Lua ',
      position: 'MEI',
      condition: 'APTO',
      free: 'false',
      club_id: '3',
      min_age: '18',
      max_age: '30',
      min_value: '10.5',
      max_value: '100',
      sort: 'value_desc,age_asc',
      page: '2',
      limit: '50',
    });
    expect(query).toEqual({
      search: 'Meia Lua',
      position: 'MEI',
      condition: 'APTO',
      free: false,
      clubId: 3,
      minAge: 18,
      maxAge: 30,
      minValueCents: 1050,
      maxValueCents: 10000,
      sort: ['value_desc', 'age_asc'],
      page: 2,
      limit: 50,
    });
  });

  it('ignora parâmetros que não existem na tabela', () => {
    expect(parseListPlayersQuery({ qualquer: 'coisa' }).page).toBe(1);
  });

  describe('recusa com 400', () => {
    it.each<[string, Record<string, unknown>]>([
      ['parâmetro vazio', { position: '' }],
      ['parâmetro repetido', { position: ['MEI', 'ATA'] }],
      ['search de 1 caractere', { search: 'a' }],
      ['search só com espaços', { search: '   ' }],
      ['search com mais de 100 caracteres', { search: 'a'.repeat(101) }],
      ['search com tabulação', { search: 'ab\tcd' }],
      ['position em minúsculas', { position: 'mei' }],
      ['position inexistente', { position: 'XXX' }],
      ['condition em minúsculas', { condition: 'apto' }],
      ['free em maiúsculas', { free: 'TRUE' }],
      ['free numérico', { free: '1' }],
      ['club_id zero', { club_id: '0' }],
      ['club_id negativo', { club_id: '-1' }],
      ['club_id com zero à esquerda', { club_id: '01' }],
      ['club_id decimal', { club_id: '1.5' }],
      ['club_id com expoente', { club_id: '1e2' }],
      ['club_id acima do limite', { club_id: '2147483648' }],
      ['min_age abaixo de 16', { min_age: '15' }],
      ['max_age acima de 45', { max_age: '46' }],
      ['min_age maior que max_age', { min_age: '30', max_age: '20' }],
      ['min_value com vírgula', { min_value: '10,5' }],
      ['min_value com sinal', { min_value: '+10' }],
      ['min_value com zero à esquerda', { min_value: '010' }],
      ['min_value com 3 casas', { min_value: '10.555' }],
      ['min_value com expoente', { min_value: '1e2' }],
      ['max_value acima de 550', { max_value: '550.01' }],
      ['min_value maior que max_value', { min_value: '50', max_value: '10' }],
      ['free=true com club_id', { free: 'true', club_id: '2' }],
      ['sort inexistente', { sort: 'POSITION' }],
      ['sort com espaço', { sort: 'value_asc, age_asc' }],
      ['sort com 3 critérios', { sort: 'name,value_asc,age_asc' }],
      ['sort repetindo o campo', { sort: 'value_asc,value_desc' }],
      ['sort com vírgula sobrando', { sort: 'name,' }],
      ['page zero', { page: '0' }],
      ['page decimal', { page: '1.0' }],
      ['limit zero', { limit: '0' }],
      ['limit acima de 50', { limit: '51' }],
    ])('%s', (_motivo, raw) => {
      expect(() => parseListPlayersQuery(raw)).toThrow(BadRequestException);
    });
  });

  describe('aceita', () => {
    it.each<[string, Record<string, unknown>]>([
      ['free=false junto com club_id', { free: 'false', club_id: '2' }],
      ['só um dos limites de idade', { min_age: '30' }],
      ['só um dos limites de valor', { max_value: '0.5' }],
      ['valor zero', { min_value: '0' }],
      ['valor 550', { max_value: '550' }],
      ['min_age igual a max_age', { min_age: '25', max_age: '25' }],
      ['limit 1 e 50', { limit: '1' }],
    ])('%s', (_motivo, raw) => {
      expect(() => parseListPlayersQuery(raw)).not.toThrow();
    });

    it('converte valores decimais para centavos sem erro de float', () => {
      expect(parseListPlayersQuery({ min_value: '0.1' }).minValueCents).toBe(
        10,
      );
      expect(parseListPlayersQuery({ min_value: '1.15' }).minValueCents).toBe(
        115,
      );
      expect(parseListPlayersQuery({ max_value: '550' }).maxValueCents).toBe(
        55000,
      );
    });
  });
});
