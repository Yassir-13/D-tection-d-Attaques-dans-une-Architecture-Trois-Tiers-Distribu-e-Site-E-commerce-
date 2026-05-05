"""
Simule une attaque SQLi sur le tier web + tier db.
Déclenche : WEB-001 + DB-001 → CEP-1 CONFIRMED_SQLI_CHAIN
"""

import requests
import subprocess
import time

BASE_URL = "http://localhost:8000"

def simulate():
    print("[sqli] Démarrage simulation SQLi...")

    # 1. SQLi sur le tier web (Nginx → web_agent)
    payloads = [
        "/api/products?search=1' UNION SELECT 1,2,3--",
        "/api/products?slug=1 OR 1=1--",
        "/api/products?search=1' OR '1'='1",
    ]
    for p in payloads:
        r = requests.get(f"{BASE_URL}{p}")
        print(f"[sqli] GET {p} → {r.status_code}")
        time.sleep(0.5)

    # 2. SQLi sur le tier db (MySQL general_log → db_agent)
    # Dans les 30s pour déclencher CEP-1
    print("[sqli] Injection MySQL...")
    subprocess.run([
        "docker", "exec", "first-born-mysql-1",
        "mysql", "-u", "root", "-proot_secret", "ecommerce",
        "-e", "SELECT * FROM users UNION SELECT 1,2,3,4,5,6,7,8,9,10;"
    ], capture_output=True)
    print("[sqli] ✅ SQLi simulé — CEP-1 devrait se déclencher")

if __name__ == "__main__":
    simulate()