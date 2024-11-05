FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8888

RUN npm run build

CMD ["npm", "start"]

