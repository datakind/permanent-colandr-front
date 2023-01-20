FROM node:10.15.3

ENV NODE_ENV development
ENV API_URL http://localhost:5000
ENV JWT_SECRET_KEY jwtcolandrtest
ENV SESSION_SECRET_KEY fk94jrfmn0jcnw9h9r
ENV APP_LOGIN_EMAIL colandr@datakind.org
ENV APP_LOGIN_PASSWORD CHANGEPASSWORD!@

WORKDIR /app

COPY . /app/

RUN npm install

CMD npm start