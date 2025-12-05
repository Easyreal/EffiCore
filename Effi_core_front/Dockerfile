FROM nginx:stable-alpine

# Копируем конфигурацию Nginx
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/

# Копируем СОБРАННОЕ приложение из первого этапа
COPY /dist /usr/share/nginx/html/dist

CMD ["nginx", "-g", "daemon off;"]