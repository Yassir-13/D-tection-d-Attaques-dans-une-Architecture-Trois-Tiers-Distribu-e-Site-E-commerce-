"""
Moteur de corrélation CEP.
Consomme alerts.web, alerts.app, alerts.db → applique 7 règles → publie alerts.correlated.
"""

import json
import sys
import time

import metrics
import kafka_consumer as kc
import kafka_producer as kp
import cep_rules
import state_store as ss
from kafka_schemas import Alert

# Score de risque glissant par tier (max des 10 dernières alertes)
_tier_scores: dict[str, list[int]] = {"web": [], "app": [], "db": []}
_MAX_SCORES = 10


def _update_risk_score(tier: str, severity: str) -> None:
    score_map = {"low": 25, "medium": 50, "high": 75, "critical": 100}
    score = score_map.get(severity, 0)
    _tier_scores[tier].append(score)
    if len(_tier_scores[tier]) > _MAX_SCORES:
        _tier_scores[tier].pop(0)
    avg = sum(_tier_scores[tier]) / len(_tier_scores[tier])
    metrics.risk_score.labels(tier=tier).set(avg)


def main() -> None:
    metrics.start(9104)
    print("[cep] Waiting for Redis...")
    while not ss.ping():
        time.sleep(1)
    print("[cep] Redis ready.")
    print("[cep] Correlation engine started — consuming alerts.web/app/db")

    while True:
        raw = kc.poll(timeout=1.0)
        if raw is None:
            continue

        try:
            data = json.loads(raw)
            alert = Alert(**data)
        except Exception as e:
            print(f"[cep] Parse error: {e}")
            continue

        # Mise à jour du risk score par tier
        _update_risk_score(alert.tier, alert.severity)
        print(f"[cep] received {alert.tier}:{alert.attack_type} from {alert.source_ip}")

        # Évaluation des règles CEP
        correlated = cep_rules.evaluate(alert)

        if correlated is None:
            continue

        # Publier l'alerte corrélée
        key = correlated.source_ip or correlated.rule_id
        kp.send(correlated.to_kafka(), key=key)

        metrics.correlated_total.labels(
            rule_id=correlated.rule_id,
            label=correlated.label,
        ).inc()

        print(f"[cep] CORRELATED {correlated.rule_id} {correlated.label} "
              f"score={correlated.risk_score} ip={correlated.source_ip}")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        kc.close()
        kp.flush()
        sys.exit(0)