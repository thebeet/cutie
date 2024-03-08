FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package.json ./
COPY yarn.lock ./
RUN yarn --registry https://registry.npmmirror.com/
COPY . .
RUN yarn build

FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY --from=builder /usr/src/app/dist .
COPY ./build/nginx.conf /etc/nginx/conf.d/default.conf
