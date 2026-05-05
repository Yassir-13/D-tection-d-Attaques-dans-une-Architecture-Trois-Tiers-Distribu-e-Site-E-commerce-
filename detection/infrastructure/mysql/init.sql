-- init.sql — exécuté au premier démarrage du container MySQL
-- Les tables sont créées par les migrations Laravel (php artisan migrate)

CREATE DATABASE IF NOT EXISTS `ecommerce`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- app_user est créé par MYSQL_USER/MYSQL_PASSWORD dans docker-compose
GRANT ALL PRIVILEGES ON `ecommerce`.* TO 'app_user'@'%';
FLUSH PRIVILEGES;