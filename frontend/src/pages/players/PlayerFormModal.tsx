import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { createPlayer, updatePlayer } from '../../api/players'
import { POSITIONS } from '../../api/types'
import type { Player } from '../../api/types'
import { Button } from '../../components/Button'
import { FormField } from '../../components/FormField'
import { Modal } from '../../components/Modal'
import { useAction } from '../../hooks/useAction'
import { formatMoney } from '../../lib/format'
import { ATTRIBUTE_FIELDS, editPlayerSchema, playerSchema } from './player-schema'
import type { PlayerFormValues } from './player-schema'

interface PlayerFormModalProps {
  // Sem jogador, é o cadastro; com jogador, é a edição.
  player?: Player
  onClose: () => void
  onSaved: () => void
}

// O mesmo formulário serve ao cadastro (com os sete indicadores) e à edição
// (só nome, posição, agilidade e idade).
export function PlayerFormModal({ player, onClose, onSaved }: PlayerFormModalProps) {
  const editing = player !== undefined
  const { busy, run } = useAction()
  const {
    register,
    handleSubmit,
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
    const result = editing
      ? await run(
          () =>
            updatePlayer(player.id, {
              name: values.name,
              position: values.position,
              agility: values.agility,
              age: values.age,
            }),
          'Jogador atualizado.',
        )
      : await run(
          () => createPlayer(values),
          (created) =>
            `Jogador cadastrado: valor base ${formatMoney(created.base_value)} e overall ${created.overall}.`,
        )
    if (result.ok) {
      onSaved()
    }
  }

  return (
    <Modal title={editing ? 'Editar jogador' : 'Novo jogador'} onClose={onClose}>
      <form noValidate onSubmit={handleSubmit(save)}>
        <div className="form-grid">
          <FormField label="Nome" htmlFor="name" error={errors.name?.message}>
            <input id="name" type="text" autoComplete="off" {...register('name')} />
          </FormField>

          <FormField label="Posição" htmlFor="position" error={errors.position?.message}>
            <select id="position" {...register('position')}>
              <option value="">Escolha...</option>
              {POSITIONS.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Agilidade (1 a 100)" htmlFor="agility" error={errors.agility?.message}>
            <input id="agility" type="number" {...register('agility', { valueAsNumber: true })} />
          </FormField>

          <FormField label="Idade (16 a 45)" htmlFor="age" error={errors.age?.message}>
            <input id="age" type="number" {...register('age', { valueAsNumber: true })} />
          </FormField>

          {!editing &&
            ATTRIBUTE_FIELDS.map((field) => (
              <FormField
                key={field.name}
                label={`${field.label} (1 a 99)`}
                htmlFor={field.name}
                error={errors[field.name]?.message}
              >
                <input
                  id={field.name}
                  type="number"
                  {...register(field.name, { valueAsNumber: true })}
                />
              </FormField>
            ))}
        </div>

        {!editing && (
          <p className="field-hint">
            O valor base e o overall são calculados pela API depois de salvar.
          </p>
        )}

        <div className="modal-actions">
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary" busy={busy}>
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  )
}
