FROM node:10.15.3

ENV NODE_ENV=development

WORKDIR /app

COPY . /app/

RUN npm install

CMD npm start