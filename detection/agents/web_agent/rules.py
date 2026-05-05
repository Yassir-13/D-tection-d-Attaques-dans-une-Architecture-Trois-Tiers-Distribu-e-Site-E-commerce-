"""
5 règles signature pour le web_agent.
Chaque règle reçoit un NginxEntry et retourne (rule_id, attack_type, severity) ou None.
"""

import re
import time
from collections import defaultdict
from typing import Optional

from log_parser import NginxEntry
from constants import WEB_DDOS_REQ_PER_MIN, WEB_DDOS_WINDOW_SEC

# ─── Patterns compilés ────────────────────────────────────────────────────────
_SQLI    = re.compile(r"(union.*select|or\s+\d+=\d+|'\s*or\s|--\s*$)", re.I)
_XSS     = re.compile(r"(<script|javascript:|onerror\s*=|onload\s*=)", re.I)
_TRAV    = re.compile(r"(\.\./|/etc/passwd|/proc/self)", re.I)
_SCANNER = re.compile(r"(sqlmap|nikto|nmap|hydra|masscan|zgrab)", re.I)

# ─── Fenêtre glissante pour DDoS (par IP) ────────────────────────────────────
_ip_timestamps: dict[str, list[float]] = defaultdict(list)


def _ddos_check(ip: str) -> bool:
    now = time.time()
    window = _ip_timestamps[ip]
    # Purger les entrées hors fenêtre
    _ip_timestamps[ip] = [t for t in window if now - t < WEB_DDOS_WINDOW_SEC]
    _ip_timestamps[ip].append(now)
    return len(_ip_timestamps[ip]) > WEB_DDOS_REQ_PER_MIN


def check(entry: NginxEntry) -> Optional[tuple[str, str, str]]:
    """Retourne (rule_id, attack_type, severity) ou None."""
    uri = entry.uri
    ua  = entry.ua

    if _SQLI.search(uri):
        return ("WEB-001", "sqli", "high")

    if _XSS.search(uri):
        return ("WEB-002", "xss", "medium")

    if _TRAV.search(uri):
        return ("WEB-003", "path_traversal", "high")

    if _ddos_check(entry.ip):
        return ("WEB-004", "ddos", "critical")

    if _SCANNER.search(ua):
        return ("WEB-005", "scanner", "medium")

    return None