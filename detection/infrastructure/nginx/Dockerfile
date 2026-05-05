FROM owasp/modsecurity-crs:nginx-alpine

USER root
RUN mkdir -p /logs && chmod 777 /logs

COPY conf.d/app.conf              /etc/nginx/templates/conf.d/app.conf.template
COPY modsecurity/modsecurity.conf /etc/modsecurity.d/modsecurity.conf

EXPOSE 80