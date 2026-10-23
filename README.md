# Passe — gestão da liga

Estudo de caso SENAI/PE, Desenvolvedor I (Fullstack): um sistema para cadastrar jogadores e clubes, negociar
jogadores com contrato de fidelidade, escalar os titulares, jogar partidas e acompanhar a classificação.

- **Backend:** NestJS (Node.js, TypeScript), TypeORM e PostgreSQL. Pasta [`backend/`](backend/).
- **Frontend:** React (TypeScript) com Vite. Pasta [`frontend/`](frontend/).
- **Banco:** PostgreSQL 16, criado por migrations versionadas em `backend/src/database/migrations`.

## Início rápido

Com Docker e Docker Compose v2 instalados, na raiz do repositório:

```bash
docker compose up --build
```

| O quê | Onde |
| --- | --- |
| Interface | <http://localhost:5173> |
| API | <http://localhost:3000/api/v1> |
| Swagger | <http://localhost:3000/docs> |

O banco nasce vazio; para recomeçar do zero: `docker compose down -v`. Os outros modos de execução estão na [seção 3](#3-instalar-e-executar).

## Sumário

1. [Pré-requisitos](#1-pré-requisitos)
2. [Banco de dados: criar e recriar do zero](#2-banco-de-dados-criar-e-recriar-do-zero)
3. [Instalar e executar](#3-instalar-e-executar)
4. [Variáveis de ambiente](#4-variáveis-de-ambiente)
5. [Estrutura de pastas e bibliotecas](#5-estrutura-de-pastas-e-bibliotecas)
6. [Funcionalidades não implementadas](#6-funcionalidades-não-implementadas)
7. [Uso de LLM](#7-uso-de-llm)

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

### Bibliotecas (além do básico de NestJS, React e Vite)

| Biblioteca | Motivo |
| --- | --- |
| `typeorm`, `pg` | acesso ao PostgreSQL, transações, travas de registro e migrations |
| `class-validator`, `class-transformer` | validação dos corpos de requisição com mensagens em português |
| `@nestjs/swagger` | documentação OpenAPI em `/docs` |
| `react-router-dom` | rotas no navegador |
| `react-hook-form`, `zod` | formulários e validação de campo antes de enviar |
| `lucide-react`, `@fontsource-variable/geist` | ícones e fonte do mockup (fonte servida pelo projeto, sem CDN) |
| `jest`, `vitest`, `@testing-library/react` | testes do backend e do frontend |
| `oxlint`, `prettier` | lint e formatação |

Não foi usada biblioteca de estado (Redux, Zustand): os dados da API ficam em hooks (`useRequest`, `useAction`).

## 6. Funcionalidades não implementadas

Nenhuma funcionalidade obrigatória do enunciado ficou de fora.

Limitações conhecidas:

- Os testes do frontend cobrem as funções de formatação e de montagem do campo, os componentes de lista, paginação e selos, e a janela de compra. Não há testes de ponta a ponta (navegador real).

## 7. Uso de LLM

- **Ferramenta:** Claude (Anthropic), pelo Claude Code.
- **Onde ajudou bastante:**
  - **Frontend, na parte estética:** layout, estilos e componentes visuais, seguindo o mockup do Figma.
  - **README:** estrutura e redação deste documento.
- **Onde ajudou pontualmente:** no **backend**, em partes específicas (por exemplo, apoio em trechos de código e dúvidas), sem ser a base da implementação.
- **O que foi feito por mim:** a lógica do sistema, as regras de negócio e a arquitetura do backend, além das decisões de escopo, a revisão do que o LLM sugeriu, a execução dos testes e o uso da aplicação no navegador.
- **Como usei:** o LLM foi apoio. Li, ajustei ou descartei o que ele sugeriu antes de aceitar.
