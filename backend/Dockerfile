FROM node:22.12.0-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --ignore-scripts

COPY . .

RUN npx prisma generate

EXPOSE 5000

CMD ["node", "server.js"]