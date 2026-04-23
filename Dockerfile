FROM node:22-alpine

RUN corepack enable && corepack prepare pnpm@10.33.1 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY api/package.json api/package.json
COPY api-e2e/package.json api-e2e/package.json

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm prisma generate && pnpm nx run @org/api:build

EXPOSE 3000

CMD ["sh", "-c", "pnpm prisma migrate deploy && node api/dist/main.js"]
