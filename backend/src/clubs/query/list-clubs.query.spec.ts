import { BadRequestException } from '@nestjs/common';
import { parseListClubsQuery } from './list-clubs.query';

describe('parseListClubsQuery', () => {
  it('sem sort ordena pelo nome', () => {
    expect(parseListClubsQuery({})).toEqual({ sort: 'name' });
  });

  it.each(['name', 'net_worth_asc', 'net_worth_desc'])('aceita %s', (sort) => {
    expect(parseListClubsQuery({ sort })).toEqual({ sort });
  });

  it('ignora parâmetros desconhecidos', () => {
    expect(parseListClubsQuery({ qualquer: 'coisa' })).toEqual({
      sort: 'name',
    });
  });

  it.each<[string, unknown]>([
    ['vazio', ''],
    ['fora da lista', 'patrimonio'],
    ['maiúsculas', 'NAME'],
    ['dois valores juntos', 'name,net_worth_asc'],
    ['repetido', ['name', 'net_worth_asc']],
  ])('recusa sort %s com 400', (_motivo, sort) => {
    expect(() => parseListClubsQuery({ sort })).toThrow(BadRequestException);
  });
});
