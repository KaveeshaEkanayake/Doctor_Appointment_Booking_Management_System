FROM node:22.12.0-alpine

RUN apk add --no-cache openssl ca-certificates

WORKDIR /app

COPY package*.json ./

RUN npm ci --ignore-scripts

COPY . .

RUN DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder" npx prisma generate

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "server.js"]