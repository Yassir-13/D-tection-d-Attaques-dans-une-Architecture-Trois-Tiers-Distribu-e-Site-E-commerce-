"""
CEP-1 : CONFIRMED_SQLI_CHAIN (score=95, fenetre=30s)
Pipeline REEL :
  1. HTTP GET avec payload SQLi  -> Nginx log -> web_agent -> alerts.web (sqli, high)
  2. docker exec MySQL UNION SELECT -> general_log -> db_agent -> alerts.db (sqli_union, critical)
  Les deux dans la meme fenetre de 30s -> CEP-1 se declenche.
"""
import subprocess
import time
import requests
from config import API_URL, MYSQL_CONTAINER, IP_CEP1, BOLD, CYAN, RESET
from kafka_inject import step, ok, wait

RULE = "CEP-1"
LABEL = "CONFIRMED_SQLI_CHAIN"


def run():
    print(f"\n{BOLD}{CYAN}[{RULE}] {LABEL}{RESET}")
    print("  Web SQLi (HTTP reel) + MySQL UNION SELECT (docker exec)")

    # 1. Requetes SQLi via HTTP -> Nginx -> web_agent
    payloads = [
        "/api/products?search=1' UNION SELECT 1,2,3--",
        "/api/products?search=1 OR 1=1--",
        "/api/products?search=1' OR '1'='1",
    ]
    step("Envoi requetes SQLi via HTTP...")
    for p in payloads:
        try:
            requests.get(f"{API_URL.replace('/api','')}{p}", timeout=3)
        except Exception:
            pass
        time.sleep(0.4)
    ok("SQLi web envoyes -> web_agent detecte WEB-001")

    wait(2, "laisser web_agent publier sur Kafka")

    # 2. SQLi MySQL via docker exec -> db_agent
    step("Execution UNION SELECT sur MySQL...")
    subprocess.run([
        "docker", "exec", MYSQL_CONTAINER,
        "mysql", "-u", "root", "-proot_secret", "ecommerce",
        "-e", "SELECT * FROM users UNION SELECT 1,2,3,4,5,6,7,8;"
    ], capture_output=True)
    ok("SQLi MySQL executee -> db_agent detecte DB-001 -> CEP-1 attendu")


if __name__ == "__main__":
    run()
