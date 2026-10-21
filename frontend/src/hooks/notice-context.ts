import { createContext, useContext } from 'react'

export type NoticeKind = 'success' | 'error'

export interface Notice {
  id: number
  kind: NoticeKind
  text: string
  // Título curto do aviso ("Condição alterada"); o texto detalha.
  title?: string
}

export interface NoticeContextValue {
  notices: Notice[]
  notify: (kind: NoticeKind, text: string, title?: string) => void
  dismiss: (id: number) => void
}

export const NoticeContext = createContext<NoticeContextValue | null>(null)

export function useNotice(): NoticeContextValue {
  const context = useContext(NoticeContext)
  if (!context) {
    throw new Error('useNotice precisa estar dentro do NoticeProvider.')
  }
  return context
}
