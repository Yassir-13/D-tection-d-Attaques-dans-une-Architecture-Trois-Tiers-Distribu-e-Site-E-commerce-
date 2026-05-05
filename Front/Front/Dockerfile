FROM node:20-alpine AS builder

WORKDIR /app

# Dépendances (cache layer)
COPY package.json package-lock.json ./
RUN npm ci

# Code source
COPY . .

# Variables d'environnement build-time injectées depuis docker-compose args
ARG VITE_API_URL=http://localhost:8000/api
ARG VITE_BASE_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_BASE_URL=$VITE_BASE_URL

RUN npm run build

# ─── FIX: image finale copie le dist vers le volume react_static ──────────────
# Le volume react_static est monté en /output dans docker-compose
# Nginx lit ce volume en /var/www/react (lecture seule)
FROM alpine:3.19
WORKDIR /app
COPY --from=builder /app/dist ./dist

# Ce container est one-shot : copie le build dans le volume puis s'arrête
CMD ["sh", "-c", "cp -r /app/dist/. /output/ && echo '✅ Build React copié dans react_static.'"]