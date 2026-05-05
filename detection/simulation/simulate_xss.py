"""
Simule une attaque XSS sur le tier web.
Déclenche : WEB-002
"""

import requests
import time

BASE_URL = "http://localhost:8000"

def simulate():
    print("[xss] Démarrage simulation XSS...")

    payloads = [
        "/api/products?search=<script>alert('xss')</script>",
        "/api/products?search=<img onerror=alert(1) src=x>",
        "/api/products?search=javascript:alert(document.cookie)",
    ]

    for p in payloads:
        r = requests.get(f"{BASE_URL}{p}")
        print(f"[xss] GET {p[:60]}... → {r.status_code}")
        time.sleep(0.5)

    print("[xss] ✅ XSS simulé — WEB-002 devrait se déclencher")

if __name__ == "__main__":
    simulate()