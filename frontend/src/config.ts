// Endereço da API, com o prefixo /api/v1. Pode ser trocado pela variável
// VITE_API_URL (veja o .env.example).
export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'

// Limite de jogadores por clube (RN14). Só serve para mostrar "6 de 12"; quem
// recusa a 13ª compra é a API.
export const SQUAD_LIMIT = 12
