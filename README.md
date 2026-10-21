# Passe — gestão da liga

Estudo de caso SENAI/PE, Desenvolvedor I (Fullstack): um sistema para cadastrar jogadores e clubes, negociar
jogadores com contrato de fidelidade, escalar os titulares, jogar partidas e acompanhar a classificação.

- **Backend:** NestJS (Node.js, TypeScript), TypeORM e PostgreSQL. Pasta [`backend/`](backend/).
- **Frontend:** React (TypeScript) com Vite. Pasta [`frontend/`](frontend/).
- **Banco:** PostgreSQL 16, criado por migrations versionadas em `backend/src/database/migrations`.

## Sumário

1. [Pré-requisitos](#1-pré-requisitos)
2. [Banco de dados: criar e recriar do zero](#2-banco-de-dados-criar-e-recriar-do-zero)
3. [Instalar e executar](#3-instalar-e-executar)
4. [Variáveis de ambiente](#4-variáveis-de-ambiente)
5. [Estrutura de pastas e bibliotecas](#5-estrutura-de-pastas-e-bibliotecas)
6. [Decisões e premissas](#6-decisões-e-premissas)
7. [Funcionalidades não implementadas](#7-funcionalidades-não-implementadas)
8. [Uso de inteligência artificial](#8-uso-de-inteligência-artificial)

---

## 1. Pré-requisitos

| Ferramenta | Versão | Para quê |
| --- | --- | --- |
| Ubuntu | 24.04 (também roda no Windows e no macOS) | sistema da banca |
| Node.js | 22 LTS (com npm 10) | backend e frontend |
| Docker Engine com Docker Compose v2 | 24 ou superior | sobe o PostgreSQL 16 (e, se quiser, a aplicação inteira) |
| Git | qualquer | clonar o repositório |

O PostgreSQL **não precisa ser instalado**: a imagem pública `postgres:16` é iniciada pelo Docker Compose.

## 2. Banco de dados: criar e recriar do zero

O banco criado por estes passos começa **vazio** (só as tabelas, sem jogadores, clubes, transações nem partidas).
Não há dados de exemplo no repositório.

**Criar** (a partir da raiz do repositório):

```bash
docker compose up -d db
# espere o banco ficar "healthy" (alguns segundos):
docker compose ps
```

Depois, na pasta `backend` (as tabelas são criadas pelas migrations):

```bash
cd backend
cp .env.example .env
npm ci
npm run migration:run
```

**Recriar do zero** (apaga o banco e cria de novo). Pare a API antes. Na raiz do repositório:

```bash
docker compose down -v
docker compose up -d db
docker compose ps
```

e, na pasta `backend`:

```bash
npm run migration:run
```

`docker compose down -v` remove os contêineres e o volume do banco; o `up` seguinte cria um banco novo e vazio.

## 3. Instalar e executar

### Opção A — um único comando (Docker): banco, API e interface

Na raiz do repositório:

```bash
docker compose up --build
```

- Interface: <http://localhost:5173>
- API: <http://localhost:3000> (as rotas ficam em `/api/v1`)
- Documentação interativa (Swagger): <http://localhost:3000/docs>

O contêiner da API roda as migrations antes de subir. Para recomeçar com o banco vazio: `docker compose down -v`.

### Opção B — passo a passo na máquina (banco no Docker)

Na raiz do repositório:

```bash
docker compose up -d db
```

Backend (pasta `backend`, em um terminal):

```bash
cd backend
cp .env.example .env
npm ci
npm run migration:run
npm run build
npm run start:prod
# API em http://localhost:3000 (o script da banca acrescenta /api/v1)
# Swagger em http://localhost:3000/docs
```

Frontend (pasta `frontend`, em outro terminal, a partir da raiz do repositório):

```bash
cd frontend
cp .env.example .env
npm ci
npm run dev
# Interface em http://localhost:5173
```

### Testes, lint e formatação

Todos terminam sozinhos (sem modo de observação) e só verificam, sem alterar arquivos.

```bash
# Backend (pasta backend)
npm test               # testes automatizados (Jest), incluindo o cálculo do valor de mercado (RN02 a RN05)
npm run lint           # Oxlint com regras de tipo
npm run format:check   # Prettier (só confere)

# Frontend (pasta frontend)
npm test               # testes de componente e de funções (Vitest + Testing Library)
npm run lint           # Oxlint
npm run format:check   # Prettier (só confere)
npm run build          # confere os tipos (tsc) e gera a versão de produção
```

Os testes do backend não precisam de banco. Para formatar de verdade: `npm run format`.

### Logs e documentação da API

- **Logs:** cada requisição é registrada pelo `Logger` do NestJS, com data e hora, método, caminho, status e duração, por exemplo
  `20/10/2026, 09:55:31  LOG [HTTP] POST /api/v1/players/8/buy 200 31ms`. Recusas (4xx) saem como aviso e falhas (5xx) como erro.
- **Swagger/OpenAPI:** em <http://localhost:3000/docs> (o JSON em `/docs-json`), com todos os endpoints, os parâmetros de consulta e os corpos.

## 4. Variáveis de ambiente

### Backend (`backend/.env`, modelo em `backend/.env.example`)

| Variável | Exemplo | Para quê |
| --- | --- | --- |
| `DATABASE_URL` | `postgres://desafio:desafio@localhost:5432/desafio` | endereço do PostgreSQL (usuário, senha e banco do `docker-compose.yml`) |
| `CORS_ORIGIN` | `http://localhost:5173` | única origem (a interface) autorizada a chamar a API |
| `PORT` | `3000` | porta da API |

### Frontend (`frontend/.env`, modelo em `frontend/.env.example`)

| Variável | Exemplo | Para quê |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:3000/api/v1` | endereço da API, **com** `/api/v1`. Se faltar, a interface usa esse mesmo valor |

No Docker Compose, as variáveis são definidas no próprio `docker-compose.yml`; nenhum arquivo `.env` é necessário.

## 5. Estrutura de pastas e bibliotecas

```text
.
├── docker-compose.yml        # banco, API e interface com um comando
├── backend/
│   ├── Dockerfile
│   └── src/
│       ├── common/           # relógio, horário de Brasília, pipes, filtro de erros, logs, Swagger
│       ├── players/          # jogadores: regras (domain), validação, listagem em SQL, controller
│       ├── clubs/            # clubes, caixa e patrimônio
│       ├── market/           # compra e venda com contrato de fidelidade
│       ├── transactions/     # histórico, totais e exportação CSV
│       ├── lineups/          # escalação por formação
│       ├── matches/          # motor da partida, partidas e classificação
│       └── database/         # entidades e migrations
└── frontend/
    ├── Dockerfile, nginx.conf
    └── src/
        ├── api/              # cliente HTTP, tipos e serviços por assunto
        ├── components/       # tabela, janelas, abas, selos, menu, filtros, logotipo
        ├── hooks/            # carregamento de dados, ações (sem clique duplo), avisos
        ├── lib/              # formatação de moeda e data, montagem do campo da partida
        ├── pages/            # jogadores, clubes (elenco, escalação, histórico) e partidas
        └── test/             # configuração e dados de apoio dos testes
```

### Bibliotecas do backend

| Biblioteca | Motivo |
| --- | --- |
| `@nestjs/common`, `core`, `platform-express`, `rxjs`, `reflect-metadata` | framework da API (módulos, controllers, injeção de dependência) |
| `@nestjs/config` | leitura das variáveis de ambiente (`.env`) |
| `@nestjs/typeorm`, `typeorm`, `pg` | acesso ao PostgreSQL, transações, travas de registro e migrations |
| `class-validator`, `class-transformer` | validação dos corpos de requisição (DTOs) com mensagens em português |
| `@nestjs/swagger` | documentação interativa OpenAPI em `/docs` |
| `jest`, `ts-jest`, `@nestjs/testing` | testes automatizados |
| `oxlint`, `oxlint-tsgolint` | lint, inclusive regras que usam tipos (promessa sem `await`) |
| `prettier` | formatação |
| `typescript`, `ts-node`, `@nestjs/cli` | compilação e execução das migrations |

### Bibliotecas do frontend

| Biblioteca | Motivo |
| --- | --- |
| `react`, `react-dom`, `vite`, `@vitejs/plugin-react` | interface e ferramenta de build (templates oficiais) |
| `react-router-dom` | rotas no navegador (`/jogadores`, `/clubes/1`, `/partidas/2`...) |
| `react-hook-form`, `zod`, `@hookform/resolvers` | formulários e validação de campo (tamanhos e faixas) antes de enviar |
| `lucide-react` | ícones do mockup |
| `@fontsource-variable/geist` | fonte Geist do mockup, servida pelo próprio projeto (sem depender de CDN) |
| `vitest`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom` | testes de componente |
| `oxlint`, `prettier` | lint e formatação |

Não foi usada biblioteca de estado (Redux, Zustand): os dados da API ficam em hooks (`useRequest`, `useAction`).

## 6. Decisões e premissas

O enunciado deixa alguns detalhes em aberto; estas foram as escolhas:

- **Dinheiro:** os cálculos usam centavos inteiros, com arredondamento do meio para longe do zero, e o banco guarda `numeric(x,2)`. A API devolve números com 2 casas; a interface formata com vírgula decimal e a unidade "moedas".
- **Valor de mercado e overall não são gravados:** são calculados a cada consulta a partir de condição, agilidade e idade (e dos atributos). Só o **valor base** é gravado, uma vez, no cadastro. Os percentuais são tratados em por mil (150 = 15%), sem ponto flutuante.
- **Listagem de jogadores:** o filtro por valor de mercado e a ordenação precisam do valor calculado, então a fórmula também existe em SQL (com `unaccent` para a busca sem acento). A versão em TypeScript tem testes unitários; a versão em SQL foi conferida contra ela com os exemplos do enunciado.
- **Exclusão de jogador é lógica** (`deleted_at`): o jogador some da lista e das consultas, mas as transações e partidas antigas dele continuam gravadas. Só jogador livre pode ser excluído.
- **Concorrência:** compra, venda, escalação e partida rodam em transação com travas de registro (`FOR UPDATE`); a criação de clube usa trava consultiva para o limite de 20 clubes não furar com dois pedidos ao mesmo tempo.
- **Horário:** o relógio é injetado (testável). As datas são aceitas e devolvidas no horário de Brasília (`-03:00`) e gravadas em `timestamptz`.
- **Erros:** a API sempre responde `{ "message": "..." }` em JSON. `400` para dado ou parâmetro inválido, `404` para recurso inexistente (inclusive id que não é número inteiro positivo) e `409` para regra de negócio. Um corpo que não é objeto também é `400`; campos desconhecidos são ignorados.
- **Partida sem sorteio:** o resultado sai só dos atributos dos titulares (RN20). Os 6 duelos, as formações e a condição de cada titular ficam gravados na partida, então abrir uma partida antiga mostra exatamente o que aconteceu.
- **Classificação** é calculada a cada consulta a partir das partidas, nunca gravada.
- **Nomes no banco em inglês** (`players`, `clubs`, `loyalty_until`...), seguindo o `snake_case` da API; a interface e as mensagens estão em português.
- **Interface não recalcula nada que a API devolve.** A única conta é somar valor e taxa para mostrar o custo total da compra. As recusas de regra (`409`) são mostradas com o `message` da API; a tela só impede o que já sabe pelos dados carregados (jogador doente fora das opções da escalação, posição de quem tem clube, idade que diminui, "Livres" junto com filtro por clube).
- **Sugestão no formulário de compra:** a data do fim da fidelidade já vem preenchida com daqui a um ano, às 15:00; pode ser trocada.
- **Mockup:** o layout segue o mockup do Figma (tela de boas-vindas, barra lateral, telas e estados); a fidelidade visual não conta ponto, então pequenas diferenças de espaçamento podem existir.
- **Docker:** a API roda as migrations ao subir; a interface é servida pelo Nginx e o endereço da API é gravado na construção da imagem (`VITE_API_URL`, o endereço que o navegador enxerga).

## 7. Funcionalidades não implementadas

Nenhuma funcionalidade obrigatória do enunciado ficou de fora.

Limitações conhecidas:

- Os testes do frontend cobrem as funções de formatação e de montagem do campo, os componentes de lista, paginação e selos, e a janela de compra. Não há testes de ponta a ponta (navegador real).
- Não há dados de exemplo no repositório (o banco nasce vazio, como pede o enunciado).

## 8. Uso de inteligência artificial

> **Declaração.** Revise esta seção e deixe só o que é verdade para o seu caso.

- **Ferramenta:** Claude (Anthropic), pelo Claude Code, em modo agente, durante todo o desenvolvimento.
- **Onde:**
  - **Backend:** estrutura dos módulos, regras de negócio (cálculo do valor de mercado, compra, venda, escalação, motor de partidas, classificação), consultas SQL da listagem, migrations, filtros de erro, testes unitários, Swagger e logs.
  - **Frontend:** telas, componentes, hooks, formulários, o campo da partida e os testes.
  - **Infraestrutura:** Dockerfiles, `docker-compose.yml` e este README.
- **Como e por quê:** a IA escreveu código a partir dos requisitos do enunciado e do mockup; o autor decidiu o escopo, revisou, executou os testes e usou a aplicação no navegador. O objetivo foi cumprir o prazo e manter o código consistente.
- **O que foi aceito, alterado ou descartado:**
  - Aceito: a arquitetura por módulos, o cálculo em centavos e a validação só do corpo da requisição.
  - Alterado: nomes de tabelas e colunas em inglês (decisão do autor); a conversão automática de tipos do `ValidationPipe` foi trocada por um pipe próprio, porque ela deixava passar ids como `01`.
  - Descartado: biblioteca de estado global (Redux, Zustand), por não ser necessária; os dados da API ficam em hooks.
- **Responsabilidade:** o autor se responsabiliza pelo código entregue e consegue explicá-lo.
