FROM node:18 AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ARG ENVIRONMENT

RUN echo $ENVIRONMENT

RUN npm run build -- --configuration=$ENVIRONMENT

FROM 192.168.8.240:8086/infra/nginx:alpine

COPY --from=build /app/dist/mis-web-app/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
