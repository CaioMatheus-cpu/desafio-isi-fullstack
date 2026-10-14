import { calculateBaseValue } from './base-value';

describe('calculateBaseValue', () => {
  // Casos da tabela do enunciado (RN06): overall, potencial, idade.
  it.each<[number, number, number, number]>([
    [75, 86, 25, 40.0],
    [60, 70, 30, 10.0], // fim da primeira faixa
    [61, 70, 30, 12.0], // início da segunda faixa
    [76, 80, 22, 46.0], // 22 anos: não é jovem promessa
    [85, 92, 27, 100.0],
    [70, 84, 21, 34.2], // 21 anos: jovem promessa
    [70, 84, 22, 30.0],
    [45, 90, 18, 3.63], // 3,625 arredonda para longe do zero
    [40, 66, 36, 1.0], // abaixo do piso
  ])(
    'overall %i, potencial %i, idade %i => %f',
    (overall, potential, age, expected) => {
      expect(calculateBaseValue(overall, potential, age)).toBe(expected);
    },
  );
});
