"""
Simule une attaque path traversal.
Déclenche : WEB-003
"""

import requests
import time

BASE_URL = "http://localhost:8000"

def simulate():
    print("[traversal] Démarrage simulation path traversal...")

    payloads = [
        "/api/products?search=../../../etc/passwd",
        "/api/products?slug=../../proc/self/environ",
        "/api/products?search=....//....//etc/shadow",
    ]

    for p in payloads:
        r = requests.get(f"{BASE_URL}{p}")
        print(f"[traversal] GET {p[:60]}... → {r.status_code}")
        time.sleep(0.5)

    print("[traversal] ✅ Path traversal simulé — WEB-003 devrait se déclencher")

if __name__ == "__main__":
    simulate()