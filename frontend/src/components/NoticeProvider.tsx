import { useCallback, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { NoticeContext } from '../hooks/notice-context'
import type { Notice, NoticeKind } from '../hooks/notice-context'

const VISIBLE_MS = 7000

// Guarda os avisos de sucesso e de erro e os mostra no topo da tela, em
// qualquer página. Cada aviso some sozinho depois de alguns segundos.
export function NoticeProvider({ children }: { children: ReactNode }) {
  const [notices, setNotices] = useState<Notice[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    setNotices((current) => current.filter((notice) => notice.id !== id))
  }, [])

  const notify = useCallback(
    (kind: NoticeKind, text: string, title?: string) => {
      const id = nextId.current++
      setNotices((current) => [...current, { id, kind, text, title }])
      setTimeout(() => dismiss(id), VISIBLE_MS)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ notices, notify, dismiss }), [notices, notify, dismiss])

  return (
    <NoticeContext.Provider value={value}>
      {children}
      <div className="notices" aria-live="polite">
        {notices.map((notice) => (
          <div
            key={notice.id}
            className={`notice notice-${notice.kind}`}
            role={notice.kind === 'error' ? 'alert' : 'status'}
          >
            <span>
              {notice.title && <strong className="notice-title">{notice.title}</strong>}
              {notice.text}
            </span>
            <button
              type="button"
              className="notice-close"
              aria-label="Fechar aviso"
              onClick={() => dismiss(notice.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </NoticeContext.Provider>
  )
}
