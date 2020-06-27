FROM node:14-alpine

WORKDIR /app

COPY LICENSE .

COPY package.json package-lock.json ./
COPY lib ./lib
COPY cli.js index.js ./
RUN npm install --production

USER node

ENTRYPOINT [ "/app/cli.js" ]
