import { useEffect, useState } from 'react'

// Devolve o valor depois de ele ficar parado por um instante. Usado nos campos
// de busca e de faixa: a lista só é consultada quando a pessoa para de digitar,
// e não a cada tecla.
export function useDebouncedValue<T>(value: T, delayMs = 350): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
