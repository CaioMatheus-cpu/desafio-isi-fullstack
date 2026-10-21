import { CircleAlert, Shield, Wallet } from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createClub } from '../../api/clubs'
import { Button } from '../../components/Button'
import { FormField } from '../../components/FormField'
import { Modal } from '../../components/Modal'
import { useNotice } from '../../hooks/notice-context'
import { messageOf } from '../../lib/errors'
import { clubSchema } from './club-schema'

interface NewClubModalProps {
  onClose: () => void
}

// Cria o clube. O que a tela confere é só o formato; se o nome já existe ou a
// sigla não combina com ele, a API recusa e a mensagem aparece aqui dentro.
export function NewClubModal({ onClose }: NewClubModalProps) {
  const navigate = useNavigate()
  const { notify } = useNotice()
  const [name, setName] = useState('')
  const [acronym, setAcronym] = useState('')
  const [errors, setErrors] = useState<{ name?: string; acronym?: string }>({})
  const [apiError, setApiError] = useState<string>()
  const [busy, setBusy] = useState(false)
  const running = useRef(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setApiError(undefined)
    const parsed = clubSchema.safeParse({ name, acronym })
    if (!parsed.success) {
      const found: { name?: string; acronym?: string } = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]
        if (field === 'name' || field === 'acronym') {
          found[field] ??= issue.message
        }
      }
      setErrors(found)
      return
    }
    setErrors({})
    if (running.current) {
      return
    }
    running.current = true
    setBusy(true)
    try {
      const club = await createClub(parsed.data)
      notify(
        'success',
        `${club.name} (${club.acronym}) começa com 300,00 em caixa.`,
        'Clube criado',
      )
      onClose()
      navigate(`/clubes/${club.id}`)
    } catch (error) {
      setApiError(messageOf(error))
    } finally {
      running.current = false
      setBusy(false)
    }
  }

  return (
    <Modal title="Novo clube" description="Informe o nome e a sigla do clube." onClose={onClose}>
      <form noValidate onSubmit={submit}>
        {apiError && (
          <div className="alert alert-error" role="alert">
            <CircleAlert size={18} aria-hidden="true" />
            <div>
              <strong>Não foi possível criar o clube</strong>
              <p>{apiError}</p>
            </div>
          </div>
        )}

        <FormField
          label="Nome"
          htmlFor="club-name"
          error={errors.name}
          hint="De 3 a 60 caracteres e de 2 a 5 palavras; só letras, espaços, hífen e ponto. Não pode repetir outro clube."
        >
          <div className="select-icon">
            <Shield size={16} aria-hidden="true" />
            <input
              id="club-name"
              type="text"
              autoComplete="off"
              placeholder="Ex.: Leões da Serra"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
        </FormField>

        <FormField
          label="Sigla"
          htmlFor="club-acronym"
          error={errors.acronym}
          hint="3 letras de A a Z, maiúsculas, que aparecem no nome nessa ordem; a primeira é a primeira letra do nome."
        >
          <input
            id="club-acronym"
            type="text"
            maxLength={3}
            autoComplete="off"
            placeholder="Ex.: LDS"
            value={acronym}
            onChange={(event) => setAcronym(event.target.value.toUpperCase())}
          />
        </FormField>

        <div className="info-box info-row">
          <Wallet size={14} aria-hidden="true" />
          <p>O clube começa com 300,00 em caixa e sem jogadores.</p>
        </div>

        <div className="modal-actions">
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary" busy={busy}>
            Criar clube
          </Button>
        </div>
      </form>
    </Modal>
  )
}
