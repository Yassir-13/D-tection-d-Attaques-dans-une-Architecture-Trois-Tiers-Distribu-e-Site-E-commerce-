"""
CEP-3 : PRIV_ESC_EXFIL_CHAIN (score=88, fenetre=60s)
Pipeline HYBRIDE :
  1. Login test@example.com -> recupere user_id et token
  2. HTTP GET /api/admin/* x3 avec le token -> 403 -> audit.jsonl
     -> app_agent -> alerts.app (privilege_escalation, user_id reel)
  3. Kafka inject : data_exfiltration avec le meme user_id -> alerts.db
     (db_agent ne propage pas user_id : limitation connue du general_log MySQL)
  -> CEP-3 se declenche sur user_id commun.
"""
import time
import requests
from config import API_URL, TOPIC_DB, BOLD, CYAN, RESET
from kafka_inject import step, ok, wait, inject

RULE = "CEP-3"
LABEL = "PRIV_ESC_EXFIL_CHAIN"


def run():
    print(f"\n{BOLD}{CYAN}[{RULE}] {LABEL}{RESET}")
    print("  Privilege escalation (HTTP reel) + exfiltration DB (Kafka inject)")

    # 1. Login comme test user pour obtenir user_id et token
    step("Login test@example.com...")
    user_id = None
    token   = None
    try:
        r = requests.post(f"{API_URL}/login",
                          json={"email": "test@example.com",
                                "password": "password"},
                          timeout=5)
        data    = r.json()
        user_id = data.get("user", {}).get("id")
        token   = data.get("token")
        step(f"Connecte: user_id={user_id}")
    except Exception as e:
        step(f"Login echoue: {e} -> utilisation user_id=1 par defaut")
        user_id = 1

    headers = {"Authorization": f"Bearer {token}"} if token else {}

    # 2. 3 tentatives d'acces admin (403) -> privilege_escalation
    step("Envoi 3 tentatives d'acces aux routes admin (403 attendu)...")
    admin_routes = ["/api/admin/stats", "/api/admin/users", "/api/admin/orders"]
    for route in admin_routes:
        try:
            requests.get(f"{API_URL.replace('/api', '')}{route}",
                         headers=headers, timeout=3)
        except Exception:
            pass
        time.sleep(0.5)
    ok(f"3 hits 403 admin -> app_agent detecte APP-002 (privilege_escalation) user_id={user_id}")

    wait(3, "laisser app_agent publier sur Kafka")

    # 3. Kafka inject : data_exfiltration avec le meme user_id
    step(f"Injection Kafka: data_exfiltration user_id={user_id}...")
    inject(TOPIC_DB, "db", "data_exfiltration", "high",
           source_ip="db-internal",
           user_id=user_id,
           rule_id="DB-003")
    ok("Exfiltration injectee -> CEP-3 attendu")


if __name__ == "__main__":
    run()
