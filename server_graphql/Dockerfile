FROM node:22

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install

COPY . .

RUN yarn build  

EXPOSE 4000

CMD [ "node", "dist/index.js" ]