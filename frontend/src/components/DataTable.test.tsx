import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DataTable } from './DataTable'
import type { Column } from './DataTable'

interface Row {
  id: number
  name: string
}

const COLUMNS: Column<Row>[] = [{ header: 'Nome', render: (row) => row.name }]

function renderTable(props: Partial<React.ComponentProps<typeof DataTable<Row>>> = {}) {
  return render(
    <DataTable<Row>
      columns={COLUMNS}
      rows={[{ id: 1, name: 'Ana Costa' }]}
      rowKey={(row) => row.id}
      loading={false}
      error={undefined}
      errorTitle="Não foi possível carregar os jogadores"
      onRetry={() => undefined}
      empty={{ title: 'Nenhum jogador cadastrado', description: 'A lista começa vazia.' }}
      {...props}
    />,
  )
}

describe('DataTable', () => {
  it('mostra as linhas quando há dados', () => {
    renderTable()
    expect(screen.getByRole('columnheader', { name: 'Nome' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Ana Costa' })).toBeInTheDocument()
  })

  it('mostra "Carregando..." enquanto não chegou nada', () => {
    renderTable({ rows: undefined, loading: true })
    expect(screen.getByRole('status')).toHaveTextContent('Carregando...')
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('mostra a lista vazia com título, texto e ação', () => {
    renderTable({
      rows: [],
      empty: {
        title: 'Nenhum jogador cadastrado',
        description: 'Com o banco recém-criado, a lista começa vazia.',
        action: <button type="button">Novo jogador</button>,
      },
    })
    expect(screen.getByText('Nenhum jogador cadastrado')).toBeInTheDocument()
    expect(screen.getByText('Com o banco recém-criado, a lista começa vazia.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Novo jogador' })).toBeInTheDocument()
  })

  it('mostra o erro com a mensagem da API e deixa tentar de novo', async () => {
    const onRetry = vi.fn()
    renderTable({ rows: undefined, error: 'Banco indisponível.', onRetry })

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar os jogadores')
    expect(screen.getByRole('alert')).toHaveTextContent('Banco indisponível.')

    await userEvent.click(screen.getByRole('button', { name: /Tentar de novo/ }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
