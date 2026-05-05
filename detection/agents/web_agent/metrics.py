from prometheus_client import Counter, start_http_server

alerts_total = Counter(
    "detection_alerts_total",
    "Nombre total d'alertes détectées",
    ["tier", "attack_type", "severity"],
)

rule_hits = Counter(
    "web_rule_hits_total",
    "Nombre de hits par règle",
    ["rule_id"],
)

requests_total = Counter(
    "web_requests_total",
    "Nombre de requêtes Nginx parsées",
    ["method", "status"],
)


def start(port: int = 9101) -> None:
    start_http_server(port)
    print(f"[web_agent] Prometheus metrics on :{port}")