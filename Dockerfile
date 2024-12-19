FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
# COPY yarn.lock ./

RUN npm install -g node-gyp
RUN yarn add ts-node typescript --ignore-scripts

RUN yarn global add nodemon ts-node typescript && \
    yarn install --ignore-scripts

COPY . .

CMD [ "yarn", "dev" ]
