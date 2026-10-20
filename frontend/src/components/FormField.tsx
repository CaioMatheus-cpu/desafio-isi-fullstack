import type { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  htmlFor: string
  // Mensagem de erro do campo, mostrada logo abaixo dele.
  error?: string
  hint?: string
  children: ReactNode
}

// Rótulo, campo e mensagem de erro juntos. Todas as telas de formulário usam
// este mesmo componente.
export function FormField({ label, htmlFor, error, hint, children }: FormFieldProps) {
  return (
    <div className={`field${error ? ' field-invalid' : ''}`}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && !error && <p className="field-hint">{hint}</p>}
      {error && (
        <p className="field-error" id={`${htmlFor}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
