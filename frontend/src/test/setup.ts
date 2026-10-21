import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Sem "globals" do Vitest, a limpeza da tela entre um teste e outro é explícita.
afterEach(() => {
  cleanup()
})
