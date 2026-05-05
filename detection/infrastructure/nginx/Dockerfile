FROM owasp/modsecurity-crs:nginx-alpine

# L'image OWASP gère nginx.conf et crs-setup.conf via ses propres scripts
# de démarrage. Ne pas les copier — le script 95-configure-rules.sh
# a besoin de modifier crs-setup.conf et échoue si le fichier est read-only.
#
# Configuration via variables d'environnement dans docker-compose.yml :
#   PARANOIA, ANOMALY_INBOUND, ANOMALY_OUTBOUND, etc.
#
# On injecte uniquement :
# 1. Notre vhost custom (conf.d/)
# 2. modsecurity.conf moteur (pas les règles CRS)

COPY conf.d/app.conf              /etc/nginx/templates/conf.d/app.conf.template
COPY modsecurity/modsecurity.conf /etc/modsecurity.d/modsecurity.conf

EXPOSE 80