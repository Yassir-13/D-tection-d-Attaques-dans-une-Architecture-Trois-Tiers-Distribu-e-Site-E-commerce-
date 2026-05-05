from prometheus_client import Counter, start_http_server

alerts_total = Counter(
    "detection_alerts_total",
    "Nombre total d'alertes détectées",
    ["tier", "attack_type", "severity"],
)

rule_hits = Counter(
    "db_rule_hits_total",
    "Nombre de hits par règle db",
    ["rule_id"],
)

queries_total = Counter(
    "db_queries_total",
    "Nombre de requêtes MySQL parsées",
    ["command_type"],
)


def start(port: int = 9103) -> None:
    start_http_server(port)
    print(f"[db_agent] Prometheus metrics on :{port}")