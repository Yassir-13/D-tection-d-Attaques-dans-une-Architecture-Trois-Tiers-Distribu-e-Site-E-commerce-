"""
CEP-5 : INSIDER_DATA_DRAIN (score=85, fenetre=300s)
Pipeline HYBRIDE :
  1. Login test@example.com -> token, user_id
  2. HTTP POST /api/orders x10 en rafale (meme session)
     -> audit.jsonl -> app_agent -> alerts.app (insider_fraud, user_id reel)
  3. Kafka inject : data_exfiltration avec le meme user_id -> alerts.db
  -> CEP-5 se declenche sur user_id commun.

  Note: chaque commande consomme 1 unite de stock sur 1 produit.
  Avec 40-90 unites par produit en stock, 10 commandes ne posent aucun probleme.
"""
import time
import requests
from config import API_URL, TOPIC_DB, BOLD, CYAN, RESET
from kafka_inject import step, ok, wait, inject

RULE  = "CEP-5"
LABEL = "INSIDER_DATA_DRAIN"


def run():
    print(f"\n{BOLD}{CYAN}[{RULE}] {LABEL}{RESET}")
    print("  10 commandes reelles (insider) + exfiltration DB (Kafka inject)")

    # 1. Login
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
    except Exception as e:
        step(f"Login echoue: {e}")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Recuperer un product_id valide
    step("Recuperation d'un produit valide...")
    product_id = None
    try:
        r = requests.get(f"{API_URL}/products", timeout=5)
        items = r.json().get("data", [])
        if items:
            product_id = items[0]["id"]
    except Exception:
        pass

    if not product_id:
        step("Aucun produit disponible -> injection Kafka directe")
        inject(TOPIC_DB, "app", "insider_fraud", "medium",
               source_ip="10.10.5.1", user_id=user_id, rule_id="APP-003")
    else:
        # 3. 10 commandes rapides avec le meme token
        step(f"Envoi 10 commandes (product_id={product_id})...")
        ok_count = 0
        for i in range(10):
            try:
                r = requests.post(
                    f"{API_URL}/orders",
                    json={
                        "shipping_address": f"123 Insider St, Apt {i+1}",
                        "items": [{"product_id": product_id,
                                   "quantity": 1}]
                    },
                    headers=headers,
                    timeout=5
                )
                if r.status_code in (200, 201):
                    ok_count += 1
            except Exception:
                pass
            time.sleep(0.2)
        ok(f"{ok_count}/10 commandes passees -> app_agent detecte APP-003 (insider_fraud) user_id={user_id}")

    wait(3, "laisser app_agent publier sur Kafka")

    # 4. Kafka inject : data_exfiltration
    step(f"Injection Kafka: data_exfiltration user_id={user_id}...")
    inject(TOPIC_DB, "db", "data_exfiltration", "high",
           source_ip="db-internal",
           user_id=user_id,
           rule_id="DB-003")
    ok("Exfiltration injectee -> CEP-5 attendu")


if __name__ == "__main__":
    run()
