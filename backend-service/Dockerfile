FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:18-alpine AS runner

ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./

EXPOSE 3000

RUN npx prisma migrate deploy

CMD ["node", "dist/index.js"]
