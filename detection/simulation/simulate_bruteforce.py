"""
Simule une attaque brute-force sur le login.
Déclenche : APP-001 (≥ 5 échecs login en 60s)
Route : POST /api/login (throttle:10,1)
"""

import requests
import time

BASE_URL = "http://localhost:8000"

def simulate():
    print("[bruteforce] Démarrage simulation brute-force...")

    for i in range(8):
        r = requests.post(
            f"{BASE_URL}/api/login",
            json={"email": "victim@example.com", "password": f"wrongpass{i}"},
            headers={"Content-Type": "application/json"},
        )
        print(f"[bruteforce] tentative {i+1} → {r.status_code}")
        time.sleep(0.3)

    print("[bruteforce] ✅ Brute-force simulé — APP-001 devrait se déclencher")

if __name__ == "__main__":
    simulate()