import { compareText, nameSortKey } from '../../common/text';

const WIN_POINTS = 3;
const DRAW_POINTS = 1;

export interface StandingClub {
  id: number;
  name: string;
}

export interface PlayedMatch {
  homeClubId: number;
  awayClubId: number;
  homeGoals: number;
  awayGoals: number;
}

export interface StandingRow {
  position: number;
  clubId: number;
  clubName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

type Tally = Omit<StandingRow, 'position'>;

function emptyTally(club: StandingClub): Tally {
  return {
    clubId: club.id,
    clubName: club.name,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
  };
}

function register(tally: Tally, goalsFor: number, goalsAgainst: number): void {
  tally.played += 1;
  tally.goalsFor += goalsFor;
  tally.goalsAgainst += goalsAgainst;
  tally.goalDifference = tally.goalsFor - tally.goalsAgainst;
  if (goalsFor > goalsAgainst) {
    tally.wins += 1;
    tally.points += WIN_POINTS;
  } else if (goalsFor === goalsAgainst) {
    tally.draws += 1;
    tally.points += DRAW_POINTS;
  } else {
    tally.losses += 1;
  }
}

// RN21: a classificação traz TODOS os clubes, inclusive os que ainda não
// jogaram (zerados). Vitória vale 3 pontos, empate 1 e derrota 0. A ordem é:
// mais pontos, maior saldo de gols, mais gols marcados e, por fim, o nome do
// clube (sem acento, sem diferenciar caixa; nomes iguais, pelo id). A posição
// vai de 1 ao total de clubes, sem repetir. É calculada a cada consulta.
export function calculateStandings(
  clubs: StandingClub[],
  matches: PlayedMatch[],
): StandingRow[] {
  const tallies = new Map(clubs.map((club) => [club.id, emptyTally(club)]));

  for (const match of matches) {
    const home = tallies.get(match.homeClubId);
    const away = tallies.get(match.awayClubId);
    if (home && away) {
      register(home, match.homeGoals, match.awayGoals);
      register(away, match.awayGoals, match.homeGoals);
    }
  }

  return [...tallies.values()]
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.goalDifference - a.goalDifference ||
        b.goalsFor - a.goalsFor ||
        compareText(nameSortKey(a.clubName), nameSortKey(b.clubName)) ||
        a.clubId - b.clubId,
    )
    .map((tally, index) => ({ position: index + 1, ...tally }));
}
