#!/bin/bash
set -e

echo "⏳ Attente MySQL..."
until php -r "new PDO('mysql:host=${DB_HOST};port=${DB_PORT};dbname=${DB_DATABASE}', '${DB_USERNAME}', '${DB_PASSWORD}');" 2>/dev/null; do
  echo "   MySQL pas encore prêt, retry dans 2s..."
  sleep 2
done
echo "✅ MySQL prêt."

# FIX: APP_KEY ne doit PAS être générée ici — elle doit être dans .env.docker
# Si elle est absente, on lève une erreur claire plutôt que de générer en éphémère
if [ -z "$APP_KEY" ]; then
  echo ""
  echo "❌ ERREUR : APP_KEY est vide dans .env.docker"
  echo "   Génère une clé avec : php artisan key:generate --show"
  echo "   Puis colle la valeur dans .env.docker à la ligne APP_KEY="
  echo ""
  exit 1
fi

# Migrations
echo "⏳ Lancement des migrations..."
php artisan migrate --force
echo "✅ Migrations terminées."

# Cache config en prod (accélère Laravel)
php artisan config:cache
php artisan route:cache

exec "$@"