# Frontend — interface do Passe

React (TypeScript) com Vite. As instruções completas (pré-requisitos, como executar, variáveis de ambiente,
decisões e uso de IA) estão no [README da raiz](../README.md).

Resumo dos comandos, nesta pasta:

```bash
cp .env.example .env
npm ci
npm run dev               # http://localhost:5173 (a API precisa estar em VITE_API_URL)

npm test                  # testes de componente e de funções (Vitest)
npm run lint              # Oxlint
npm run format:check      # Prettier (só confere); para formatar: npm run format
npm run build             # confere os tipos e gera a versão de produção
```

Telas: boas-vindas (`/`), jogadores, clubes (elenco, escalação e histórico), partidas e classificação.
