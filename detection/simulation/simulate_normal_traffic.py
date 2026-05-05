"""
Simule du trafic normal légitime.
Ne doit déclencher AUCUNE alerte high/critical.
"""

import requests
import time

BASE_URL = "http://localhost:8000"

def simulate():
    print("[normal] Démarrage simulation trafic normal...")

    # Navigation catalogue
    for i in range(10):
        r = requests.get(f"{BASE_URL}/api/products")
        print(f"[normal] GET /api/products → {r.status_code}")
        time.sleep(0.5)

    # Recherches normales
    searches = ["laptop", "phone", "book", "shoes", "watch"]
    for s in searches:
        r = requests.get(f"{BASE_URL}/api/products?search={s}")
        print(f"[normal] search={s} → {r.status_code}")
        time.sleep(0.3)

    # Tentative de login normal (mauvais mdp une fois)
    r = requests.post(
        f"{BASE_URL}/api/login",
        json={"email": "user@example.com", "password": "wrongpassword"},
    )
    print(f"[normal] login échoué → {r.status_code}")

    print("[normal] ✅ Trafic normal simulé — 0 alerte critique attendue")

if __name__ == "__main__":
    simulate()