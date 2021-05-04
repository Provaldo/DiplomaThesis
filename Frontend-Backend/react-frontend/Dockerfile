# Step 1

FROM node:16-alpine as build-step

RUN mkdir /app

WORKDIR /app

COPY package.json /app

RUN npm install

COPY . /app

# EXPOSE 3000

# CMD npm start


RUN npm run build

# Stage 2

FROM nginx:1.19-alpine

COPY --from=build-step /app/build /usr/share/nginx/html

