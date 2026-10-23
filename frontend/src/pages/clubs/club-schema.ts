import { z } from 'zod'

// O que a tela confere antes de enviar: o tamanho do nome e a sigla de 3 letras.
// Se a sigla combina com o nome, ou se o nome já existe, quem diz é a API.
export const clubSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'O nome deve ter de 3 a 60 caracteres.')
    .max(60, 'O nome deve ter de 3 a 60 caracteres.'),
  acronym: z.string().regex(/^[A-Z]{3}$/, 'A sigla deve ter exatamente 3 letras.'),
})
