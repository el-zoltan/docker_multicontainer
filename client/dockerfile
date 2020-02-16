FROM node:alpine as frontend
WORKDIR '/app'
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

FROM nginx
COPY --from=frontend /app/build /usr/share/nginx/html