FROM node:lts-hydrogen as build

WORKDIR /tmp

COPY package.json webpack.production.config.js tsconfig.json ./
COPY src ./src
COPY public ./public

RUN npm install --legacy-peer-deps --registry=https://registry.npm.taobao.org
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /tmp/dist/ /usr/share/nginx/html/
COPY nginx.default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]