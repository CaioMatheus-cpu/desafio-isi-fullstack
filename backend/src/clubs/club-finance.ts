import {
  PricedPlayer,
  playerMarketValueCents,
} from '../players/player-pricing';

// RN11: valor do elenco é a soma dos valores de mercado dos jogadores do
// clube, e o patrimônio é o caixa mais o valor do elenco. Os dois são
// calculados a cada consulta e nunca gravados. Tudo em centavos.
export function calculateSquadValueCents(players: PricedPlayer[]): number {
  return players.reduce(
    (total, player) => total + playerMarketValueCents(player),
    0,
  );
}

export function calculateNetWorthCents(
  cashCents: number,
  squadValueCents: number,
): number {
  return cashCents + squadValueCents;
}
