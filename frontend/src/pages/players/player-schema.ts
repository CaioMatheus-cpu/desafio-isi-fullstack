import { z } from 'zod'
import { POSITIONS } from '../../api/types'

// Número inteiro dentro de um intervalo. `required` é a mensagem de campo vazio
// ("Informe o potencial.") e `range` a de valor fora da faixa.
function integerBetween(required: string, range: string, min: number, max: number) {
  return z.number({ error: required }).int('Use um número inteiro.').min(min, range).max(max, range)
}

const ATTRIBUTE_RANGE = 'Use um valor de 1 a 99.'

// As validações que a tela faz antes de enviar: campos obrigatórios, tamanho do
// nome e faixas numéricas. O que depende de outros dados (como o nome ter pelo
// menos duas palavras, ou a soma dos atributos) continua com a API, que sempre
// valida tudo de novo.
export const playerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Use de 3 a 100 caracteres.')
    .max(100, 'Use de 3 a 100 caracteres.'),
  position: z.enum(POSITIONS, { error: 'Escolha a posição.' }),
  agility: integerBetween('Informe a agilidade.', 'Use uma agilidade de 1 a 100.', 1, 100),
  age: integerBetween('Informe a idade.', 'Use uma idade de 16 a 45 anos.', 16, 45),
  pace: integerBetween('Informe a velocidade.', ATTRIBUTE_RANGE, 1, 99),
  shooting: integerBetween('Informe a finalização.', ATTRIBUTE_RANGE, 1, 99),
  passing: integerBetween('Informe o passe.', ATTRIBUTE_RANGE, 1, 99),
  dribbling: integerBetween('Informe o drible.', ATTRIBUTE_RANGE, 1, 99),
  defending: integerBetween('Informe a defesa.', ATTRIBUTE_RANGE, 1, 99),
  physical: integerBetween('Informe o físico.', ATTRIBUTE_RANGE, 1, 99),
  potential: integerBetween('Informe o potencial.', ATTRIBUTE_RANGE, 1, 99),
})

// Na edição só mudam nome, posição, agilidade e idade: os indicadores e o
// potencial ficam como foram cadastrados.
export const editPlayerSchema = playerSchema.pick({
  name: true,
  position: true,
  agility: true,
  age: true,
})

export type PlayerFormValues = z.infer<typeof playerSchema>

export const ATTRIBUTE_FIELDS = [
  { name: 'pace', label: 'Velocidade' },
  { name: 'shooting', label: 'Finalização' },
  { name: 'passing', label: 'Passe' },
  { name: 'dribbling', label: 'Drible' },
  { name: 'defending', label: 'Defesa' },
  { name: 'physical', label: 'Físico' },
  { name: 'potential', label: 'Potencial' },
] as const
