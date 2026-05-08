"""
╔══════════════════════════════════════════════════════════════════════╗
║  Script de test des 6 règles CEP restantes (CEP-2 → CEP-7)        ║
║  Injecte des alertes directement dans Kafka pour simuler les       ║
║  agents et valider la corrélation cross-tier du moteur CEP.        ║
║                                                                    ║
║  CEP-1 (CONFIRMED_SQLI_CHAIN) : déjà validé ✅                     ║
║  CEP-2 (ACCOUNT_TAKEOVER)     : brute_force app + login OK         ║
║  CEP-3 (PRIV_ESC_EXFIL_CHAIN) : priv esc app + exfil db           ║
║  CEP-4 (LAYER7_DDOS_CASCADE)  : ddos web + dos app + flood db     ║
║  CEP-5 (INSIDER_DATA_DRAIN)   : insider app + exfil db             ║
║  CEP-6 (XSS_SESSION_HIJACK)   : xss web token X IP1 + IP2         ║
║  CEP-7 (SCANNER_EXPLOIT)      : scanner web + exploit high         ║
╚══════════════════════════════════════════════════════════════════════╝

Usage:
    python test_cep_rules.py              # Lance tous les tests CEP-2 → CEP-7
    python test_cep_rules.py CEP-2        # Lance uniquement CEP-2
    python test_cep_rules.py CEP-2 CEP-4  # Lance CEP-2 et CEP-4
"""

import json
import subprocess
import sys
import time
import uuid
from datetime import datetime, timezone

# ─── Fix Windows console UTF-8 ───────────────────────────────────────────────
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

# ─── Configuration ────────────────────────────────────────────────────────────
KAFKA_CONTAINER = "first-born-kafka-1"
BROKER = "localhost:9092"
TOPIC_WEB = "alerts.web"
TOPIC_APP = "alerts.app"
TOPIC_DB  = "alerts.db"

# Couleurs terminal
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"
RESET  = "\033[0m"


def make_alert(tier: str, attack_type: str, severity: str,
               source_ip: str = "10.0.0.99",
               user_id: int = None,
               session_token_hash: str = None,
               rule_id: str = "",
               extra: dict = None) -> dict:
    """Construit une alerte conforme au schéma kafka_schemas.Alert."""
    return {
        "alert_id": str(uuid.uuid4()),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "tier": tier,
        "source_ip": source_ip,
        "session_token_hash": session_token_hash,
        "user_id": user_id,
        "attack_type": attack_type,
        "severity": severity,
        "confidence": 1.0,
        "raw_evidence": f"[TEST] {attack_type} simulation for CEP validation",
        "rule_id": rule_id,
        "extra": extra or {},
    }


def inject_alert(topic: str, alert: dict):
    """Injecte une alerte dans un topic Kafka via docker exec."""
    payload = json.dumps(alert, ensure_ascii=False)
    # Utilise kafka-console-producer depuis le conteneur Kafka
    cmd = [
        "docker", "exec", "-i", KAFKA_CONTAINER,
        "kafka-console-producer",
        "--broker-list", BROKER,
        "--topic", topic,
    ]
    result = subprocess.run(
        cmd,
        input=payload,
        capture_output=True,
        text=True,
        timeout=10,
    )
    if result.returncode != 0:
        print(f"  {RED}❌ Injection échouée: {result.stderr.strip()}{RESET}")
        return False
    return True


def header(rule_id: str, label: str, description: str):
    """Affiche l'en-tête d'un test CEP."""
    print(f"\n{'='*70}")
    print(f"  {BOLD}{CYAN}[{rule_id}] {label}{RESET}")
    print(f"  {description}")
    print(f"{'='*70}")


def step(msg: str):
    """Affiche une étape."""
    print(f"  {YELLOW}→{RESET} {msg}")


def success(msg: str):
    """Affiche un succès."""
    print(f"  {GREEN}✅ {msg}{RESET}")


def wait(seconds: float, reason: str):
    """Attend avec message."""
    print(f"  {YELLOW}⏳ Attente {seconds}s — {reason}{RESET}")
    time.sleep(seconds)


# ══════════════════════════════════════════════════════════════════════════════
#  CEP-2 : ACCOUNT_TAKEOVER
#  Brute-force (app, tier=app, attack_type=brute_force)
#  + Login réussi (app, tier=app, attack_type=anomaly, extra.status=200)
#  Même IP, fenêtre 120s
# ══════════════════════════════════════════════════════════════════════════════
def test_cep2():
    header("CEP-2", "ACCOUNT_TAKEOVER",
           "Brute-force login (APP-001) suivi d'un login réussi → compromission confirmée")
    
    attacker_ip = "192.168.100.50"

    # Étape 1 : Brute-force détecté par app_agent
    step(f"Injection alerte brute_force depuis {attacker_ip}...")
    alert_bf = make_alert(
        tier="app",
        attack_type="brute_force",
        severity="high",
        source_ip=attacker_ip,
        rule_id="APP-001",
    )
    inject_alert(TOPIC_APP, alert_bf)

    wait(2, "Laisser le CEP stocker l'alerte dans Redis (fenêtre CEP-2 = 120s)")

    # Étape 2 : Login réussi depuis la même IP (l'attaquant a trouvé le bon mot de passe)
    step(f"Injection alerte anomaly (login réussi status=200) depuis {attacker_ip}...")
    alert_login = make_alert(
        tier="app",
        attack_type="anomaly",
        severity="medium",
        source_ip=attacker_ip,
        rule_id="APP-ANOMALY",
        extra={"status": 200, "uri": "/api/login"},
    )
    inject_alert(TOPIC_APP, alert_login)

    success("CEP-2 ACCOUNT_TAKEOVER devrait apparaître dans les logs du correlation_engine")
    print(f"  {CYAN}💡 Vérifier: docker logs first-born-correlation_engine-1 --tail 20{RESET}")


# ══════════════════════════════════════════════════════════════════════════════
#  CEP-3 : PRIV_ESC_EXFIL_CHAIN
#  Privilege escalation (app, tier=app, attack_type=privilege_escalation)
#  + Data exfiltration (db, tier=db, attack_type=data_exfiltration)
#  Même user_id, fenêtre 60s
# ══════════════════════════════════════════════════════════════════════════════
def test_cep3():
    header("CEP-3", "PRIV_ESC_EXFIL_CHAIN",
           "Escalade de privilèges (APP-002) + exfiltration de données (DB-003) par le même user")

    target_user_id = 42
    attacker_ip = "192.168.100.51"

    # Étape 1 : L'utilisateur tente d'accéder aux routes admin → privilege_escalation
    step(f"Injection alerte privilege_escalation pour user_id={target_user_id}...")
    alert_priv = make_alert(
        tier="app",
        attack_type="privilege_escalation",
        severity="high",
        source_ip=attacker_ip,
        user_id=target_user_id,
        rule_id="APP-002",
    )
    inject_alert(TOPIC_APP, alert_priv)

    wait(2, "Laisser le CEP stocker l'alerte (fenêtre CEP-3 = 60s)")

    # Étape 2 : Le même user exfiltre des données depuis la DB
    step(f"Injection alerte data_exfiltration pour user_id={target_user_id}...")
    alert_exfil = make_alert(
        tier="db",
        attack_type="data_exfiltration",
        severity="high",
        source_ip="db-internal",
        user_id=target_user_id,
        rule_id="DB-003",
    )
    inject_alert(TOPIC_DB, alert_exfil)

    success("CEP-3 PRIV_ESC_EXFIL_CHAIN devrait apparaître dans les logs du correlation_engine")
    print(f"  {CYAN}💡 Vérifier: docker logs first-born-correlation_engine-1 --tail 20{RESET}")


# ══════════════════════════════════════════════════════════════════════════════
#  CEP-4 : LAYER7_DDOS_CASCADE
#  DDoS sur les 3 tiers simultanément depuis la même IP :
#  - ddos (web)
#  - dos_probe (app)
#  - connection_flood (db)
#  Même IP, fenêtre 20s
# ══════════════════════════════════════════════════════════════════════════════
def test_cep4():
    header("CEP-4", "LAYER7_DDOS_CASCADE",
           "DDoS détecté simultanément sur 3 tiers (web + app + db) → attaque coordonnée")

    attacker_ip = "192.168.100.52"

    # Étape 1 : DDoS tier web
    step(f"Injection alerte ddos (web) depuis {attacker_ip}...")
    alert_ddos = make_alert(
        tier="web",
        attack_type="ddos",
        severity="critical",
        source_ip=attacker_ip,
        rule_id="WEB-004",
    )
    inject_alert(TOPIC_WEB, alert_ddos)

    wait(1, "Délai inter-tier")

    # Étape 2 : DoS probe tier app
    step(f"Injection alerte dos_probe (app) depuis {attacker_ip}...")
    alert_dos = make_alert(
        tier="app",
        attack_type="dos_probe",
        severity="medium",
        source_ip=attacker_ip,
        rule_id="APP-004",
    )
    inject_alert(TOPIC_APP, alert_dos)

    wait(1, "Délai inter-tier")

    # Étape 3 : Connection flood tier db
    step(f"Injection alerte connection_flood (db) depuis {attacker_ip}...")
    alert_flood = make_alert(
        tier="db",
        attack_type="connection_flood",
        severity="high",
        source_ip=attacker_ip,
        rule_id="DB-004",
    )
    inject_alert(TOPIC_DB, alert_flood)

    success("CEP-4 LAYER7_DDOS_CASCADE devrait apparaître dans les logs du correlation_engine")
    print(f"  {CYAN}💡 Vérifier: docker logs first-born-correlation_engine-1 --tail 20{RESET}")


# ══════════════════════════════════════════════════════════════════════════════
#  CEP-5 : INSIDER_DATA_DRAIN
#  Insider fraud (app, tier=app, attack_type=insider_fraud)
#  + Data exfiltration (db, tier=db, attack_type=data_exfiltration)
#  Même user_id, fenêtre 300s
# ══════════════════════════════════════════════════════════════════════════════
def test_cep5():
    header("CEP-5", "INSIDER_DATA_DRAIN",
           "Utilisateur interne frauduleux (APP-003) + exfiltration massive de données (DB-003)")

    insider_user_id = 7
    insider_ip = "192.168.100.53"

    # Étape 1 : Insider fraud — commandes excessives détectées
    step(f"Injection alerte insider_fraud pour user_id={insider_user_id}...")
    alert_insider = make_alert(
        tier="app",
        attack_type="insider_fraud",
        severity="medium",
        source_ip=insider_ip,
        user_id=insider_user_id,
        session_token_hash="abc123insider",
        rule_id="APP-003",
    )
    inject_alert(TOPIC_APP, alert_insider)

    wait(2, "Laisser le CEP stocker l'alerte (fenêtre CEP-5 = 300s)")

    # Étape 2 : Exfiltration de données par le même user
    step(f"Injection alerte data_exfiltration pour user_id={insider_user_id}...")
    alert_exfil = make_alert(
        tier="db",
        attack_type="data_exfiltration",
        severity="high",
        source_ip="db-internal",
        user_id=insider_user_id,
        rule_id="DB-003",
    )
    inject_alert(TOPIC_DB, alert_exfil)

    success("CEP-5 INSIDER_DATA_DRAIN devrait apparaître dans les logs du correlation_engine")
    print(f"  {CYAN}💡 Vérifier: docker logs first-born-correlation_engine-1 --tail 20{RESET}")


# ══════════════════════════════════════════════════════════════════════════════
#  CEP-6 : XSS_SESSION_HIJACK
#  XSS détecté (web, tier=web, attack_type=xss)
#  + Même token utilisé depuis 2 IPs différentes → session volée
#  Même session_token_hash, 2 IPs distinctes, fenêtre 120s
# ══════════════════════════════════════════════════════════════════════════════
def test_cep6():
    header("CEP-6", "XSS_SESSION_HIJACK",
           "XSS injecté + même token de session utilisé depuis 2 IPs → session hijack")

    stolen_token = "stolen_session_token_hash_abc"
    ip_victim = "192.168.100.10"     # IP légitime de la victime
    ip_attacker = "192.168.100.54"   # IP de l'attaquant qui a volé le cookie

    # Étape 1 : XSS détecté depuis l'IP victime (attaquant injecte le XSS)
    step(f"Injection alerte XSS avec token={stolen_token[:20]}... depuis IP victime {ip_victim}...")
    alert_xss_1 = make_alert(
        tier="web",
        attack_type="xss",
        severity="medium",
        source_ip=ip_victim,
        session_token_hash=stolen_token,
        rule_id="WEB-002",
    )
    inject_alert(TOPIC_WEB, alert_xss_1)

    wait(3, "Laisser le CEP stocker l'alerte (fenêtre CEP-6 = 120s)")

    # Étape 2 : Le même token est vu depuis une IP DIFFÉRENTE → session hijack
    step(f"Injection alerte XSS avec même token depuis IP attaquant {ip_attacker}...")
    alert_xss_2 = make_alert(
        tier="web",
        attack_type="xss",
        severity="medium",
        source_ip=ip_attacker,
        session_token_hash=stolen_token,
        rule_id="WEB-002",
    )
    inject_alert(TOPIC_WEB, alert_xss_2)

    success("CEP-6 XSS_SESSION_HIJACK devrait apparaître dans les logs du correlation_engine")
    print(f"  {CYAN}💡 Vérifier: docker logs first-born-correlation_engine-1 --tail 20{RESET}")


# ══════════════════════════════════════════════════════════════════════════════
#  CEP-7 : SCANNER_EXPLOIT_CONFIRMED
#  Scanner détecté (web, tier=web, attack_type=scanner)
#  + Exploit high/critical confirmé ensuite (n'importe quel tier)
#  Même IP, fenêtre 300s
# ══════════════════════════════════════════════════════════════════════════════
def test_cep7():
    header("CEP-7", "SCANNER_EXPLOIT_CONFIRMED",
           "Scanner de vulnérabilités détecté (WEB-005) suivi d'un exploit confirmé → attaque ciblée")

    attacker_ip = "192.168.100.55"

    # Étape 1 : Scanner détecté
    step(f"Injection alerte scanner depuis {attacker_ip}...")
    alert_scan = make_alert(
        tier="web",
        attack_type="scanner",
        severity="medium",
        source_ip=attacker_ip,
        rule_id="WEB-005",
    )
    inject_alert(TOPIC_WEB, alert_scan)

    wait(2, "Laisser le CEP stocker l'alerte (fenêtre CEP-7 = 300s)")

    # Étape 2 : L'attaquant lance une vraie attaque SQLi high depuis la même IP
    step(f"Injection alerte sqli (high) depuis {attacker_ip}...")
    alert_exploit = make_alert(
        tier="web",
        attack_type="sqli",
        severity="high",
        source_ip=attacker_ip,
        rule_id="WEB-001",
    )
    inject_alert(TOPIC_WEB, alert_exploit)

    success("CEP-7 SCANNER_EXPLOIT_CONFIRMED devrait apparaître dans les logs du correlation_engine")
    print(f"  {CYAN}💡 Vérifier: docker logs first-born-correlation_engine-1 --tail 20{RESET}")


# ══════════════════════════════════════════════════════════════════════════════
#  MAIN — Orchestrateur
# ══════════════════════════════════════════════════════════════════════════════

ALL_TESTS = {
    "CEP-2": test_cep2,
    "CEP-3": test_cep3,
    "CEP-4": test_cep4,
    "CEP-5": test_cep5,
    "CEP-6": test_cep6,
    "CEP-7": test_cep7,
}


def main():
    print(f"""
{BOLD}{CYAN}╔══════════════════════════════════════════════════════════╗
║     Test des Règles CEP — Corrélation Cross-Tier       ║
║     CEP-1 déjà validé ✅  •  Test CEP-2 → CEP-7        ║
╚══════════════════════════════════════════════════════════╝{RESET}
""")

    # Choix des tests à lancer
    selected = sys.argv[1:] if len(sys.argv) > 1 else list(ALL_TESTS.keys())
    
    # Valider les arguments
    for s in selected:
        s_upper = s.upper()
        if s_upper not in ALL_TESTS:
            print(f"{RED}❌ Test inconnu: {s}. Disponibles: {', '.join(ALL_TESTS.keys())}{RESET}")
            sys.exit(1)

    # Vérifier que Kafka est accessible
    step("Vérification de la connectivité Kafka...")
    check = subprocess.run(
        ["docker", "exec", KAFKA_CONTAINER, "kafka-broker-api-versions",
         "--bootstrap-server", BROKER],
        capture_output=True, text=True, timeout=15,
    )
    if check.returncode != 0:
        print(f"{RED}❌ Kafka non accessible dans {KAFKA_CONTAINER}. Docker Compose lancé ?{RESET}")
        print(f"   Erreur: {check.stderr.strip()[:200]}")
        sys.exit(1)
    success("Kafka accessible")

    # Lancer les tests sélectionnés
    for test_id in selected:
        test_id = test_id.upper()
        ALL_TESTS[test_id]()
        wait(3, f"Pause entre les tests pour laisser le CEP traiter {test_id}")

    # Résumé final
    print(f"""
{BOLD}{'='*70}
  {GREEN}✅ Tous les tests ont été injectés !{RESET}
{BOLD}{'='*70}{RESET}

  {CYAN}📋 Commandes de vérification :{RESET}

  1. Logs du moteur de corrélation :
     {BOLD}docker logs first-born-correlation_engine-1 --tail 50{RESET}

  2. Consommer le topic des alertes corrélées :
     {BOLD}docker exec {KAFKA_CONTAINER} kafka-console-consumer \\
       --bootstrap-server {BROKER} \\
       --topic alerts.correlated \\
       --from-beginning --max-messages 20{RESET}

  3. Grafana dashboard :
     {BOLD}http://localhost:3000{RESET} (admin/admin)

  {YELLOW}⚠️  Si aucune corrélation n'apparaît, vérifier :
     - Le correlation_engine tourne : docker ps | grep correlation
     - Redis tourne : docker ps | grep redis
     - Pas d'erreurs de parsing : docker logs first-born-correlation_engine-1 | grep error{RESET}
""")


if __name__ == "__main__":
    main()
