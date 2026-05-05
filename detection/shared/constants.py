"""
Constantes partagées entre tous les agents et le moteur CEP.
"""

# ─── Topics Kafka ──────────────────────────────────────────────────────────────
TOPIC_WEB        = "alerts.web"
TOPIC_APP        = "alerts.app"
TOPIC_DB         = "alerts.db"
TOPIC_CORRELATED = "alerts.correlated"

KAFKA_BOOTSTRAP  = "kafka:9092"

# ─── Seuils — Web Agent ────────────────────────────────────────────────────────
WEB_DDOS_REQ_PER_MIN    = 100   # WEB-004 : requêtes/min par IP
WEB_DDOS_WINDOW_SEC     = 60

# ─── Seuils — App Agent ────────────────────────────────────────────────────────
APP_BRUTE_FORCE_FAILS   = 5     # APP-001 : échecs login
APP_BRUTE_FORCE_WIN_SEC = 60
APP_PRIV_ESC_HITS       = 3     # APP-002 : hits /api/admin/* non-autorisés
APP_PRIV_ESC_WIN_SEC    = 60
APP_INSIDER_ORDERS      = 10    # APP-003 : commandes par session
APP_INSIDER_WIN_SEC     = 300
APP_DOS_PROBE_MS        = 5000  # APP-004 : response_time seuil
APP_PAYLOAD_MAX_BYTES   = 50000 # APP-005 : content_length POST

# ─── Seuils — DB Agent ────────────────────────────────────────────────────────
DB_FLOOD_QUERIES        = 200   # DB-004 : requêtes/10s par thread_id
DB_FLOOD_WIN_SEC        = 10
DB_SLOW_QUERY_SEC       = 2     # DB-006 : slow query seuil

# ─── Fenêtres CEP (secondes) ──────────────────────────────────────────────────
CEP_WIN = {
    "CEP-1": 30,
    "CEP-2": 120,
    "CEP-3": 60,
    "CEP-4": 20,
    "CEP-5": 300,
    "CEP-6": 120,
    "CEP-7": 300,
}

# ─── Scores de risque CEP ─────────────────────────────────────────────────────
CEP_SCORES = {
    "CEP-1": 95,
    "CEP-2": 90,
    "CEP-3": 88,
    "CEP-4": 92,
    "CEP-5": 85,
    "CEP-6": 80,
    "CEP-7": 75,
}