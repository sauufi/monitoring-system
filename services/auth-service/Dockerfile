# services/auth-service/Dockerfile
FROM node:16-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 3001

CMD ["node", "app.js"]