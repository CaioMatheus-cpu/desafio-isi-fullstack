import { calculateOverall } from './overall';
import { PlayerAttributes, PlayerPosition } from './player.types';

function attributes(
  pace: number,
  shooting: number,
  passing: number,
  dribbling: number,
  defending: number,
  physical: number,
): PlayerAttributes {
  return { pace, shooting, passing, dribbling, defending, physical };
}

describe('calculateOverall', () => {
  // Casos da tabela do enunciado (RN06).
  it.each<[PlayerPosition, PlayerAttributes, number]>([
    ['MEI', attributes(68, 65, 80, 78, 52, 60), 73],
    ['ATA', attributes(78, 75, 73, 82, 48, 68), 76],
    ['LAT', attributes(72, 70, 78, 76, 70, 66), 72],
    ['ZAG', attributes(50, 90, 60, 40, 80, 75), 73], // 72,50 sobe
    ['GOL', attributes(55, 30, 65, 40, 72, 68), 68],
  ])('%s => %i', (position, attrs, expected) => {
    expect(calculateOverall(position, attrs)).toBe(expected);
  });

  it('o mesmo jogador tem overall diferente se a posição mudar', () => {
    const attrs = attributes(70, 68, 82, 79, 55, 64);
    expect(calculateOverall('MEI', attrs)).toBe(75);
    expect(calculateOverall('ZAG', attrs)).not.toBe(75);
  });
});
