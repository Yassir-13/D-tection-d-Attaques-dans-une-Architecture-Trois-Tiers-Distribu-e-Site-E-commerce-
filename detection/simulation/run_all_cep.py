"""
Orchestrateur principal — Lance les 7 simulations CEP dans l'ordre.

Usage:
    python run_all_cep.py              # Tous les tests
    python run_all_cep.py CEP-1 CEP-7 # Tests specifiques
    python run_all_cep.py --verify     # Verification uniquement
"""
import sys
import time

# Fix encodage Windows
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

from config import GREEN, RED, YELLOW, CYAN, BOLD, RESET
from kafka_inject import check_kafka, flush_redis_cep_state, wait

import sim_cep1_sqli_chain
import sim_cep2_account_takeover
import sim_cep3_priv_esc_exfil
import sim_cep4_ddos_cascade
import sim_cep5_insider_drain
import sim_cep6_xss_hijack
import sim_cep7_scanner_exploit
import verify_results

ALL_SIMS = {
    "CEP-1": sim_cep1_sqli_chain.run,
    "CEP-2": sim_cep2_account_takeover.run,
    "CEP-3": sim_cep3_priv_esc_exfil.run,
    "CEP-4": sim_cep4_ddos_cascade.run,
    "CEP-5": sim_cep5_insider_drain.run,
    "CEP-6": sim_cep6_xss_hijack.run,
    "CEP-7": sim_cep7_scanner_exploit.run,
}

# Temps d'attente entre chaque CEP (laisse le moteur traiter)
INTER_CEP_WAIT = 5


def banner():
    print(f"""
{BOLD}{CYAN}
╔══════════════════════════════════════════════════════════════╗
║      Suite de Simulation CEP — Architecture 3-Tier          ║
║      7 regles : SQLi / Takeover / PrivEsc / DDoS /          ║
║                 Insider / XSS Hijack / Scanner               ║
╚══════════════════════════════════════════════════════════════╝
{RESET}""")


def main():
    banner()

    # -- Mode verification uniquement
    if "--verify" in sys.argv:
        verify_results.check_engine_logs()
        found = verify_results.check_kafka_topic()
        verify_results.print_summary({}, found)
        return

    # -- Selection des CEPs a lancer
    requested = [a.upper() for a in sys.argv[1:] if a.startswith("CEP")]
    selected  = requested if requested else list(ALL_SIMS.keys())

    for s in selected:
        if s not in ALL_SIMS:
            print(f"{RED}CEP inconnu: {s}{RESET}")
            sys.exit(1)

    # -- Prerequisites
    print(f"  {YELLOW}> Verification Kafka...{RESET}", end=" ")
    if not check_kafka():
        print(f"{RED}ECHEC — Docker Compose lance ?{RESET}")
        sys.exit(1)
    print(f"{GREEN}OK{RESET}")

    # -- Flush Redis pour depart propre
    flush_redis_cep_state()

    # -- Execution
    results = {}
    for rule_id in selected:
        try:
            ALL_SIMS[rule_id]()
            results[rule_id] = True
        except Exception as e:
            print(f"  {RED}[{rule_id}] ERREUR: {e}{RESET}")
            results[rule_id] = False
        wait(INTER_CEP_WAIT, f"pause apres {rule_id}")

    # -- Attente finale pour que le CEP engine traite tout
    print(f"\n  {YELLOW}> Attente 10s — CEP engine en cours de traitement...{RESET}")
    time.sleep(10)

    # -- Verification automatique
    found_logs  = verify_results.check_engine_logs()
    found_kafka = verify_results.check_kafka_topic()
    verify_results.print_summary(found_logs, found_kafka)


if __name__ == "__main__":
    main()
