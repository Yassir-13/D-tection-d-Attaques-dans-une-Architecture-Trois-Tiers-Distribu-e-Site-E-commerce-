"""
Simule une attaque DDoS sur le tier web.
Déclenche : WEB-004 (> 100 req/min depuis même IP)
"""

import requests
import time
from concurrent.futures import ThreadPoolExecutor

BASE_URL = "http://localhost:8000"

def _hit(_):
    try:
        requests.get(f"{BASE_URL}/api/products", timeout=2)
    except Exception:
        pass

def simulate():
    print("[ddos] Démarrage simulation DDoS — 120 requêtes rapides...")

    with ThreadPoolExecutor(max_workers=20) as ex:
        list(ex.map(_hit, range(120)))

    print("[ddos] ✅ DDoS simulé — WEB-004 devrait se déclencher")

if __name__ == "__main__":
    simulate()