"""
Web Agent — lit Nginx access.log en tail -f, applique les règles, publie sur Kafka.
"""

import os
import sys
import time

import metrics
import kafka_producer as kp
import rules
from log_parser import parse_line
from kafka_schemas import Alert

LOG_PATH = os.getenv("LOG_PATH", "/logs/access.log")


def tail(path: str):
    """Générateur qui suit un fichier comme tail -f."""
    with open(path, "r") as f:
        # Tenter de se positionner à la fin (pas toujours supporté)
        try:
            f.seek(0, 2)
        except Exception:
            pass
        while True:
            line = f.readline()
            if line:
                yield line
            else:
                time.sleep(0.1)


def main() -> None:
    metrics.start(9101)
    print(f"[web_agent] Watching {LOG_PATH}")

    # Attendre que le fichier existe (Nginx peut démarrer après l'agent)
    while not os.path.exists(LOG_PATH):
        print(f"[web_agent] Waiting for {LOG_PATH}...")
        time.sleep(2)

    for line in tail(LOG_PATH):
        entry = parse_line(line)
        if entry is None:
            continue

        # Métriques de base sur chaque requête
        metrics.requests_total.labels(
            method=entry.method,
            status=str(entry.status),
        ).inc()

        # Appliquer les règles
        result = rules.check(entry)
        if result is None:
            continue

        rule_id, attack_type, severity = result

        alert = Alert(
            tier="web",
            source_ip=entry.ip,
            attack_type=attack_type,
            severity=severity,
            confidence=1.0,
            raw_evidence=line.strip()[:500],
            rule_id=rule_id,
        )

        kp.send(alert.to_kafka(), key=entry.ip)

        metrics.alerts_total.labels(
            tier="web",
            attack_type=attack_type,
            severity=severity,
        ).inc()
        metrics.rule_hits.labels(rule_id=rule_id).inc()

        print(f"[web_agent] ALERT {rule_id} {attack_type} from {entry.ip}")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        kp.flush()
        sys.exit(0)