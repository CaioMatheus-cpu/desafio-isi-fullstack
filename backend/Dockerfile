# Imagem da API: compila com as dependências de desenvolvimento e leva só o
# necessário para rodar (dependências de produção + código compilado).
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
EXPOSE 3000
# As migrations rodam antes de a API subir: o banco começa vazio, só com as tabelas.
CMD ["sh", "-c", "node_modules/.bin/typeorm migration:run -d dist/database/data-source.js && node dist/main"]
