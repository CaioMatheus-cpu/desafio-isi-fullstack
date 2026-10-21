import { CircleAlert, Info, Shield, Swords } from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listClubs } from '../../api/clubs'
import { playMatch } from '../../api/matches'
import { Button } from '../../components/Button'
import { FormField } from '../../components/FormField'
import { Modal } from '../../components/Modal'
import { useNotice } from '../../hooks/notice-context'
import { useRequest } from '../../hooks/useRequest'
import { messageOf } from '../../lib/errors'

interface NewMatchModalProps {
  onClose: () => void
}

// Escolhe os dois clubes e joga. O placar e os duelos vêm da API; se ela recusar
// (por exemplo, escalação incompleta), a mensagem aparece aqui dentro e a janela
// continua aberta.
export function NewMatchModal({ onClose }: NewMatchModalProps) {
  const navigate = useNavigate()
  const { notify } = useNotice()
  const clubs = useRequest(() => listClubs(), 'new-match-clubs')
  const [home, setHome] = useState('')
  const [away, setAway] = useState('')
  const [fieldError, setFieldError] = useState<{ home?: string; away?: string }>({})
  const [apiError, setApiError] = useState<string>()
  const [busy, setBusy] = useState(false)
  const running = useRef(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    const errors: { home?: string; away?: string } = {}
    if (home === '') {
      errors.home = 'Escolha o mandante.'
    }
    if (away === '') {
      errors.away = 'Escolha o visitante.'
    } else if (away === home) {
      errors.away = 'O visitante deve ser diferente do mandante.'
    }
    setFieldError(errors)
    setApiError(undefined)
    if (errors.home || errors.away || running.current) {
      return
    }

    running.current = true
    setBusy(true)
    try {
      const match = await playMatch(Number(home), Number(away))
      notify(
        'success',
        `${match.home.club_name} ${match.home.goals} × ${match.away.goals} ${match.away.club_name}. Placar e duelos devolvidos pela API.`,
        'Partida jogada',
      )
      onClose()
      navigate(`/partidas/${match.id}`)
    } catch (error) {
      setApiError(messageOf(error))
    } finally {
      running.current = false
      setBusy(false)
    }
  }

  const options = (clubs.data ?? []).map((club) => (
    <option key={club.id} value={club.id}>
      {club.name} ({club.acronym})
    </option>
  ))

  return (
    <Modal
      title="Nova partida"
      description="Escolha o mandante e o visitante. O placar sai dos atributos dos titulares, sem sorteio."
      onClose={onClose}
    >
      <form noValidate onSubmit={submit}>
        {apiError && (
          <div className="alert alert-error" role="alert">
            <CircleAlert size={18} aria-hidden="true" />
            <div>
              <strong>Não foi possível jogar a partida</strong>
              <p>{apiError}</p>
            </div>
          </div>
        )}

        <FormField
          label="Mandante"
          htmlFor="home-club"
          error={fieldError.home}
          hint="Faz os 3 primeiros ataques."
        >
          <div className="select-icon">
            <Shield size={16} aria-hidden="true" />
            <select id="home-club" value={home} onChange={(event) => setHome(event.target.value)}>
              <option value="">Escolha o mandante</option>
              {options}
            </select>
          </div>
        </FormField>

        <FormField
          label="Visitante"
          htmlFor="away-club"
          error={fieldError.away}
          hint="Precisa ser um clube diferente do mandante."
        >
          <div className="select-icon">
            <Shield size={16} aria-hidden="true" />
            <select id="away-club" value={away} onChange={(event) => setAway(event.target.value)}>
              <option value="">Escolha o visitante</option>
              {options}
            </select>
          </div>
        </FormField>

        <div className="info-box">
          <p className="info-title">
            <Info size={14} aria-hidden="true" /> Como sai o placar
          </p>
          <p>
            Cada time faz 3 ataques. Pela ordem do elenco, os jogadores de linha vão do 1º (o mais
            recuado) ao 4º (o mais avançado): o 4º enfrenta o goleiro, o 3º enfrenta o 1º e o 2º
            enfrenta o 2º do adversário. O atacante usa finalização (ATA), passe (MEI) ou drible
            (ZAG e LAT), e quem defende usa defesa. É gol só quando o ataque é maior; mal
            condicionado joga com 15% a menos.
          </p>
          <p>Os dois clubes precisam ter os 5 titulares escalados. A partida não mexe no caixa.</p>
        </div>

        <div className="modal-actions">
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary" busy={busy}>
            <Swords size={16} aria-hidden="true" /> Jogar partida
          </Button>
        </div>
      </form>
    </Modal>
  )
}
