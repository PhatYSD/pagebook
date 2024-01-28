FROM node:21-alpine3.18

RUN mkdir -p /app

WORKDIR /app

COPY ./package*.json /app/
COPY .env /app/

ENV PATH /app/node_modules/.bin:$PATH

RUN npm install

COPY ./ /app

RUN npx prisma generate

EXPOSE 5000

ENV NODE_ENV=prod

RUN npm run build

CMD ["npm", "start"]