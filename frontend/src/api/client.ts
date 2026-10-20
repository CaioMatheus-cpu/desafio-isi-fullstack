import { API_URL } from '../config'

// Erro devolvido pela API (ou falha de rede). A mensagem é a que a API
// mandou no campo `message`, para ser mostrada ao usuário como veio.
export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const NETWORK_ERROR = 'Não foi possível conectar à API. Verifique se ela está no ar.'
const UNKNOWN_ERROR = 'Ocorreu um erro inesperado.'

type Query = Record<string, string | number | boolean | undefined>

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  query?: Query
  body?: unknown
}

// Monta a query string sem os parâmetros vazios: o que não foi preenchido
// simplesmente não filtra.
function buildQuery(query: Query = {}): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') {
      params.set(key, String(value))
    }
  }
  const text = params.toString()
  return text ? `?${text}` : ''
}

async function send(path: string, options: RequestOptions): Promise<Response> {
  const hasBody = options.body !== undefined
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}${buildQuery(options.query)}`, {
      method: options.method ?? 'GET',
      headers: hasBody ? { 'Content-Type': 'application/json' } : undefined,
      body: hasBody ? JSON.stringify(options.body) : undefined,
    })
  } catch {
    throw new ApiError(0, NETWORK_ERROR)
  }

  if (!response.ok) {
    throw new ApiError(response.status, await readErrorMessage(response))
  }
  return response
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json()
    const message = (body as { message?: unknown }).message
    return typeof message === 'string' && message ? message : UNKNOWN_ERROR
  } catch {
    return UNKNOWN_ERROR
  }
}

// Pedido que devolve JSON (ou nada, no caso do 204).
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await send(path, options)
  if (response.status === 204) {
    return undefined as T
  }
  return (await response.json()) as T
}

// Pedido que devolve um arquivo, como o CSV do histórico.
export async function download(
  path: string,
  query?: Query,
): Promise<{ blob: Blob; filename: string }> {
  const response = await send(path, { query })
  const disposition = response.headers.get('Content-Disposition') ?? ''
  const filename = /filename="?([^";]+)"?/.exec(disposition)?.[1] ?? 'arquivo.csv'
  return { blob: await response.blob(), filename }
}
