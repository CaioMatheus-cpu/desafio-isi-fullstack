import { compareSquadOrder, SquadMember } from './squad-order';

const member = (
  id: number,
  name: string,
  position: SquadMember['position'],
): SquadMember => ({ id, name, position });

describe('compareSquadOrder', () => {
  it('ordena de trás para frente: GOL, ZAG, LAT, MEI, ATA', () => {
    const squad = [
      member(1, 'Ataque Um', 'ATA'),
      member(2, 'Meia Um', 'MEI'),
      member(3, 'Lateral Um', 'LAT'),
      member(4, 'Zagueiro Um', 'ZAG'),
      member(5, 'Goleiro Um', 'GOL'),
    ];
    const ordered = [...squad].sort(compareSquadOrder).map((m) => m.position);
    expect(ordered).toEqual(['GOL', 'ZAG', 'LAT', 'MEI', 'ATA']);
  });

  it('na mesma posição, desempata pelo nome sem acento e sem caixa', () => {
    const squad = [
      member(1, 'Zé Lima', 'MEI'),
      member(2, 'Ângelo Souza', 'MEI'),
      member(3, 'beto Silva', 'MEI'),
    ];
    const names = [...squad].sort(compareSquadOrder).map((m) => m.name);
    expect(names).toEqual(['Ângelo Souza', 'beto Silva', 'Zé Lima']);
  });

  it('o espaço vem antes do hífen: "Ana Lima" antes de "Ana-Maria"', () => {
    const squad = [
      member(1, 'Ana-Maria Souza', 'LAT'),
      member(2, 'Ana Lima', 'LAT'),
    ];
    const names = [...squad].sort(compareSquadOrder).map((m) => m.name);
    expect(names).toEqual(['Ana Lima', 'Ana-Maria Souza']);
  });

  it('com nomes iguais, desempata pelo id', () => {
    const squad = [member(9, 'Meia Lua', 'MEI'), member(3, 'Meia Lua', 'MEI')];
    const ids = [...squad].sort(compareSquadOrder).map((m) => m.id);
    expect(ids).toEqual([3, 9]);
  });
});
