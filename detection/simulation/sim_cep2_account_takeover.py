"""
CEP-2 : ACCOUNT_TAKEOVER (score=90, fenetre=120s)
Pipeline HYBRIDE :
  1. HTTP POST /api/login x8 echecs -> audit.jsonl -> app_agent -> alerts.app (brute_force)
  2. Kafka inject : anomaly status=200 depuis la meme IP -> CEP-2 se declenche.
  Note: 'anomaly' n'est pas produit par l'app_agent actuellement (gap de conception).
  On detecte l'IP reelle utilisee par l'app_agent depuis les logs d'audit.
"""
import json
import subprocess
import time
import requests
from config import API_URL, LARAVEL_CONTAINER, TOPIC_APP, BOLD, CYAN, RESET
from kafka_inject import step, ok, wait, inject

RULE = "CEP-2"
LABEL = "ACCOUNT_TAKEOVER"


def _get_real_ip():
    """Recupere l'IP reelle vue par Laravel depuis le dernier log d'audit."""
    try:
        result = subprocess.run(
            ["docker", "exec", LARAVEL_CONTAINER,
             "tail", "-1", "/var/www/html/storage/logs/audit.jsonl"],
            capture_output=True, text=True, timeout=5
        )
        if result.stdout.strip():
            return json.loads(result.stdout.strip()).get("ip", "172.18.0.1")
    except Exception:
        pass
    return "172.18.0.1"


def run():
    print(f"\n{BOLD}{CYAN}[{RULE}] {LABEL}{RESET}")
    print("  Brute-force login (HTTP reel) + login reussi (Kafka inject)")

    # Warm-up: une requete pour detecter notre IP reelle
    try:
        requests.get(f"{API_URL}/products", timeout=3)
    except Exception:
        pass
    time.sleep(0.5)
    real_ip = _get_real_ip()
    step(f"IP reelle detectee dans audit.jsonl: {real_ip}")

    # 1. 8 tentatives de login echouees -> brute_force via app_agent
    step("Envoi 8 echecs de login (brute-force)...")
    for i in range(8):
        try:
            requests.post(f"{API_URL}/login",
                          json={"email": "victim@test.com",
                                "password": f"wrong{i}"},
                          timeout=3)
        except Exception:
            pass
        time.sleep(0.3)
    ok("Brute-force envoye -> app_agent detecte APP-001 (brute_force)")

    wait(3, "laisser app_agent publier sur Kafka")

    # 2. Kafka inject : anomaly login OK depuis la meme IP
    step(f"Injection Kafka: anomaly login reussi depuis {real_ip}...")
    inject(TOPIC_APP, "app", "anomaly", "medium",
           source_ip=real_ip,
           rule_id="APP-ANOMALY",
           extra={"status": 200, "uri": "/api/login"})
    ok("Anomaly injectee -> CEP-2 attendu")


if __name__ == "__main__":
    run()
