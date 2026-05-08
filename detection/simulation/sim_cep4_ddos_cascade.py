"""
CEP-4 : LAYER7_DDOS_CASCADE (score=92, fenetre=20s)
Pipeline KAFKA INJECT (les 3 tiers) :
  - ddos         (web) : >100 req/min depuis meme IP -> WEB-004
  - dos_probe    (app) : response_time >5000ms       -> APP-004
  - connection_flood (db) : >200 queries/10s         -> DB-004
  Note: la correlation CEP-4 necessite la MEME IP pour les 3 tiers.
  Or le db_agent utilise "db-internal" comme IP (MySQL ne logue pas l'IP client).
  -> Injection directe Kafka pour controler les IPs et garantir la correlation.
  On fait AUSSI un vrai DDoS HTTP + vrai flood MySQL pour peupler Prometheus/Grafana.
"""
import subprocess
import time
from concurrent.futures import ThreadPoolExecutor
import requests
from config import (API_URL, MYSQL_CONTAINER, TOPIC_WEB, TOPIC_APP, TOPIC_DB,
                    IP_CEP4, BOLD, CYAN, RESET)
from kafka_inject import step, ok, wait, inject

RULE  = "CEP-4"
LABEL = "LAYER7_DDOS_CASCADE"


def _real_ddos():
    """120 requetes rapides pour alimenter Prometheus/Grafana."""
    def hit(_):
        try:
            requests.get(f"{API_URL}/products", timeout=2)
        except Exception:
            pass
    with ThreadPoolExecutor(max_workers=20) as ex:
        list(ex.map(hit, range(120)))


def _real_mysql_flood():
    """210 requetes MySQL rapides pour alimenter db_agent."""
    for _ in range(210):
        subprocess.run([
            "docker", "exec", MYSQL_CONTAINER,
            "mysql", "-u", "root", "-proot_secret", "ecommerce",
            "-e", "SELECT 1;"
        ], capture_output=True)


def run():
    print(f"\n{BOLD}{CYAN}[{RULE}] {LABEL}{RESET}")
    print("  DDoS 3 tiers (Kafka inject pour correlation + HTTP/MySQL reels pour Grafana)")

    # Phase 1: Kafka inject (correlation CEP-4 garantie, meme IP)
    step(f"Injection Kafka ddos (web) depuis {IP_CEP4}...")
    inject(TOPIC_WEB, "web", "ddos", "critical",
           source_ip=IP_CEP4, rule_id="WEB-004")
    wait(1, "inter-tier")

    step(f"Injection Kafka dos_probe (app) depuis {IP_CEP4}...")
    inject(TOPIC_APP, "app", "dos_probe", "medium",
           source_ip=IP_CEP4, rule_id="APP-004",
           extra={"response_time_ms": 6500})
    wait(1, "inter-tier")

    step(f"Injection Kafka connection_flood (db) depuis {IP_CEP4}...")
    inject(TOPIC_DB, "db", "connection_flood", "high",
           source_ip=IP_CEP4, rule_id="DB-004")
    ok("3 alertes injectees -> CEP-4 attendu dans les 20s")

    wait(2, "CEP en cours de traitement")

    # Phase 2: Trafic reel pour Prometheus/Grafana (async, pas bloquant)
    step("Lancement DDoS HTTP reel (120 req) pour Prometheus...")
    _real_ddos()
    ok("DDoS HTTP reel termine -> WEB-004 dans Grafana")

    step("Lancement flood MySQL reel (210 queries) pour db_agent...")
    _real_mysql_flood()
    ok("Flood MySQL reel termine -> DB-004 dans Grafana")


if __name__ == "__main__":
    run()
