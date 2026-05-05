"""
7 règles CEP — chaque règle reçoit une alerte entrante et le state store Redis,
et retourne un CorrelatedAlert ou None.
"""

import time
from typing import Optional

import state_store as ss
from kafka_schemas import Alert, CorrelatedAlert
from constants import CEP_WIN, CEP_SCORES


def _make_correlated(rule_id: str, label: str, alert: Alert, trigger_ids: list[str]) -> CorrelatedAlert:
    return CorrelatedAlert(
        rule_id=rule_id,
        label=label,
        risk_score=CEP_SCORES[rule_id],
        source_ip=alert.source_ip,
        user_id=alert.user_id,
        trigger_ids=trigger_ids,
    )


def evaluate(alert: Alert) -> Optional[CorrelatedAlert]:
    """Évalue toutes les règles CEP pour une alerte entrante."""

    ip      = alert.source_ip or "unknown"
    uid     = str(alert.user_id) if alert.user_id else None
    token   = alert.session_token_hash or None
    a_type  = alert.attack_type
    tier    = alert.tier
    alert_d = {"alert_id": alert.alert_id, "attack_type": a_type, "tier": tier}

    # ─── CEP-1 : SQLi web + SQLi db (fenêtre globale 30s) ───────────────────
    # Note : MySQL ne logue pas l'IP cliente donc on corrèle par fenêtre temps
    # On utilise "global" comme dimension pour le state store db
    if tier == "web" and a_type == "sqli":
        ss.add_alert("CEP-1-web", ip, alert_d, CEP_WIN["CEP-1"])
        ss.add_alert("CEP-1-web", "global", alert_d, CEP_WIN["CEP-1"])  # fallback global
        db_alerts = ss.get_alerts_in_window("CEP-1-db", "global", CEP_WIN["CEP-1"])
        if db_alerts:
            ss.clear_window("CEP-1-web", ip)
            ss.clear_window("CEP-1-db", "global")
            return _make_correlated("CEP-1", "CONFIRMED_SQLI_CHAIN", alert,
                                    [a["alert_id"] for a in db_alerts] + [alert.alert_id])

    if tier == "db" and a_type == "sqli_union":
        ss.add_alert("CEP-1-db", "global", alert_d, CEP_WIN["CEP-1"])
        web_alerts = ss.get_alerts_in_window("CEP-1-web", ip, CEP_WIN["CEP-1"])
        # Chercher dans toutes les IPs web récentes
        if not web_alerts:
            # Fallback: chercher dans la fenêtre globale web
            web_alerts = ss.get_alerts_in_window("CEP-1-web", "global", CEP_WIN["CEP-1"])
        if web_alerts:
            ss.clear_window("CEP-1-db", "global")
            return _make_correlated("CEP-1", "CONFIRMED_SQLI_CHAIN", alert,
                                    [a["alert_id"] for a in web_alerts] + [alert.alert_id])

    # ─── CEP-2 : Brute-force + login réussi (même IP, 120s) ──────────────────
    if tier == "app" and a_type == "brute_force":
        ss.add_alert("CEP-2", ip, alert_d, CEP_WIN["CEP-2"])

    if tier == "app" and a_type == "anomaly" and alert.extra.get("status") == 200:
        bf_alerts = ss.get_alerts_in_window("CEP-2", ip, CEP_WIN["CEP-2"])
        if bf_alerts:
            ss.clear_window("CEP-2", ip)
            return _make_correlated("CEP-2", "ACCOUNT_TAKEOVER", alert,
                                    [a["alert_id"] for a in bf_alerts] + [alert.alert_id])

    # ─── CEP-3 : Privilege esc + data exfil (même user_id, 60s) ──────────────
    if uid:
        if tier == "app" and a_type == "privilege_escalation":
            ss.add_alert("CEP-3", uid, alert_d, CEP_WIN["CEP-3"])

        if tier == "db" and a_type == "data_exfiltration":
            priv_alerts = ss.get_alerts_in_window("CEP-3", uid, CEP_WIN["CEP-3"])
            if priv_alerts:
                ss.clear_window("CEP-3", uid)
                return _make_correlated("CEP-3", "PRIV_ESC_EXFIL_CHAIN", alert,
                                        [a["alert_id"] for a in priv_alerts] + [alert.alert_id])

    # ─── CEP-4 : DDoS cascade 3 tiers (même IP, 20s) ────────────────────────
    if a_type in ("ddos", "dos_probe", "connection_flood"):
        ss.add_alert("CEP-4", ip, alert_d, CEP_WIN["CEP-4"])
        alerts_4 = ss.get_alerts_in_window("CEP-4", ip, CEP_WIN["CEP-4"])
        types_seen = {a["attack_type"] for a in alerts_4}
        if {"ddos", "dos_probe", "connection_flood"}.issubset(types_seen):
            ss.clear_window("CEP-4", ip)
            return _make_correlated("CEP-4", "LAYER7_DDOS_CASCADE", alert,
                                    [a["alert_id"] for a in alerts_4])

    # ─── CEP-5 : Insider fraud + data exfil (même user_id, 300s) ─────────────
    if uid:
        if tier == "app" and a_type == "insider_fraud":
            ss.add_alert("CEP-5", uid, alert_d, CEP_WIN["CEP-5"])

        if tier == "db" and a_type == "data_exfiltration":
            insider_alerts = ss.get_alerts_in_window("CEP-5", uid, CEP_WIN["CEP-5"])
            if insider_alerts:
                ss.clear_window("CEP-5", uid)
                return _make_correlated("CEP-5", "INSIDER_DATA_DRAIN", alert,
                                        [a["alert_id"] for a in insider_alerts] + [alert.alert_id])

    # ─── CEP-6 : XSS + même token depuis 2 IPs différentes (120s) ────────────
    if tier == "web" and a_type == "xss" and token:
        alerts_6 = ss.get_alerts_in_window("CEP-6", token, CEP_WIN["CEP-6"])
        ips_seen = {a.get("ip") for a in alerts_6}
        if ips_seen and ip not in ips_seen:
            ss.clear_window("CEP-6", token)
            return _make_correlated("CEP-6", "XSS_SESSION_HIJACK", alert,
                                    [a["alert_id"] for a in alerts_6] + [alert.alert_id])
        ss.add_alert("CEP-6", token, {**alert_d, "ip": ip}, CEP_WIN["CEP-6"])

    # ─── CEP-7 : Scanner + exploit confirmé (même IP, 300s) ──────────────────
    if tier == "web" and a_type == "scanner":
        ss.add_alert("CEP-7", ip, alert_d, CEP_WIN["CEP-7"])

    if a_type not in ("scanner",) and alert.severity in ("high", "critical"):
        scanner_alerts = ss.get_alerts_in_window("CEP-7", ip, CEP_WIN["CEP-7"])
        if scanner_alerts:
            ss.clear_window("CEP-7", ip)
            return _make_correlated("CEP-7", "SCANNER_EXPLOIT_CONFIRMED", alert,
                                    [a["alert_id"] for a in scanner_alerts] + [alert.alert_id])

    return None