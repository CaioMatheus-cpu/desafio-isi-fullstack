import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'link'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  // Enquanto uma ação está rodando, o botão fica desabilitado.
  busy?: boolean
}

export function Button({
  variant = 'secondary',
  busy = false,
  disabled,
  type = 'button',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${className}`.trim()}
      disabled={disabled || busy}
      aria-busy={busy}
      {...rest}
    >
      {busy ? 'Aguarde...' : children}
    </button>
  )
}
