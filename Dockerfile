# Strona z raportami audytu (statyczna). Raporty generuje się poleceniami npm run audyt / raport / checklista.
FROM nginx:1.27-alpine
COPY www/nginx.conf /etc/nginx/conf.d/default.conf
COPY raporty/ /usr/share/nginx/html/
RUN find /usr/share/nginx/html -type f -exec chmod 0644 {} +

EXPOSE 80
