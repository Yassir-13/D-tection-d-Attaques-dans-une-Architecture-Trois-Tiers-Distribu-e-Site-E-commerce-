"""
5 règles signature pour l'app_agent (basées sur audit.jsonl Laravel).
"""

import time
from collections import defaultdict
from typing import Optional

from log_parser import AuditEntry
from constants import (
    APP_BRUTE_FORCE_FAILS, APP_BRUTE_FORCE_WIN_SEC,
    APP_PRIV_ESC_HITS, APP_PRIV_ESC_WIN_SEC,
    APP_INSIDER_ORDERS, APP_INSIDER_WIN_SEC,
    APP_DOS_PROBE_MS, APP_PAYLOAD_MAX_BYTES,
)

# ─── State — fenêtres glissantes par IP / token ───────────────────────────────
_login_fails:  dict[str, list[float]] = defaultdict(list)   # APP-001
_admin_hits:   dict[str, list[float]] = defaultdict(list)   # APP-002
_order_counts: dict[str, list[float]] = defaultdict(list)   # APP-003


def _window(store: dict, key: str, window_sec: int) -> list[float]:
    """Purge et retourne la fenêtre glissante pour une clé donnée."""
    now = time.time()
    store[key] = [t for t in store[key] if now - t < window_sec]
    store[key].append(now)
    return store[key]


def check(entry: AuditEntry) -> Optional[tuple[str, str, str]]:
    """Retourne (rule_id, attack_type, severity) ou None."""

    # APP-001 : Brute-force login (≥5 status 401/429 sur /api/login en 60s)
    if entry.auth_attempt and entry.status in (401, 429):
        w = _window(_login_fails, entry.ip, APP_BRUTE_FORCE_WIN_SEC)
        if len(w) >= APP_BRUTE_FORCE_FAILS:
            return ("APP-001", "brute_force", "high")

    # APP-002 : Privilege escalation (≥3 status 401/403 sur /api/admin/* en 60s)
    if entry.is_admin_route and entry.status in (401, 403):
        w = _window(_admin_hits, entry.ip, APP_PRIV_ESC_WIN_SEC)
        if len(w) >= APP_PRIV_ESC_HITS:
            return ("APP-002", "privilege_escalation", "high")

    # APP-003 : Insider fraud (≥10 commandes par session en 5min)
    if entry.method == "POST" and "/api/orders" in entry.uri and entry.session_token_hash:
        w = _window(_order_counts, entry.session_token_hash, APP_INSIDER_WIN_SEC)
        if len(w) >= APP_INSIDER_ORDERS:
            return ("APP-003", "insider_fraud", "medium")

    # APP-004 : DoS probe (response_time > 5000ms)
    if entry.response_time_ms > APP_DOS_PROBE_MS:
        return ("APP-004", "dos_probe", "medium")

    # APP-005 : Payload oversize (content_length > 50KB sur POST non-upload)
    if (entry.method == "POST"
            and entry.content_length > APP_PAYLOAD_MAX_BYTES
            and "/upload" not in entry.uri):
        return ("APP-005", "payload_oversize", "low")

    return None