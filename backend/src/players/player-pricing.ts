import { Player } from '../database/entities/player.entity';
import { calculateMarketValueCents } from './domain/market-value';
import { PlayerCondition } from './domain/player.types';

export type PricedPlayer = Pick<
  Player,
  'baseValue' | 'condition' | 'agility' | 'age'
>;

// Valor de mercado do jogador, em centavos, com os dados de agora. É o preço
// de uma compra e a parcela que cada jogador soma no valor do elenco.
export function playerMarketValueCents(player: PricedPlayer): number {
  return calculateMarketValueCents(
    Number(player.baseValue),
    player.condition as PlayerCondition,
    player.agility,
    player.age,
  );
}
