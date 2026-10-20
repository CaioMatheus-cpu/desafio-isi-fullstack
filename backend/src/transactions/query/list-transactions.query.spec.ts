import { BadRequestException } from '@nestjs/common';
import { parseListTransactionsQuery } from './list-transactions.query';

describe('parseListTransactionsQuery', () => {
  it('sem parâmetros não filtra nada', () => {
    expect(parseListTransactionsQuery({})).toEqual({
      types: undefined,
      playerId: undefined,
    });
  });

  it.each<[string, string[]]>([
    ['COMPRA', ['COMPRA']],
    ['VENDA', ['VENDA']],
    ['COMPRA,VENDA', ['COMPRA', 'VENDA']],
    ['VENDA,COMPRA', ['VENDA', 'COMPRA']],
  ])('aceita type=%s', (type, expected) => {
    expect(parseListTransactionsQuery({ type }).types).toEqual(expected);
  });

  it('lê o player_id como número', () => {
    expect(parseListTransactionsQuery({ player_id: '12' }).playerId).toBe(12);
  });

  it('ignora parâmetros desconhecidos', () => {
    expect(() => parseListTransactionsQuery({ outro: 'x' })).not.toThrow();
  });

  it.each<[string, Record<string, unknown>]>([
    ['type vazio', { type: '' }],
    ['type em minúsculas', { type: 'compra' }],
    ['type misturado', { type: 'COMPRA,venda' }],
    ['type com espaço', { type: 'COMPRA, VENDA' }],
    ['type repetido', { type: 'COMPRA,COMPRA' }],
    ['type desconhecido', { type: 'TROCA' }],
    ['type com vírgula sobrando', { type: 'COMPRA,' }],
    ['type repetido na URL', { type: ['COMPRA', 'VENDA'] }],
    ['player_id vazio', { player_id: '' }],
    ['player_id zero', { player_id: '0' }],
    ['player_id negativo', { player_id: '-1' }],
    ['player_id com zero à esquerda', { player_id: '01' }],
    ['player_id decimal', { player_id: '1.5' }],
    ['player_id texto', { player_id: 'abc' }],
  ])('recusa %s com 400', (_motivo, raw) => {
    expect(() => parseListTransactionsQuery(raw)).toThrow(BadRequestException);
  });
});
