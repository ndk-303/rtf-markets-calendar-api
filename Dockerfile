FROM node:20-alpine AS base

RUN apk add --no-cache dumb-init

WORKDIR /app

COPY package*.json ./

FROM base AS deps
RUN npm install --omit=dev --ignore-scripts

FROM node:20-alpine AS production

RUN apk add --no-cache dumb-init

ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs && \
  adduser  -S nodejs -u 1001

WORKDIR /app

COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
