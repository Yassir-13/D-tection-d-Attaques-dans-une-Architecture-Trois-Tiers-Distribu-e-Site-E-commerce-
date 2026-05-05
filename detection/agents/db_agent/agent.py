"""
DB Agent — lit MySQL general_query.log en tail -f, applique les règles, publie sur Kafka.
"""

import os
import sys
import time

import metrics
import kafka_producer as kp
import rules
from log_parser import parse_line
from kafka_schemas import Alert

LOG_PATH = os.getenv("LOG_PATH", "/var/log/mysql/general_query.log")


def tail(path: str):
    with open(path, "r", errors="replace") as f:
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
    metrics.start(9103)
    print(f"[db_agent] Watching {LOG_PATH}")

    while not os.path.exists(LOG_PATH):
        print(f"[db_agent] Waiting for {LOG_PATH}...")
        time.sleep(2)

    for line in tail(LOG_PATH):
        entry = parse_line(line)
        if entry is None:
            continue

        metrics.queries_total.labels(command_type=entry.command).inc()

        result = rules.check(entry)
        if result is None:
            continue

        rule_id, attack_type, severity = result

        alert = Alert(
            tier="db",
            source_ip="db-internal",   # MySQL ne logue pas l'IP cliente
            attack_type=attack_type,
            severity=severity,
            confidence=1.0,
            raw_evidence=entry.sql[:500],
            rule_id=rule_id,
            extra={"thread_id": entry.thread_id},
        )

        kp.send(alert.to_kafka(), key=entry.thread_id)

        metrics.alerts_total.labels(
            tier="db",
            attack_type=attack_type,
            severity=severity,
        ).inc()
        metrics.rule_hits.labels(rule_id=rule_id).inc()

        print(f"[db_agent] ALERT {rule_id} {attack_type} thread={entry.thread_id}")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        kp.flush()
        sys.exit(0)