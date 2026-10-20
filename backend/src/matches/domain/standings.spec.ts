import { calculateStandings, PlayedMatch, StandingClub } from './standings';

// O exemplo da RN21: 6 clubes e 4 partidas. Mangue FC e Tubarões EC ainda
// não jogaram.
const clubs: StandingClub[] = [
  { id: 1, name: 'Águias FC' },
  { id: 2, name: 'Delta FC' },
  { id: 3, name: 'Gama SC' },
  { id: 4, name: 'Épsilon EC' },
  { id: 5, name: 'Mangue FC' },
  { id: 6, name: 'Tubarões EC' },
];
const match = (
  homeClubId: number,
  homeGoals: number,
  awayGoals: number,
  awayClubId: number,
): PlayedMatch => ({ homeClubId, awayClubId, homeGoals, awayGoals });

const matches: PlayedMatch[] = [
  match(1, 1, 2, 2), // Águias FC 1 x 2 Delta FC
  match(3, 2, 1, 4), // Gama SC 2 x 1 Épsilon EC
  match(4, 3, 2, 1), // Épsilon EC 3 x 2 Águias FC
  match(2, 0, 1, 3), // Delta FC 0 x 1 Gama SC
];

describe('calculateStandings (exemplo da RN21)', () => {
  const table = calculateStandings(clubs, matches);

  it('segue a ordem da tabela do enunciado', () => {
    expect(table.map((row) => row.clubName)).toEqual([
      'Gama SC',
      'Épsilon EC',
      'Delta FC',
      'Mangue FC',
      'Tubarões EC',
      'Águias FC',
    ]);
  });

  it('a posição vai de 1 ao total, sem repetir', () => {
    expect(table.map((row) => row.position)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it.each<[string, number, number, number]>([
    ['Gama SC', 6, 2, 3],
    ['Épsilon EC', 3, 0, 4],
    ['Delta FC', 3, 0, 2],
    ['Mangue FC', 0, 0, 0],
    ['Tubarões EC', 0, 0, 0],
    ['Águias FC', 0, -2, 3],
  ])(
    '%s: %i pontos, saldo %i, %i gols marcados',
    (name, points, diff, goalsFor) => {
      const row = table.find((r) => r.clubName === name);
      expect(row?.points).toBe(points);
      expect(row?.goalDifference).toBe(diff);
      expect(row?.goalsFor).toBe(goalsFor);
    },
  );

  it('conta jogos, vitórias, empates e derrotas', () => {
    const delta = table.find((r) => r.clubName === 'Delta FC');
    expect(delta).toMatchObject({
      played: 2,
      wins: 1,
      draws: 0,
      losses: 1,
      goalsFor: 2,
      goalsAgainst: 2,
    });
  });

  it('clubes que não jogaram aparecem zerados', () => {
    const mangue = table.find((r) => r.clubName === 'Mangue FC');
    expect(mangue).toMatchObject({
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
    });
  });
});

describe('calculateStandings: empates', () => {
  it('empate vale 1 ponto para cada lado', () => {
    const table = calculateStandings(clubs.slice(0, 2), [match(1, 2, 2, 2)]);
    expect(table.map((r) => r.points)).toEqual([1, 1]);
    expect(table.every((r) => r.draws === 1)).toBe(true);
  });

  it('sem partidas, o nome decide (sem acento e sem diferenciar caixa)', () => {
    const table = calculateStandings(
      [
        { id: 1, name: 'Zeta FC' },
        { id: 2, name: 'águias FC' },
        { id: 3, name: 'Beta FC' },
      ],
      [],
    );
    expect(table.map((r) => r.clubName)).toEqual([
      'águias FC',
      'Beta FC',
      'Zeta FC',
    ]);
  });

  it('o mesmo confronto repetido conta duas vezes', () => {
    const table = calculateStandings(clubs.slice(0, 2), [
      match(1, 1, 0, 2),
      match(1, 1, 0, 2),
    ]);
    expect(table[0]).toMatchObject({ clubId: 1, played: 2, points: 6 });
  });
});
