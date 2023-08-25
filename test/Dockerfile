FROM cypress/base:16
WORKDIR /app

COPY package.json .
COPY package-lock.json .
COPY ./cypress ./cypress
COPY cypress.config.ts .
COPY tsconfig.json .

RUN npm ci

RUN npx cypress verify