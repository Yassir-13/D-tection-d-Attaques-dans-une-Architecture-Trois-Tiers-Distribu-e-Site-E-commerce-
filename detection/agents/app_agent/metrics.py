from prometheus_client import Counter, Gauge, start_http_server

alerts_total = Counter(
    "detection_alerts_total",
    "Nombre total d'alertes détectées",
    ["tier", "attack_type", "severity"],
)

rule_hits = Counter(
    "app_rule_hits_total",
    "Nombre de hits par règle app",
    ["rule_id"],
)

brute_force_sessions = Gauge(
    "app_brute_force_sessions",
    "IPs actuellement en brute-force détecté",
)


def start(port: int = 9102) -> None:
    start_http_server(port)
    print(f"[app_agent] Prometheus metrics on :{port}")