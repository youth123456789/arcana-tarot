FROM node:24-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server ./server
COPY shared ./shared
COPY app ./app

RUN mkdir -p /data
ENV PORT=4173
ENV DB_PATH=/data/arcana.db
VOLUME ["/data"]
EXPOSE 4173

CMD ["node", "server/index.js"]
