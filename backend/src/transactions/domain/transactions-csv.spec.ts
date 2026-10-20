import { buildTransactionsCsv, CsvTransaction } from './transactions-csv';

const sale: CsvTransaction = {
  createdAt: '2026-11-05T16:40:00-03:00',
  type: 'VENDA',
  playerName: 'Meia Lua',
  valueCents: 4000,
  feeCents: 30,
  penaltyCents: 400,
  profitCents: 300,
  cashChangeCents: 3570,
};
const purchase: CsvTransaction = {
  createdAt: '2026-11-02T10:15:00-03:00',
  type: 'COMPRA',
  playerName: 'Meia Lua',
  valueCents: 3700,
  feeCents: 185,
  penaltyCents: 0,
  profitCents: null,
  cashChangeCents: -3885,
};

describe('buildTransactionsCsv', () => {
  it('gera exatamente o exemplo do enunciado', () => {
    expect(buildTransactionsCsv([sale, purchase])).toBe(
      'data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa\n' +
        '2026-11-05T16:40:00-03:00;VENDA;Meia Lua;40,00;0,30;4,00;3,00;35,70\n' +
        '2026-11-02T10:15:00-03:00;COMPRA;Meia Lua;37,00;1,85;0,00;;-38,85\n',
    );
  });

  it('sem transações, só o cabeçalho (com LF no fim)', () => {
    expect(buildTransactionsCsv([])).toBe(
      'data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa\n',
    );
  });

  it('lucro nulo fica vazio e lucro negativo leva o sinal', () => {
    const loss: CsvTransaction = {
      ...sale,
      profitCents: -750,
      cashChangeCents: 3400,
    };
    const [, line] = buildTransactionsCsv([loss]).split('\n');
    expect(line.split(';')[6]).toBe('-7,50');
    expect(buildTransactionsCsv([purchase]).split('\n')[1].split(';')[6]).toBe(
      '',
    );
  });

  it('nome com ponto e vírgula vai entre aspas', () => {
    const csv = buildTransactionsCsv([{ ...sale, playerName: 'Ana; Lima' }]);
    expect(csv.split('\n')[1]).toContain(';"Ana; Lima";');
  });

  it('aspas no nome são duplicadas', () => {
    const csv = buildTransactionsCsv([
      { ...sale, playerName: 'Zé "Foguete" Lima' },
    ]);
    expect(csv.split('\n')[1]).toContain(';"Zé ""Foguete"" Lima";');
  });

  it('só usa LF e nunca começa com BOM', () => {
    const csv = buildTransactionsCsv([sale, purchase]);
    expect(csv).not.toContain('\r');
    expect(csv.charCodeAt(0)).not.toBe(0xfeff);
  });
});
