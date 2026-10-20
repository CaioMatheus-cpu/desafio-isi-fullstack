import { useRef, useState } from 'react'
import { messageOf } from '../lib/errors'
import { useNotice } from './notice-context'

export type ActionResult<T> = { ok: true; value: T } | { ok: false }

// Executa uma ação que altera dados (cadastrar, comprar, vender...). Faz três
// coisas que toda ação precisa:
//  - impede o clique duplo: enquanto uma ação roda, outra igual é ignorada;
//  - mostra um aviso de sucesso, ou o `message` que a API devolveu na recusa;
//  - devolve se deu certo (e o resultado), para o chamador decidir se fecha a
//    janela e atualiza a lista.
export function useAction() {
  const { notify } = useNotice()
  const [busy, setBusy] = useState(false)
  // O estado só muda no próximo ciclo da tela, então dois cliques seguidos
  // passariam por ele. A referência muda na hora e barra o segundo clique.
  const running = useRef(false)

  async function run<T>(
    action: () => Promise<T>,
    successMessage: string | ((result: T) => string),
  ): Promise<ActionResult<T>> {
    if (running.current) {
      return { ok: false }
    }
    running.current = true
    setBusy(true)
    try {
      const result = await action()
      notify(
        'success',
        typeof successMessage === 'function' ? successMessage(result) : successMessage,
      )
      return { ok: true, value: result }
    } catch (error) {
      notify('error', messageOf(error))
      return { ok: false }
    } finally {
      running.current = false
      setBusy(false)
    }
  }

  return { busy, run }
}
