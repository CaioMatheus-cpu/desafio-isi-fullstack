import { Formation, fitsFormation } from './formations';
import { PlayerPosition } from '../../players/domain/player.types';

describe('fitsFormation', () => {
  // Exemplos de escalação da tabela da RN19.
  it.each<[Formation, PlayerPosition[]]>([
    ['3-1', ['GOL', 'ZAG', 'LAT', 'LAT', 'ATA']],
    ['2-2', ['GOL', 'ZAG', 'LAT', 'ATA', 'ATA']],
    ['2-1-1', ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA']],
    ['1-2-1', ['GOL', 'ZAG', 'MEI', 'MEI', 'ATA']],
  ])('aceita %s com %j', (formation, positions) => {
    expect(fitsFormation(positions, formation)).toBe(true);
  });

  it('a ordem dos jogadores não importa', () => {
    expect(fitsFormation(['ATA', 'MEI', 'LAT', 'ZAG', 'GOL'], '2-1-1')).toBe(
      true,
    );
  });

  it('a defesa pode ser qualquer mistura de ZAG e LAT', () => {
    expect(fitsFormation(['GOL', 'ZAG', 'ZAG', 'ZAG', 'ATA'], '3-1')).toBe(
      true,
    );
    expect(fitsFormation(['GOL', 'LAT', 'LAT', 'LAT', 'ATA'], '3-1')).toBe(
      true,
    );
  });

  it.each<[string, Formation, PlayerPosition[]]>([
    ['sem goleiro', '2-1-1', ['ZAG', 'LAT', 'MEI', 'ATA', 'ATA']],
    ['dois goleiros', '2-1-1', ['GOL', 'GOL', 'ZAG', 'MEI', 'ATA']],
    [
      'setor errado: 2-2 com um meia',
      '2-2',
      ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA'],
    ],
    ['defesa a menos', '3-1', ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA']],
    ['só 4 jogadores', '2-1-1', ['GOL', 'ZAG', 'MEI', 'ATA']],
    ['6 jogadores', '2-1-1', ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA', 'ATA']],
  ])('recusa %s', (_motivo, formation, positions) => {
    expect(fitsFormation(positions, formation)).toBe(false);
  });
});
