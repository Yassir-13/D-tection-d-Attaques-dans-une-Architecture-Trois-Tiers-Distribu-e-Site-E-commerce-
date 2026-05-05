from prometheus_client import Counter, Gauge, start_http_server

correlated_total = Counter(
    "detection_correlated_alerts_total",
    "Nombre d'alertes corrélées",
    ["rule_id", "label"],
)

risk_score = Gauge(
    "detection_risk_score",
    "Score de risque par tier",
    ["tier"],
)

cep_evaluations = Counter(
    "cep_rule_evaluations_total",
    "Nombre d'évaluations CEP",
    ["rule_id"],
)


def start(port: int = 9104) -> None:
    start_http_server(port)
    print(f"[cep] Prometheus metrics on :{port}")