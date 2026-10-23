import { Ellipsis } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

export interface RowMenuItem {
  label: string
  icon: ReactNode
  onSelect: () => void
  destructive?: boolean
  disabled?: boolean
  // Frase explicando por que a ação está (in)disponível.
  note?: string
  // Linha separadora antes do item.
  separated?: boolean
}

interface RowMenuProps {
  // Quem é a linha, para o título do menu e para o leitor de tela.
  title: string
  items: RowMenuItem[]
}

// Menu "⋯" de uma linha de tabela. Abre com posição fixa, para não ser cortado
// pela rolagem horizontal da tabela, e fecha com Esc, clique fora ou rolagem.
export function RowMenu({ title, items }: RowMenuProps) {
  const [position, setPosition] = useState<{ top: number; left: number }>()
  const button = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)

  // Itens do menu que dá para escolher (os desabilitados ficam de fora do teclado).
  function enabledItems(): HTMLElement[] {
    return [
      ...(menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not(:disabled)') ?? []),
    ]
  }

  // Ao abrir, o foco vai para o primeiro item.
  useEffect(() => {
    if (position) {
      enabledItems()[0]?.focus()
    }
  }, [position])

  // Setas, Home e End percorrem os itens, como em qualquer menu.
  function moveFocus(event: React.KeyboardEvent) {
    const items = enabledItems()
    const current = items.indexOf(document.activeElement as HTMLElement)
    let next: number | undefined
    if (event.key === 'ArrowDown') {
      next = (current + 1) % items.length
    } else if (event.key === 'ArrowUp') {
      next = (current - 1 + items.length) % items.length
    } else if (event.key === 'Home') {
      next = 0
    } else if (event.key === 'End') {
      next = items.length - 1
    }
    if (next !== undefined) {
      event.preventDefault()
      items[next]?.focus()
    }
  }

  useEffect(() => {
    if (!position) {
      return
    }
    function close() {
      setPosition(undefined)
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        close()
        button.current?.focus()
      }
    }
    document.addEventListener('keydown', closeOnEscape)
    document.addEventListener('mousedown', close)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.removeEventListener('mousedown', close)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [position])

  function toggle() {
    if (position) {
      setPosition(undefined)
      return
    }
    const rect = button.current?.getBoundingClientRect()
    if (rect) {
      setPosition({ top: rect.bottom + 4, left: Math.max(8, rect.right - 260) })
    }
  }

  return (
    <>
      <button
        ref={button}
        type="button"
        className="icon-btn"
        aria-label={`Ações de ${title}`}
        aria-haspopup="menu"
        aria-expanded={position !== undefined}
        onClick={toggle}
      >
        <Ellipsis size={18} aria-hidden="true" />
      </button>
      {position && (
        <div
          className="menu"
          ref={menu}
          role="menu"
          aria-label={`Ações de ${title}`}
          onKeyDown={moveFocus}
          style={{ top: position.top, left: position.left }}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <p className="menu-title">{title}</p>
          {items.map((item) => (
            <div key={item.label}>
              {item.separated && <hr className="menu-sep" />}
              <button
                type="button"
                role="menuitem"
                className={`menu-item${item.destructive ? ' menu-item-destructive' : ''}`}
                disabled={item.disabled}
                onClick={() => {
                  // O foco volta ao botão do menu antes da ação: se ela abrir uma janela,
                  // é para ele que o foco retorna quando a janela fechar.
                  button.current?.focus()
                  setPosition(undefined)
                  item.onSelect()
                }}
              >
                {item.icon}
                {item.label}
              </button>
              {item.note && <p className="menu-note">{item.note}</p>}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
