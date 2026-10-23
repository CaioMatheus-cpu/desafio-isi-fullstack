import { CircleAlert } from 'lucide-react'
import { Children, cloneElement, isValidElement } from 'react'
import type { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  htmlFor: string
  // Mensagem de erro do campo, mostrada logo abaixo dele.
  error?: string
  hint?: string
  children: ReactNode
}

// Liga o campo (o elemento com `id` igual a `htmlFor`, mesmo dentro de um quadro
// com ícone) à mensagem de erro ou à dica: o leitor de tela lê o motivo junto
// com o nome do campo, e `aria-invalid` avisa que ele está com erro.
interface FieldAttributes {
  'aria-invalid'?: boolean
  'aria-describedby'?: string
}

function connectField(node: ReactNode, id: string, props: FieldAttributes): ReactNode {
  return Children.map(node, (child) => {
    if (!isValidElement<FieldAttributes & { id?: string; children?: ReactNode }>(child)) {
      return child
    }
    if (child.props.id === id) {
      return cloneElement(child, props)
    }
    if (child.props.children) {
      return cloneElement(child, {}, connectField(child.props.children, id, props))
    }
    return child
  })
}

// Rótulo, campo e mensagem de erro juntos. Todas as telas de formulário usam
// este mesmo componente.
export function FormField({ label, htmlFor, error, hint, children }: FormFieldProps) {
  const errorId = `${htmlFor}-error`
  const hintId = `${htmlFor}-hint`
  const describedBy = error ? errorId : hint ? hintId : undefined
  return (
    <div className={`field${error ? ' field-invalid' : ''}`}>
      <label htmlFor={htmlFor}>{label}</label>
      {connectField(children, htmlFor, {
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
      })}
      {hint && !error && (
        <p className="field-hint" id={hintId}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field-error" id={errorId} role="alert">
          <CircleAlert size={13} aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  )
}
