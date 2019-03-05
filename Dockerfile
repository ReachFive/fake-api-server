FROM node:10.15.2-alpine

COPY . /www

WORKDIR /www

RUN npm i

ENV PORT 1090

CMD ["npm", "start"]
