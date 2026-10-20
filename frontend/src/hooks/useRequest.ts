import { useEffect, useEffectEvent, useState } from 'react'
import { messageOf } from '../lib/errors'

interface Result<T> {
  // A chave do pedido a que esta resposta pertence.
  key: string
  data?: T
  error?: string
}

// Carrega dados da API. `key` descreve o que está sendo pedido (por exemplo, os
// filtros da lista em texto): quando ela muda, ou quando `reload` é chamado
// (depois de uma ação que alterou os dados), o pedido é feito de novo.
//
// Enquanto o pedido novo não chega, `loading` fica verdadeiro e `data` ainda
// traz a resposta anterior, então a lista não "pisca" vazia. Respostas antigas
// são ignoradas: uma consulta lenta nunca sobrescreve uma mais nova.
export function useRequest<T>(loader: () => Promise<T>, key: string) {
  const [version, setVersion] = useState(0)
  const [result, setResult] = useState<Result<T>>()
  const requestKey = `${key}#${version}`

  // Sempre chama a versão mais nova de `loader`, sem precisar entrar nas
  // dependências do efeito.
  const load = useEffectEvent(() => loader())

  useEffect(() => {
    let outdated = false
    load()
      .then((data) => {
        if (!outdated) {
          setResult({ key: requestKey, data })
        }
      })
      .catch((error: unknown) => {
        if (!outdated) {
          setResult({ key: requestKey, error: messageOf(error) })
        }
      })
    return () => {
      outdated = true
    }
  }, [requestKey])

  const answered = result?.key === requestKey

  return {
    data: result?.data,
    error: answered ? result.error : undefined,
    loading: !answered,
    reload: () => setVersion((current) => current + 1),
  }
}
