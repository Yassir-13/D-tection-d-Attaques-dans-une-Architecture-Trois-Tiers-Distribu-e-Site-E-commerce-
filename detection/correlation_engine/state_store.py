"""
State store Redis pour le moteur CEP.
Utilise ZADD/ZRANGEBYSCORE pour les fenêtres temporelles glissantes.
Clé = "cep:{rule_id}:{dimension}" où dimension = source_ip ou user_id.
"""

import json
import time
import redis

_client = redis.Redis(host="redis", port=6379, db=2, decode_responses=True)


def add_alert(rule_id: str, dimension: str, alert_data: dict, ttl_sec: int) -> None:
    """Ajoute une alerte dans la fenêtre temporelle Redis."""
    key = f"cep:{rule_id}:{dimension}"
    score = time.time()
    value = json.dumps(alert_data)
    _client.zadd(key, {value: score})
    _client.expire(key, ttl_sec * 2)  # TTL = 2x la fenêtre pour la sécurité


def get_alerts_in_window(rule_id: str, dimension: str, window_sec: int) -> list[dict]:
    """Retourne les alertes dans la fenêtre glissante."""
    key = f"cep:{rule_id}:{dimension}"
    now = time.time()
    min_score = now - window_sec
    entries = _client.zrangebyscore(key, min_score, now)
    return [json.loads(e) for e in entries]


def count_in_window(rule_id: str, dimension: str, window_sec: int) -> int:
    """Compte les alertes dans la fenêtre glissante."""
    key = f"cep:{rule_id}:{dimension}"
    now = time.time()
    min_score = now - window_sec
    return _client.zcount(key, min_score, now)


def clear_window(rule_id: str, dimension: str) -> None:
    """Vide la fenêtre après déclenchement CEP pour éviter les doublons."""
    key = f"cep:{rule_id}:{dimension}"
    _client.delete(key)


def ping() -> bool:
    try:
        return _client.ping()
    except Exception:
        return False