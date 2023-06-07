FROM node:lts-hydrogen as build

WORKDIR /code

COPY package.json  ./
RUN npm install --legacy-peer-deps --registry=https://registry.npm.taobao.org

ADD . /code
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /code/dist/ /usr/share/nginx/html/
COPY nginx.default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]