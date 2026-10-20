import { ApiError } from '../api/client'

// Texto para mostrar ao usuário quando algo dá errado. Se o erro veio da API,
// vale o `message` que ela devolveu, sem trocar por uma mensagem genérica.
export function messageOf(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Ocorreu um erro inesperado.'
}
