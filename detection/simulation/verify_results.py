"""
Verification des resultats CEP apres les simulations.
Lit les logs du correlation_engine et le topic alerts.correlated.
"""
import json
import subprocess
from config import KAFKA_CONTAINER, KAFKA_BROKER, TOPIC_CORRELATED, GREEN, RED, YELLOW, CYAN, BOLD, RESET

EXPECTED = {
    "CEP-1": "CONFIRMED_SQLI_CHAIN",
    "CEP-2": "ACCOUNT_TAKEOVER",
    "CEP-3": "PRIV_ESC_EXFIL_CHAIN",
    "CEP-4": "LAYER7_DDOS_CASCADE",
    "CEP-5": "INSIDER_DATA_DRAIN",
    "CEP-6": "XSS_SESSION_HIJACK",
    "CEP-7": "SCANNER_EXPLOIT_CONFIRMED",
}


def check_engine_logs():
    """Lit les derniers logs du correlation_engine."""
    print(f"\n{BOLD}=== Logs correlation_engine ==={RESET}")
    result = subprocess.run(
        ["docker", "logs", "first-born-correlation_engine-1", "--tail", "60"],
        capture_output=True, text=True
    )
    logs = result.stdout + result.stderr
    found = {}
    for line in logs.splitlines():
        if "CORRELATED" in line:
            print(f"  {GREEN}{line.strip()}{RESET}")
            for rule_id in EXPECTED:
                if rule_id in line:
                    found[rule_id] = True
        elif "[cep] received" in line:
            print(f"  {YELLOW}{line.strip()}{RESET}")
    return found


def check_kafka_topic():
    """Consomme alerts.correlated et retourne les alertes trouvees."""
    print(f"\n{BOLD}=== Topic alerts.correlated ==={RESET}")
    result = subprocess.run(
        ["docker", "exec", KAFKA_CONTAINER,
         "kafka-console-consumer",
         "--bootstrap-server", KAFKA_BROKER,
         "--topic", TOPIC_CORRELATED,
         "--from-beginning",
         "--timeout-ms", "5000"],
        capture_output=True, text=True
    )
    found = {}
    for line in result.stdout.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            alert = json.loads(line)
            rule  = alert.get("rule_id", "?")
            label = alert.get("label", "?")
            score = alert.get("risk_score", "?")
            print(f"  {GREEN}[{rule}] {label} (score={score}){RESET}")
            found[rule] = label
        except json.JSONDecodeError:
            pass
    return found


def print_summary(found_logs, found_kafka):
    print(f"\n{BOLD}{'='*60}{RESET}")
    print(f"{BOLD}  BILAN DES REGLES CEP{RESET}")
    print(f"{'='*60}")
    all_ok = True
    for rule_id, label in EXPECTED.items():
        in_logs  = rule_id in found_logs
        in_kafka = rule_id in found_kafka
        if in_logs or in_kafka:
            print(f"  {GREEN}OK  {rule_id} {label}{RESET}")
        else:
            print(f"  {RED}KO  {rule_id} {label} - Non declenche{RESET}")
            all_ok = False
    print(f"{'='*60}")
    if all_ok:
        print(f"  {GREEN}{BOLD}7/7 regles CEP declenchees ! Architecture validee.{RESET}")
    else:
        triggered = len([r for r in EXPECTED if r in found_logs or r in found_kafka])
        print(f"  {YELLOW}{BOLD}{triggered}/7 regles declenchees.{RESET}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    sys_import = __import__("sys")
    sys_import.stdout.reconfigure(encoding="utf-8", errors="replace")
    found_logs  = check_engine_logs()
    found_kafka = check_kafka_topic()
    print_summary(found_logs, found_kafka)
