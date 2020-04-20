FROM node:13.13-alpine3.10

# This is required for native libs that aren't built for alpine
RUN npm install -g nodemon

ENV NODE_ENV=development

WORKDIR /app
COPY package.json package-lock.json ./

# All packages added here will be REMOVED automatically and are only for
# native libs that aren't built for alpine
# They are not available during runtime
RUN apk --no-cache add --virtual builds-deps build-base python libc6-compat && \
    npm install && \
    apk del builds-deps

ADD . .

USER node

CMD ["nodemon"]
