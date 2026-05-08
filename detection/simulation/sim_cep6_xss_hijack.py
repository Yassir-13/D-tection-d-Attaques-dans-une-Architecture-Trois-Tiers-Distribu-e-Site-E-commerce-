"""
CEP-6 : XSS_SESSION_HIJACK (score=80, fenetre=120s)
Pipeline KAFKA INJECT :
  1. Inject XSS (web) avec token T depuis IP victime   -> alerts.web
  2. Inject XSS (web) avec meme token T depuis IP attaquant -> alerts.web
  -> CEP-6 detecte le meme token depuis 2 IPs differentes -> session hijack.

  Note: impossible de simuler 2 IPs depuis la meme machine via HTTP reel.
  On fait aussi un HTTP reel avec payload XSS pour alimenter Grafana (WEB-002).
"""
import time
import requests
from config import (API_URL, TOPIC_WEB,
                    IP_CEP6_VICTIM, IP_CEP6_ATTACKER, BOLD, CYAN, RESET)
from kafka_inject import step, ok, wait, inject

RULE   = "CEP-6"
LABEL  = "XSS_SESSION_HIJACK"
TOKEN  = "hijacked_session_token_cep6_abc123"


def run():
    print(f"\n{BOLD}{CYAN}[{RULE}] {LABEL}{RESET}")
    print("  XSS session hijack (Kafka inject 2 IPs + HTTP reel pour Grafana)")

    # Phase 1: Kafka inject (correlation CEP-6)
    step(f"Injection Kafka: XSS token={TOKEN[:20]}... depuis IP victime {IP_CEP6_VICTIM}...")
    inject(TOPIC_WEB, "web", "xss", "medium",
           source_ip=IP_CEP6_VICTIM,
           session_token_hash=TOKEN,
           rule_id="WEB-002")

    wait(3, "CEP stocke l'alerte dans Redis (fenetre 120s)")

    step(f"Injection Kafka: meme token depuis IP attaquant {IP_CEP6_ATTACKER}...")
    inject(TOPIC_WEB, "web", "xss", "medium",
           source_ip=IP_CEP6_ATTACKER,
           session_token_hash=TOKEN,
           rule_id="WEB-002")
    ok("Token XSS vu depuis 2 IPs -> CEP-6 attendu")

    # Phase 2: HTTP reel pour alimenter Prometheus WEB-002
    step("Envoi requetes XSS reelles pour Grafana...")
    payloads = [
        "/api/products?search=<script>alert('xss')</script>",
        "/api/products?search=<img onerror=alert(1) src=x>",
        "/api/products?search=javascript:alert(1)",
    ]
    for p in payloads:
        try:
            requests.get(f"{API_URL.replace('/api','')}{p}", timeout=3)
        except Exception:
            pass
        time.sleep(0.3)
    ok("XSS HTTP reels envoyes -> WEB-002 dans Grafana")


if __name__ == "__main__":
    run()
