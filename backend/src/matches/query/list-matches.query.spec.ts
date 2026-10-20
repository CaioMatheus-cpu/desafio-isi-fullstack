import { BadRequestException } from '@nestjs/common';
import { parseListMatchesQuery } from './list-matches.query';

describe('parseListMatchesQuery', () => {
  it('sem parâmetros não filtra nada', () => {
    expect(parseListMatchesQuery({})).toEqual({ clubId: undefined });
  });

  it('lê o club_id', () => {
    expect(parseListMatchesQuery({ club_id: '7' })).toEqual({ clubId: 7 });
  });

  it('ignora parâmetros desconhecidos', () => {
    expect(() => parseListMatchesQuery({ outro: 'x' })).not.toThrow();
  });

  it.each(['', '0', '-1', '01', '1.5', 'abc', '2147483648'])(
    'recusa club_id=%p com 400',
    (clubId) => {
      expect(() => parseListMatchesQuery({ club_id: clubId })).toThrow(
        BadRequestException,
      );
    },
  );

  it('recusa club_id repetido na URL', () => {
    expect(() => parseListMatchesQuery({ club_id: ['1', '2'] })).toThrow(
      BadRequestException,
    );
  });
});
