"""
Configuration centralisée pour toutes les simulations CEP.
"""

# ── Infrastructure ─────────────────────────────────────────────────────────
BASE_URL        = "http://localhost:8000"
API_URL         = f"{BASE_URL}/api"
KAFKA_CONTAINER = "first-born-kafka-1"
MYSQL_CONTAINER = "first-born-mysql-1"
REDIS_CONTAINER = "first-born-redis-1"
LARAVEL_CONTAINER = "first-born-laravel-1"
KAFKA_BROKER    = "localhost:9092"

# ── Comptes de test ────────────────────────────────────────────────────────
ADMIN_EMAIL    = "admin@luxe.com"
ADMIN_PASSWORD = "password"
USER_EMAIL     = "test@example.com"
USER_PASSWORD  = "password"

# ── Kafka Topics ───────────────────────────────────────────────────────────
TOPIC_WEB        = "alerts.web"
TOPIC_APP        = "alerts.app"
TOPIC_DB         = "alerts.db"
TOPIC_CORRELATED = "alerts.correlated"

# ── IPs simulées (une par CEP pour éviter les interférences) ────────────────
IP_CEP1          = "10.10.1.1"
IP_CEP2          = "10.10.2.1"
IP_CEP3          = "10.10.3.1"
IP_CEP4          = "10.10.4.1"
IP_CEP5          = "10.10.5.1"
IP_CEP6_VICTIM   = "10.10.6.10"
IP_CEP6_ATTACKER = "10.10.6.99"
IP_CEP7          = "10.10.7.1"

# ── Couleurs terminal ──────────────────────────────────────────────────────
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"
DIM    = "\033[2m"
RESET  = "\033[0m"
