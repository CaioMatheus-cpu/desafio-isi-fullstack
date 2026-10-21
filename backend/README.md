# Backend — API do Passe

API REST em NestJS (TypeScript), com TypeORM e PostgreSQL. As instruções completas (pré-requisitos, banco,
como executar, variáveis de ambiente, decisões e uso de IA) estão no [README da raiz](../README.md).

Resumo dos comandos, nesta pasta:

```bash
cp .env.example .env
npm ci
npm run migration:run     # cria as tabelas (o banco começa vazio)
npm run build
npm run start:prod        # http://localhost:3000, rotas em /api/v1, Swagger em /docs

npm test                  # testes automatizados
npm run lint              # Oxlint
npm run format:check      # Prettier (só confere); para formatar: npm run format
```
