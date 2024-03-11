FROM node:20-alpine AS builder
WORKDIR /usr/src/app
#COPY package.json ./
#COPY yarn.lock ./
COPY . .
RUN yarn --registry https://registry.npmmirror.com/
RUN yarn build

FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY --from=builder /usr/src/app/packages/web3d-entry/dist .
COPY ./build/nginx.conf /etc/nginx/conf.d/default.conf
