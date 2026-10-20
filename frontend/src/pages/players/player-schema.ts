import { z } from 'zod'
import { POSITIONS } from '../../api/types'

const NOT_A_NUMBER = 'Informe um número.'

// Número inteiro dentro de um intervalo, com a mensagem de cada falha.
function integerBetween(label: string, min: number, max: number) {
  const range = `${label} deve ser de ${min} a ${max}.`
  return z
    .number({ error: NOT_A_NUMBER })
    .int('Use um número inteiro.')
    .min(min, range)
    .max(max, range)
}

// As validações que a tela faz antes de enviar: campos obrigatórios, tamanho do
// nome e faixas numéricas. O que depende de outros dados (como o nome ter pelo
// menos duas palavras, ou a soma dos atributos) continua com a API, que sempre
// valida tudo de novo.
export const playerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'O nome deve ter de 3 a 100 caracteres.')
    .max(100, 'O nome deve ter de 3 a 100 caracteres.'),
  position: z.enum(POSITIONS, { error: 'Escolha a posição.' }),
  agility: integerBetween('A agilidade', 1, 100),
  age: integerBetween('A idade', 16, 45),
  pace: integerBetween('A velocidade', 1, 99),
  shooting: integerBetween('A finalização', 1, 99),
  passing: integerBetween('O passe', 1, 99),
  dribbling: integerBetween('O drible', 1, 99),
  defending: integerBetween('A defesa', 1, 99),
  physical: integerBetween('O físico', 1, 99),
  potential: integerBetween('O potencial', 1, 99),
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
