FROM node:20-alpine AS deps

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev && npm cache clean --force


FROM node:20-alpine AS runtime

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY package*.json ./
COPY app.js ./

RUN addgroup -S app && adduser -S app -G app

USER app

EXPOSE 3000

CMD ["node", "app.js"]
