import { Eye, HeartPulse, ShoppingCart, SquarePen, Trash2, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { deletePlayer, listPlayers } from '../../api/players'
import { listClubs } from '../../api/clubs'
import type { Player } from '../../api/types'
import { AgilityBar, Avatar, ConditionBadge, PositionBadge } from '../../components/Badges'
import { Button } from '../../components/Button'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { DataTable } from '../../components/DataTable'
import type { Column } from '../../components/DataTable'
import { PageHeader } from '../../components/PageHeader'
import { Pagination } from '../../components/Pagination'
import { RowMenu } from '../../components/RowMenu'
import { Tabs } from '../../components/Tabs'
import { useAction } from '../../hooks/useAction'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useRequest } from '../../hooks/useRequest'
import { POSITION_NAMES, formatMoney } from '../../lib/format'
import { BuyPlayerModal } from './BuyPlayerModal'
import { ConditionModal } from './ConditionModal'
import { CreatedPlayerModal } from './CreatedPlayerModal'
import { PlayerDetailsSheet } from './PlayerDetailsSheet'
import { PlayerFilterBar, SortSelect } from './PlayerFilterBar'
import { PlayerFormModal } from './PlayerFormModal'
import { EMPTY_FILTERS, toApiFilters } from './player-filters'
import type { FilterState, Ownership } from './player-filters'

type Dialog =
  | { kind: 'create' }
  | { kind: 'edit'; player: Player }
  | { kind: 'condition'; player: Player }
  | { kind: 'delete'; player: Player }
  | { kind: 'buy'; player: Player }
  | { kind: 'details'; player: Player }
  | { kind: 'created'; player: Player }

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

  // Quantos jogadores existem no total e quantos estão livres (as abas).
  const counts = useRequest(async () => {
    const [all, free] = await Promise.all([
      listPlayers({ sort: 'name', page: 1 }),
      listPlayers({ sort: 'name', page: 1, free: true }),
    ])
    return { all: all.meta.total_items, free: free.meta.total_items }
  }, 'ownership-counts')

  const clubById = useMemo(
    () => new Map((clubs.data ?? []).map((club) => [club.id, club])),
    [clubs.data],
  )

  const rows = players.data?.data
  // Há algum filtro, busca ou aba escolhida? Muda a mensagem da lista vazia.
  const filtered =
    JSON.stringify({ ...settled, sort: '' }) !== JSON.stringify({ ...EMPTY_FILTERS, sort: '' })

  function changeFilters(patch: Partial<FilterState>) {
    setFilters((current) => ({ ...current, ...patch }))
    setPage(1)
  }

  function reloadAll() {
    players.reload()
    counts.reload()
  }

  function closeAndReload() {
    setDialog(null)
    reloadAll()
  }

  function changeOwnership(ownership: Ownership) {
    changeFilters({ ownership, clubId: ownership === 'free' ? '' : filters.clubId })
  }

  async function confirmDelete(player: Player) {
    const result = await deletion.run(() => deletePlayer(player.id), {
      title: 'Jogador excluído',
      text: `${player.name} saiu da lista. Transações e partidas antigas dele continuam gravadas.`,
    })
    if (result.ok) {
      // Excluiu a última linha da página: volta para a anterior.
      if (rows?.length === 1 && page > 1) {
        setPage(page - 1)
      }
      closeAndReload()
    }
  }

  const columns: Column<Player>[] = [
    {
      header: 'Nome',
      render: (player) => (
        <span className="person">
          <Avatar name={player.name} />
          <span>
            <strong>{player.name}</strong>
            <span className="person-sub">{POSITION_NAMES[player.position]}</span>
          </span>
        </span>
      ),
    },
    { header: 'Posição', render: (player) => <PositionBadge position={player.position} /> },
    {
      header: 'Overall',
      numeric: true,
      render: (player) => <strong>{player.overall}</strong>,
    },
    { header: 'Agilidade', render: (player) => <AgilityBar value={player.agility} /> },
    { header: 'Idade', numeric: true, render: (player) => player.age },
    { header: 'Condição', render: (player) => <ConditionBadge condition={player.condition} /> },
    { header: 'Valor base', numeric: true, render: (player) => formatMoney(player.base_value) },
    {
      header: 'Valor de mercado',
      numeric: true,
      render: (player) => <strong>{formatMoney(player.market_value)}</strong>,
    },
    {
      header: 'Clube',
      render: (player) => {
        if (player.club_id === null) {
          return <span className="badge badge-muted">Livre</span>
        }
        const club = clubById.get(player.club_id)
        return club ? (
          <span className="club-cell">
            <span className="badge badge-outline">{club.acronym}</span>
            <Link to={`/clubes/${club.id}`}>{club.name}</Link>
          </span>
        ) : (
          `Clube ${player.club_id}`
        )
      },
    },
    {
      header: 'Ações',
      render: (player) => (
        <div className="row-actions">
          {player.club_id === null && (
            <Button onClick={() => setDialog({ kind: 'buy', player })}>
              <ShoppingCart size={16} aria-hidden="true" /> Comprar
            </Button>
          )}
          <RowMenu
            title={player.name}
            items={[
              {
                label: 'Ver detalhes',
                icon: <Eye size={16} aria-hidden="true" />,
                onSelect: () => setDialog({ kind: 'details', player }),
              },
              {
                label: 'Editar',
                icon: <SquarePen size={16} aria-hidden="true" />,
                onSelect: () => setDialog({ kind: 'edit', player }),
              },
              {
                label: 'Alterar condição',
                icon: <HeartPulse size={16} aria-hidden="true" />,
                onSelect: () => setDialog({ kind: 'condition', player }),
              },
              ...(player.club_id === null
                ? [
                    {
                      label: 'Comprar',
                      icon: <ShoppingCart size={16} aria-hidden="true" />,
                      onSelect: () => setDialog({ kind: 'buy' as const, player }),
                      separated: true,
                    },
                  ]
                : []),
              {
                label: 'Excluir',
                icon: <Trash2 size={16} aria-hidden="true" />,
                destructive: true,
                separated: true,
                disabled: player.club_id !== null,
                note:
                  player.club_id === null
                    ? 'Disponível porque o jogador está livre.'
                    : 'Só jogador livre pode ser excluído.',
                onSelect: () => setDialog({ kind: 'delete', player }),
              },
            ]}
          />
        </div>
      ),
    },
  ]

  const meta = players.data?.meta

  return (
    <section>
      <PageHeader
        icon={Users}
        title="Jogadores"
        subtitle="Cadastre jogadores, acompanhe os indicadores e compre os que estão livres."
        action={
          <Button variant="primary" onClick={() => setDialog({ kind: 'create' })}>
            Novo jogador
          </Button>
        }
      />

      <PlayerFilterBar
        value={filters}
        clubs={clubs.data ?? []}
        onChange={changeFilters}
        onClear={() => changeFilters(EMPTY_FILTERS)}
      />

      <section className="card">
        <div className="card-toolbar">
          <Tabs
            tabs={[
              { id: 'all', label: 'Todos', count: counts.data?.all },
              { id: 'free', label: 'Livres', count: counts.data?.free },
              {
                id: 'owned',
                label: 'Em clubes',
                count: counts.data ? counts.data.all - counts.data.free : undefined,
              },
            ]}
            active={filters.ownership}
            onChange={changeOwnership}
            variant="pill"
          />
          <SortSelect value={filters.sort} onChange={(sort) => changeFilters({ sort })} />
        </div>

        <DataTable
          caption="Lista de jogadores"
          columns={columns}
          rows={rows}
          rowKey={(player) => player.id}
          loading={players.loading}
          error={players.error}
          onRetry={players.reload}
          errorTitle="Não foi possível carregar os jogadores"
          empty={
            filtered
              ? {
                  title: filters.search.trim()
                    ? `Nenhum jogador encontrado para "${filters.search.trim()}"`
                    : 'Nenhum jogador encontrado',
                  description:
                    'Confira a grafia ou tire alguns filtros. A busca ignora maiúsculas, minúsculas e acentos.',
                  action: (
                    <Button onClick={() => changeFilters(EMPTY_FILTERS)}>Limpar filtros</Button>
                  ),
                }
              : {
                  title: 'Nenhum jogador cadastrado',
                  description: 'Com o banco recém-criado, a lista começa vazia.',
                  action: (
                    <Button onClick={() => setDialog({ kind: 'create' })}>Novo jogador</Button>
                  ),
                }
          }
        />

        {meta && meta.total_items > 0 && (
          <Pagination
            page={meta.page}
            totalPages={meta.total_pages}
            totalItems={meta.total_items}
            pageSize={meta.limit}
            singular="jogador"
            plural="jogadores"
            onChange={setPage}
          />
        )}
      </section>

      {dialog?.kind === 'create' && (
        <PlayerFormModal
          onClose={() => setDialog(null)}
          onSaved={(created) => {
            setDialog({ kind: 'created', player: created })
            reloadAll()
          }}
        />
      )}
      {dialog?.kind === 'created' && (
        <CreatedPlayerModal
          player={dialog.player}
          onClose={() => setDialog(null)}
          onDetails={() => setDialog({ kind: 'details', player: dialog.player })}
        />
      )}
      {dialog?.kind === 'edit' && (
        <PlayerFormModal
          player={dialog.player}
          onClose={() => setDialog(null)}
          onSaved={closeAndReload}
        />
      )}
      {dialog?.kind === 'details' && (
        <PlayerDetailsSheet
          player={dialog.player}
          club={dialog.player.club_id === null ? undefined : clubById.get(dialog.player.club_id)}
          onClose={() => setDialog(null)}
          onEdit={() => setDialog({ kind: 'edit', player: dialog.player })}
          onCondition={() => setDialog({ kind: 'condition', player: dialog.player })}
          onBuy={() => setDialog({ kind: 'buy', player: dialog.player })}
        />
      )}
      {dialog?.kind === 'condition' && (
        <ConditionModal
          player={dialog.player}
          clubName={
            dialog.player.club_id === null ? undefined : clubById.get(dialog.player.club_id)?.name
          }
          onClose={() => setDialog(null)}
          onSaved={closeAndReload}
        />
      )}
      {dialog?.kind === 'buy' && (
        <BuyPlayerModal
          player={dialog.player}
          onClose={() => setDialog(null)}
          onBought={reloadAll}
        />
      )}
      {dialog?.kind === 'delete' && (
        <ConfirmDialog
          title={`Excluir ${dialog.player.name}?`}
          description="O jogador sai da lista e da busca, mas as transações e as partidas antigas dele continuam como foram gravadas."
          confirmLabel={
            <>
              <Trash2 size={16} aria-hidden="true" /> Excluir jogador
            </>
          }
          busy={deletion.busy}
          onCancel={() => setDialog(null)}
          onConfirm={() => confirmDelete(dialog.player)}
        >
          <div className="player-card">
            <Avatar name={dialog.player.name} />
            <div>
              <strong>{dialog.player.name}</strong>
              <span className="person-sub">
                {dialog.player.position} · {POSITION_NAMES[dialog.player.position]} ·{' '}
                {dialog.player.age} anos
              </span>
            </div>
            <span className="badge badge-muted">Livre</span>
          </div>
        </ConfirmDialog>
      )}
    </section>
  )
}
