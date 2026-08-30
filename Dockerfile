# Multi-stage: сначала собираем статику Vite-приложения, затем отдаём её
# лёгким nginx - в финальном образе нет ни node_modules, ни исходников,
# только собранный dist/.
#
# ВАЖНО про VITE_SHYN_API_BASE: Vite подставляет переменные окружения
# в код НА ЭТАПЕ СБОРКИ (build time), а не при запуске контейнера - поэтому
# адрес API передаётся через --build-arg, а не через `environment:` в
# docker-compose (это не сработало бы). Если адрес API меняется - нужно
# пересобрать образ, а не просто перезапустить контейнер с новой
# переменной окружения.

FROM node:20-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_SHYN_API_BASE=http://127.0.0.1:5001
ENV VITE_SHYN_API_BASE=${VITE_SHYN_API_BASE}
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# SPA-роутинг: любой путь без совпадающего файла отдаём как index.html,
# иначе прямой переход по URL (например /report/1) даст 404 от nginx.
RUN printf 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
