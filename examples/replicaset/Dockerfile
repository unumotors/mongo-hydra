FROM node:14-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production
COPY index.js ./

USER node

ENTRYPOINT [ "node", "/app/index.js" ]
