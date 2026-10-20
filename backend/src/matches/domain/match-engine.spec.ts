import { PlayerAttributes } from '../../players/domain/player.types';
import { buildTeam, Fielder, playMatch } from './match-engine';

const attrs = (partial: Partial<PlayerAttributes>): PlayerAttributes => ({
  pace: 50,
  shooting: 50,
  passing: 50,
  dribbling: 50,
  defending: 50,
  physical: 50,
  ...partial,
});

const fielder = (
  playerId: number,
  name: string,
  position: Fielder['position'],
  partial: Partial<PlayerAttributes>,
  condition: Fielder['condition'] = 'APTO',
): Fielder => ({
  playerId,
  name,
  position,
  condition,
  attributes: attrs(partial),
});

// O exemplo completo da RN20: Águias FC (mandante) x Delta FC (visitante),
// os dois no 2-1-1. O LAT do Águias está MAL_CONDICIONADO.
const aguias = buildTeam(1, [
  fielder(30, 'Rui Prado', 'GOL', { defending: 77 }),
  fielder(32, 'Téo Brandão', 'ZAG', { defending: 84 }),
  fielder(
    31,
    'Davi Lins',
    'LAT',
    { dribbling: 74, defending: 66 },
    'MAL_CONDICIONADO',
  ),
  fielder(33, 'Lauro Neves', 'MEI', { passing: 82 }),
  fielder(34, 'Otto Rangel', 'ATA', { shooting: 75 }),
]);
const delta = buildTeam(2, [
  fielder(40, 'Ivo Teles', 'GOL', { defending: 72 }),
  fielder(41, 'Hugo Vaz', 'ZAG', { defending: 84 }),
  fielder(42, 'Lino Matos', 'LAT', { dribbling: 79, defending: 63 }),
  fielder(43, 'Nei Soares', 'MEI', { passing: 70 }),
  fielder(44, 'Ugo Falcão', 'ATA', { shooting: 81 }),
]);

describe('playMatch (exemplo da RN20)', () => {
  const outcome = playMatch(aguias, delta);

  it('o placar é Águias 1 x 2 Delta e o resultado é VISITANTE', () => {
    expect(outcome.homeGoals).toBe(1);
    expect(outcome.awayGoals).toBe(2);
    expect(outcome.result).toBe('VISITANTE');
  });

  it('são sempre 6 duelos, numerados de 1 a 6', () => {
    expect(outcome.duels.map((d) => d.order)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it.each<[number, string, string, number, number, boolean]>([
    [1, 'Otto Rangel', 'Ivo Teles', 75, 72, true],
    [2, 'Lauro Neves', 'Hugo Vaz', 82, 84, false],
    [3, 'Davi Lins', 'Lino Matos', 63, 63, false], // empate não é gol
    [4, 'Ugo Falcão', 'Rui Prado', 81, 77, true],
    [5, 'Nei Soares', 'Téo Brandão', 70, 84, false],
    [6, 'Lino Matos', 'Davi Lins', 79, 56, true], // 66 x 0,85 = 56,1 => 56
  ])(
    'duelo %i: %s contra %s (%i x %i)',
    (order, attacker, defender, attack, defense, goal) => {
      const duel = outcome.duels[order - 1];
      expect(duel.attacker.playerName).toBe(attacker);
      expect(duel.defender.playerName).toBe(defender);
      expect(duel.attacker.value).toBe(attack);
      expect(duel.defender.value).toBe(defense);
      expect(duel.goal).toBe(goal);
    },
  );

  it('os atributos usados seguem a posição do atacante', () => {
    expect(outcome.duels[0].attacker.attribute).toBe('shooting');
    expect(outcome.duels[1].attacker.attribute).toBe('passing');
    expect(outcome.duels[2].attacker.attribute).toBe('dribbling');
    expect(
      outcome.duels.every((d) => d.defender.attribute === 'defending'),
    ).toBe(true);
  });

  it('o duelo de ataque do visitante vem com o clube dele', () => {
    expect(
      outcome.duels.slice(0, 3).every((d) => d.attackingClubId === 1),
    ).toBe(true);
    expect(outcome.duels.slice(3).every((d) => d.attackingClubId === 2)).toBe(
      true,
    );
  });

  it('é determinístico: a mesma partida dá sempre o mesmo resultado', () => {
    expect(playMatch(aguias, delta)).toEqual(outcome);
  });
});

describe('arredondamento do MAL_CONDICIONADO', () => {
  const duelWith = (value: number) => {
    const weak = buildTeam(1, [
      fielder(1, 'Goleiro Um', 'GOL', {}),
      fielder(2, 'Zagueiro Um', 'ZAG', {}),
      fielder(3, 'Lateral Um', 'LAT', {}),
      fielder(4, 'Meia Um', 'MEI', {}),
      fielder(5, 'Ataque Um', 'ATA', { shooting: value }, 'MAL_CONDICIONADO'),
    ]);
    return playMatch(weak, delta).duels[0].attacker.value;
  };

  it.each<[number, number]>([
    [74, 63], // 62,9 => 63
    [50, 43], // 42,5 => 43 (o meio sobe)
    [66, 56], // 56,1 => 56
    [99, 84], // 84,15 => 84 (abaixo do meio)
    [1, 1], // 0,85 => 1
  ])('%i vira %i', (value, expected) => {
    expect(duelWith(value)).toBe(expected);
  });
});

describe('resultado e limites', () => {
  const strong = (id: number) =>
    buildTeam(id, [
      fielder(id * 10, `Goleiro ${id}`, 'GOL', { defending: 99 }),
      fielder(id * 10 + 1, `Zagueiro ${id}`, 'ZAG', { defending: 99 }),
      fielder(id * 10 + 2, `Lateral ${id}`, 'LAT', {
        dribbling: 99,
        defending: 99,
      }),
      fielder(id * 10 + 3, `Meia ${id}`, 'MEI', { passing: 99 }),
      fielder(id * 10 + 4, `Ataque ${id}`, 'ATA', { shooting: 99 }),
    ]);

  it('99 contra 99 é empate de duelo: ninguém marca e o resultado é EMPATE', () => {
    const outcome = playMatch(strong(1), strong(2));
    expect(outcome.homeGoals).toBe(0);
    expect(outcome.awayGoals).toBe(0);
    expect(outcome.result).toBe('EMPATE');
  });

  it('um time pode marcar no máximo 3 gols', () => {
    const weak = buildTeam(2, [
      fielder(21, 'Goleiro Fraco', 'GOL', { defending: 1 }),
      fielder(22, 'Zagueiro Fraco', 'ZAG', { defending: 1 }),
      fielder(23, 'Lateral Fraco', 'LAT', { defending: 1, dribbling: 1 }),
      fielder(24, 'Meia Fraco', 'MEI', { passing: 1 }),
      fielder(25, 'Ataque Fraco', 'ATA', { shooting: 1 }),
    ]);
    const outcome = playMatch(strong(1), weak);
    expect(outcome.homeGoals).toBe(3);
    expect(outcome.awayGoals).toBe(0);
    expect(outcome.result).toBe('MANDANTE');
  });
});

describe('buildTeam', () => {
  it('numera os jogadores de linha do mais recuado ao mais avançado', () => {
    const team = buildTeam(1, [
      fielder(5, 'Ataque Um', 'ATA', {}),
      fielder(2, 'Zagueiro Um', 'ZAG', {}),
      fielder(1, 'Goleiro Um', 'GOL', {}),
      fielder(4, 'Meia Um', 'MEI', {}),
      fielder(3, 'Lateral Um', 'LAT', {}),
    ]);
    expect(team.goalkeeper.position).toBe('GOL');
    expect(team.outfield.map((f) => f.position)).toEqual([
      'ZAG',
      'LAT',
      'MEI',
      'ATA',
    ]);
  });

  it('no 1-2-1, os dois MEI seguem o nome: o primeiro é o 2º jogador de linha', () => {
    const team = buildTeam(1, [
      fielder(1, 'Goleiro Um', 'GOL', {}),
      fielder(2, 'Zagueiro Um', 'ZAG', {}),
      fielder(4, 'Beto Meia', 'MEI', {}),
      fielder(3, 'Ana Meia', 'MEI', {}),
      fielder(5, 'Ataque Um', 'ATA', {}),
    ]);
    expect(team.outfield.map((f) => f.name)).toEqual([
      'Zagueiro Um',
      'Ana Meia',
      'Beto Meia',
      'Ataque Um',
    ]);
  });
});
