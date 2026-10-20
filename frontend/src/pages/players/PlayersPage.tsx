import { useMemo, useState } from 'react'
import { deletePlayer, listPlayers } from '../../api/players'
import { listClubs } from '../../api/clubs'
import type { Player } from '../../api/types'
import { Button } from '../../components/Button'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { DataTable } from '../../components/DataTable'
import type { Column } from '../../components/DataTable'
import { Pagination } from '../../components/Pagination'
import { useAction } from '../../hooks/useAction'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useRequest } from '../../hooks/useRequest'
import { conditionLabel, formatMoney } from '../../lib/format'
import { ConditionModal } from './ConditionModal'
import { PlayerFilterBar } from './PlayerFilterBar'
import { PlayerFormModal } from './PlayerFormModal'
import { EMPTY_FILTERS, toApiFilters } from './player-filters'
import type { FilterState } from './player-filters'

type Dialog =
  | { kind: 'create' }
  | { kind: 'edit'; player: Player }
  | { kind: 'condition'; player: Player }
  | { kind: 'delete'; player: Player }

export function PlayersPage() {
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [page, setPage] = useState(1)
  const [dialog, setDialog] = useState<Dialog | null>(null)
  const deletion = useAction()

  // A consulta só sai quando a pessoa para de digitar.
  const settled = useDebouncedValue(filters)
  const apiFilters = useMemo(() => toApiFilters(settled, page), [settled, page])
  const players = useRequest(() => listPlayers(apiFilters), JSON.stringify(apiFilters))
  const clubs = useRequest(() => listClubs(), 'clubs')

  const clubAcronym = useMemo(
    () => new Map((clubs.data ?? []).map((club) => [club.id, club.acronym])),
    [clubs.data],
  )

  const rows = players.data?.data

  function changeFilters(patch: Partial<FilterState>) {
    setFilters((current) => ({ ...current, ...patch }))
    setPage(1)
  }

  function closeAndReload() {
    setDialog(null)
    players.reload()
  }

  async function confirmDelete(player: Player) {
    const result = await deletion.run(
      () => deletePlayer(player.id),
      `Jogador ${player.name} excluído.`,
    )
    if (result.ok) {
      // Excluiu a última linha da página: volta para a anterior.
      if (rows?.length === 1 && page > 1) {
        setPage(page - 1)
      }
      closeAndReload()
    }
  }

  const columns: Column<Player>[] = [
    { header: 'Nome', render: (player) => player.name },
    { header: 'Posição', render: (player) => player.position },
    { header: 'Overall', numeric: true, render: (player) => player.overall },
    { header: 'Agilidade', numeric: true, render: (player) => player.agility },
    { header: 'Idade', numeric: true, render: (player) => player.age },
    { header: 'Condição', render: (player) => conditionLabel(player.condition) },
    { header: 'Valor base', numeric: true, render: (player) => formatMoney(player.base_value) },
    {
      header: 'Valor de mercado',
      numeric: true,
      render: (player) => formatMoney(player.market_value),
    },
    {
      header: 'Clube',
      render: (player) =>
        player.club_id === null
          ? 'Livre'
          : (clubAcronym.get(player.club_id) ?? `Clube ${player.club_id}`),
    },
    {
      header: 'Ações',
      render: (player) => (
        <div className="row-actions">
          <Button variant="link" onClick={() => setDialog({ kind: 'edit', player })}>
            Editar
          </Button>
          <Button variant="link" onClick={() => setDialog({ kind: 'condition', player })}>
            Condição
          </Button>
          {player.club_id === null && (
            <Button variant="link" onClick={() => setDialog({ kind: 'delete', player })}>
              Excluir
            </Button>
          )}
        </div>
      ),
    },
  ]

  const meta = players.data?.meta

  return (
    <section>
      <div className="page-head">
        <h1>Jogadores</h1>
        <Button variant="primary" onClick={() => setDialog({ kind: 'create' })}>
          Novo jogador
        </Button>
      </div>

      <PlayerFilterBar
        value={filters}
        clubs={clubs.data ?? []}
        onChange={changeFilters}
        onClear={() => changeFilters(EMPTY_FILTERS)}
      />

      <DataTable
        caption="Lista de jogadores"
        columns={columns}
        rows={rows}
        rowKey={(player) => player.id}
        loading={players.loading}
        error={players.error}
        onRetry={players.reload}
        emptyText="Nenhum jogador encontrado."
      />

      {meta && (
        <Pagination
          page={meta.page}
          totalPages={meta.total_pages}
          totalItems={meta.total_items}
          singular="jogador"
          plural="jogadores"
          onChange={setPage}
        />
      )}

      {dialog?.kind === 'create' && (
        <PlayerFormModal onClose={() => setDialog(null)} onSaved={closeAndReload} />
      )}
      {dialog?.kind === 'edit' && (
        <PlayerFormModal
          player={dialog.player}
          onClose={() => setDialog(null)}
          onSaved={closeAndReload}
        />
      )}
      {dialog?.kind === 'condition' && (
        <ConditionModal
          player={dialog.player}
          onClose={() => setDialog(null)}
          onSaved={closeAndReload}
        />
      )}
      {dialog?.kind === 'delete' && (
        <ConfirmDialog
          title="Excluir jogador"
          confirmLabel="Excluir"
          busy={deletion.busy}
          onCancel={() => setDialog(null)}
          onConfirm={() => confirmDelete(dialog.player)}
        >
          <p>
            Deseja excluir <strong>{dialog.player.name}</strong>? Essa ação não pode ser desfeita.
          </p>
        </ConfirmDialog>
      )}
    </section>
  )
}
