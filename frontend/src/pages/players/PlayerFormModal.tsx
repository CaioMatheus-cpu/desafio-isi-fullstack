import { zodResolver } from '@hookform/resolvers/zod'
import { ChartNoAxesColumn, Info, Lock, User } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import type { Control, Resolver } from 'react-hook-form'
import { createPlayer, updatePlayer } from '../../api/players'
import { POSITIONS } from '../../api/types'
import type { Player } from '../../api/types'
import { Button } from '../../components/Button'
import { FormField } from '../../components/FormField'
import { Modal } from '../../components/Modal'
import { useAction } from '../../hooks/useAction'
import { POSITION_NAMES, formatMoney } from '../../lib/format'
import { ATTRIBUTE_FIELDS, editPlayerSchema, playerSchema } from './player-schema'
import type { PlayerFormValues } from './player-schema'

interface PlayerFormModalProps {
  // Sem jogador, é o cadastro; com jogador, é a edição.
  player?: Player
  onClose: () => void
  // No cadastro devolve o jogador criado, para mostrar os valores calculados.
  onSaved: (saved: Player) => void
}

function LockedField({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <div className="locked">
        <Lock size={14} aria-hidden="true" /> Após salvar
      </div>
      <p className="field-hint">{hint}</p>
    </div>
  )
}

// Desenha os valores digitados. Não calcula overall nem valor base: isso é da API.
function AttributePreview({ control }: { control: Control<PlayerFormValues> }) {
  const values = useWatch({ control })
  const potential = Number(values.potential) || 0
  return (
    <div className="preview" aria-label="Prévia dos atributos">
      <p className="preview-title">
        <ChartNoAxesColumn size={16} aria-hidden="true" /> Prévia dos atributos
      </p>
      <ul className="bars">
        {ATTRIBUTE_FIELDS.filter((field) => field.name !== 'potential').map((field) => {
          const value = Math.min(99, Math.max(0, Number(values[field.name]) || 0))
          return (
            <li key={field.name}>
              <span>{field.label}</span>
              <span className="bar-track" aria-hidden="true">
                <span className="bar-potential" style={{ width: `${Math.min(99, potential)}%` }} />
                <span className="bar-value" style={{ width: `${value}%` }} />
              </span>
              <strong>{value}</strong>
            </li>
          )
        })}
      </ul>
      <p className="muted preview-note">
        Faixa clara: até o potencial ({potential}). A prévia só desenha os valores digitados; não
        calcula overall nem valor base.
      </p>
    </div>
  )
}

// O mesmo formulário serve ao cadastro (com os sete indicadores) e à edição
// (só nome, posição, agilidade e idade).
export function PlayerFormModal({ player, onClose, onSaved }: PlayerFormModalProps) {
  const editing = player !== undefined
  const { busy, run } = useAction()
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<PlayerFormValues>({
    // Na edição o esquema valida só 4 campos, mas o formulário tem o mesmo
    // formato nos dois modos; por isso a conversão de tipo aqui.
    resolver: zodResolver(
      editing ? editPlayerSchema : playerSchema,
    ) as unknown as Resolver<PlayerFormValues>,
    defaultValues: editing
      ? { name: player.name, position: player.position, agility: player.agility, age: player.age }
      : undefined,
  })

  async function save(values: PlayerFormValues) {
    if (editing && values.age < player.age) {
      setError('age', { message: 'A idade não pode ser menor que a atual.' })
      return
    }
    const result = editing
      ? await run(
          () =>
            updatePlayer(player.id, {
              name: values.name,
              position: values.position,
              agility: values.agility,
              age: values.age,
            }),
          (updated) => ({
            title: 'Jogador atualizado',
            text: `${updated.name} foi salvo. O valor de mercado foi recalculado pela API.`,
          }),
        )
      : await run(() => createPlayer(values), {
          title: 'Jogador cadastrado',
          text: 'O jogador entrou livre e Apto.',
        })
    if (result.ok) {
      onSaved(result.value)
    }
  }

  return (
    <Modal
      title={editing ? 'Editar jogador' : 'Novo jogador'}
      description={
        Object.keys(errors).length > 0
          ? 'Corrija os campos destacados para salvar.'
          : editing
            ? 'Edite nome, posição, idade e agilidade. Os demais dados não mudam.'
            : 'Preencha os dados e os indicadores técnicos. O valor base, o overall e o valor de mercado são calculados ao salvar.'
      }
      wide
      onClose={onClose}
    >
      <form noValidate onSubmit={handleSubmit(save)}>
        <FormField
          label="Nome"
          htmlFor="name"
          error={errors.name?.message}
          hint="De 3 a 100 caracteres, com pelo menos duas palavras e sem números."
        >
          <div className="select-icon">
            <User size={16} aria-hidden="true" />
            <input
              id="name"
              type="text"
              autoComplete="off"
              placeholder="Ex.: Davi Melo"
              {...register('name')}
            />
          </div>
        </FormField>

        <fieldset className={`radio-cards${errors.position ? ' field-invalid' : ''}`}>
          <legend>Posição</legend>
          <div>
            {POSITIONS.map((position) => (
              <label
                key={position}
                className={`radio-card${editing && player.club_id !== null && position !== player.position ? ' radio-card-disabled' : ''}`}
              >
                <input
                  type="radio"
                  value={position}
                  disabled={editing && player.club_id !== null && position !== player.position}
                  {...register('position')}
                />
                <span>
                  <strong>{position}</strong>
                  <span>{POSITION_NAMES[position]}</span>
                </span>
              </label>
            ))}
          </div>
          {editing && player.club_id !== null && (
            <p className="field-hint">
              Jogador com clube não muda de posição: as outras posições ficam desabilitadas.
            </p>
          )}
          {errors.position && (
            <p className="field-error" role="alert">
              {errors.position.message}
            </p>
          )}
        </fieldset>

        <div className="form-grid form-grid-3">
          <FormField
            label="Idade"
            htmlFor="age"
            error={errors.age?.message}
            hint={editing ? `De 16 a 45, sem diminuir (atual: ${player.age}).` : 'De 16 a 45 anos.'}
          >
            <input id="age" type="number" {...register('age', { valueAsNumber: true })} />
          </FormField>
          <FormField
            label="Agilidade"
            htmlFor="agility"
            error={errors.agility?.message}
            hint="De 1 a 100 (até 85 com 35 anos ou mais)."
          >
            <input id="agility" type="number" {...register('agility', { valueAsNumber: true })} />
          </FormField>
          {!editing && <LockedField label="Valor base (moedas)" hint="Calculado no cadastro." />}
        </div>

        {editing && (
          <div className="locked locked-note">
            <Lock size={14} aria-hidden="true" /> Não mudam depois do cadastro: valor base (
            {formatMoney(player.base_value)}), indicadores e potencial.
          </div>
        )}

        {!editing && (
          <section className="form-section">
            <h3>Indicadores técnicos</h3>
            <p className="muted">
              Seis atributos e o potencial, de 1 a 99. Não mudam depois do cadastro; a soma dos seis
              atributos não pode passar de 480.
            </p>
            <div className="technical">
              <div className="form-grid form-grid-4">
                {ATTRIBUTE_FIELDS.map((field) => (
                  <FormField
                    key={field.name}
                    label={field.label}
                    htmlFor={field.name}
                    error={errors[field.name]?.message}
                    hint={
                      field.name === 'potential'
                        ? '≥ maior atributo; igual a ele com 33+ anos'
                        : undefined
                    }
                  >
                    <input
                      id={field.name}
                      type="number"
                      {...register(field.name, { valueAsNumber: true })}
                    />
                  </FormField>
                ))}
                <LockedField label="Overall" hint="Calculado automaticamente" />
              </div>
              <AttributePreview control={control} />
            </div>
          </section>
        )}

        <div className="modal-footer">
          {!editing && (
            <p className="muted modal-note">
              <Info size={14} aria-hidden="true" /> O jogador começa livre e Apto.
            </p>
          )}
          <div className="modal-actions">
            <Button onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary" busy={busy}>
              {editing ? 'Salvar alterações' : 'Salvar jogador'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
