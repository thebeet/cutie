FROM node:20-alpine AS builder
WORKDIR /usr/src/app
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories && \
    apk --no-cache add tzdata ca-certificates && ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime 
COPY package.json ./
COPY yarn.lock ./
RUN yarn --registry https://registry.npmmirror.com/
COPY . .
RUN yarn build

FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY --from=builder /usr/src/app/dist .
COPY ./build/nginx.conf /etc/nginx/conf.d/default.conf
