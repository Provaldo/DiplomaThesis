FROM node:16-alpine

WORKDIR /usr/src/consumer

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install

COPY . .

# EXPOSE 5000
CMD ["node", "src/consumerProcess.js"]