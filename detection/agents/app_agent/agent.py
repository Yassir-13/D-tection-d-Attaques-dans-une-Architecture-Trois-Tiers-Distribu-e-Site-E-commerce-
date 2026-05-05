"""
App Agent — lit audit.jsonl Laravel en tail -f, applique les règles, publie sur Kafka.
"""

import os
import sys
import time

import metrics
import kafka_producer as kp
import rules
from log_parser import parse_line
from kafka_schemas import Alert

LOG_PATH = os.getenv("LOG_PATH", "/var/log/laravel/audit.jsonl")


def tail(path: str):
    with open(path, "r") as f:
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
    metrics.start(9102)
    print(f"[app_agent] Watching {LOG_PATH}")

    while not os.path.exists(LOG_PATH):
        print(f"[app_agent] Waiting for {LOG_PATH}...")
        time.sleep(2)

    for line in tail(LOG_PATH):
        entry = parse_line(line)
        if entry is None:
            continue

        result = rules.check(entry)
        if result is None:
            continue

        rule_id, attack_type, severity = result

        alert = Alert(
            tier="app",
            source_ip=entry.ip,
            session_token_hash=entry.session_token_hash,
            user_id=entry.user_id,
            attack_type=attack_type,
            severity=severity,
            confidence=1.0,
            raw_evidence=f"{entry.method} {entry.uri} {entry.status}",
            rule_id=rule_id,
        )

        kp.send(alert.to_kafka(), key=entry.ip)

        metrics.alerts_total.labels(
            tier="app",
            attack_type=attack_type,
            severity=severity,
        ).inc()
        metrics.rule_hits.labels(rule_id=rule_id).inc()

        if attack_type == "brute_force":
            metrics.brute_force_sessions.inc()

        print(f"[app_agent] ALERT {rule_id} {attack_type} from {entry.ip}")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        kp.flush()
        sys.exit(0)