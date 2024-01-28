FROM node:21-alpine3.18

RUN mkdir -p /app

WORKDIR /app

COPY package*.json /app/

RUN npm install

COPY . /app

RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "preview"]