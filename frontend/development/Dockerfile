FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY ../package.json ../package-lock.json ./
RUN  npm install --production

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ../node_modules
COPY . .

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=builder /app ./

EXPOSE 3000

ENV PORT 3000

RUN apk --no-cache add curl

COPY ../scripts/dev-entrypoint.sh /
RUN chmod +x /dev-entrypoint.sh
ENTRYPOINT ["/bin/sh", "/dev-entrypoint.sh"]
