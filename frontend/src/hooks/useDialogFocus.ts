import { useEffect } from 'react'
import type { RefObject } from 'react'

const FOCUSABLE =
  'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'

// Cuida do foco do teclado numa janela: ao abrir, o foco entra nela; o Tab dá a
// volta dentro dela, sem escapar para a página de trás; ao fechar, o foco volta
// para o que estava focado antes (por exemplo, o botão que abriu a janela).
export function useDialogFocus(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) {
      return
    }
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    dialog.focus()

    function keepFocusInside(event: KeyboardEvent) {
      if (event.key !== 'Tab' || !dialog) {
        return
      }
      const items = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)]
      const first = items[0]
      const last = items[items.length - 1]
      if (!first || !last) {
        event.preventDefault()
        return
      }
      const active = document.activeElement
      if (event.shiftKey && (active === first || active === dialog)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    dialog.addEventListener('keydown', keepFocusInside)
    return () => {
      dialog.removeEventListener('keydown', keepFocusInside)
      previous?.focus()
    }
  }, [ref])
}
