"""
Utilitaire d'injection d'alertes dans Kafka via docker exec.
Partagé par tous les scripts de simulation CEP.
"""

import json
import subprocess
import time
import uuid
from datetime import datetime, timezone

from config import KAFKA_CONTAINER, KAFKA_BROKER, GREEN, RED, YELLOW, RESET


def _make_alert(tier, attack_type, severity,
                source_ip="10.0.0.1",
                user_id=None,
                session_token_hash=None,
                rule_id="",
                extra=None):
    return {
        "alert_id":           str(uuid.uuid4()),
        "timestamp":          datetime.now(timezone.utc).isoformat(),
        "tier":               tier,
        "source_ip":          source_ip,
        "session_token_hash": session_token_hash,
        "user_id":            user_id,
        "attack_type":        attack_type,
        "severity":           severity,
        "confidence":         1.0,
        "raw_evidence":       f"[SIM] {attack_type}",
        "rule_id":            rule_id,
        "extra":              extra or {},
    }


def inject(topic, tier, attack_type, severity, source_ip="10.0.0.1",
           user_id=None, session_token_hash=None, rule_id="", extra=None):
    """Injecte une alerte dans un topic Kafka via docker exec."""
    alert   = _make_alert(tier, attack_type, severity,
                          source_ip, user_id, session_token_hash,
                          rule_id, extra)
    payload = json.dumps(alert, ensure_ascii=False)

    cmd = [
        "docker", "exec", "-i", KAFKA_CONTAINER,
        "kafka-console-producer",
        "--broker-list", KAFKA_BROKER,
        "--topic", topic,
    ]
    result = subprocess.run(cmd, input=payload,
                            capture_output=True, text=True, timeout=10)
    if result.returncode != 0:
        print(f"  {RED}[kafka_inject] ERREUR: {result.stderr.strip()[:120]}{RESET}")
        return False
    return True


def flush_redis_cep_state():
    """Vide le state CEP Redis (DB 2) pour un départ propre."""
    from config import REDIS_CONTAINER
    subprocess.run(
        ["docker", "exec", REDIS_CONTAINER, "redis-cli", "-n", "2", "FLUSHDB"],
        capture_output=True
    )
    print(f"  {YELLOW}[redis] State CEP vidé.{RESET}")


def check_kafka():
    """Vérifie que Kafka est accessible."""
    result = subprocess.run(
        ["docker", "exec", KAFKA_CONTAINER,
         "kafka-broker-api-versions", "--bootstrap-server", KAFKA_BROKER],
        capture_output=True, text=True, timeout=15
    )
    return result.returncode == 0


def step(msg):
    print(f"  {YELLOW}>{RESET} {msg}")


def ok(msg):
    print(f"  {GREEN}OK {msg}{RESET}")


def wait(sec, reason=""):
    label = f" - {reason}" if reason else ""
    print(f"  {YELLOW}... attente {sec}s{label}{RESET}")
    time.sleep(sec)
