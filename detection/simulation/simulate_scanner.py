"""
Simule un scan de vulnérabilités (User-Agent malveillant).
Déclenche : WEB-005 (scanner UA) → CEP-7 si suivi d'une alerte high
"""

import requests
import time

BASE_URL = "http://localhost:8000"

SCANNER_UAS = [
    "sqlmap/1.7.8#stable (https://sqlmap.org)",
    "Nikto/2.1.6",
    "nmap scripting engine",
    "Hydra/9.4",
]

def simulate():
    print("[scanner] Démarrage simulation scanner...")

    for ua in SCANNER_UAS:
        r = requests.get(
            f"{BASE_URL}/api/products",
            headers={"User-Agent": ua},
        )
        print(f"[scanner] UA={ua[:30]}... → {r.status_code}")
        time.sleep(0.5)

    # Suivi d'une attaque high pour déclencher CEP-7
    time.sleep(1)
    requests.get(
        f"{BASE_URL}/api/products?search=1' UNION SELECT 1,2,3--",
        headers={"User-Agent": SCANNER_UAS[0]},
    )
    print("[scanner] ✅ Scanner simulé — WEB-005 + CEP-7 devraient se déclencher")

if __name__ == "__main__":
    simulate()