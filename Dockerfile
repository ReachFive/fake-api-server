FROM alpine:3.4

RUN apk add --update nodejs bash git

COPY . /www

WORKDIR /www

RUN npm i && npm run build 

ENV PORT 1090

CMD ["npm", "start"]
