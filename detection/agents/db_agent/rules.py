"""
6 règles signature pour le db_agent.
Note : DB-001/003/005 sont best-effort car Eloquent paramétrise les requêtes.
"""

import re
import time
from collections import defaultdict
from typing import Optional

from log_parser import QueryEntry
from constants import DB_FLOOD_QUERIES, DB_FLOOD_WIN_SEC

# ─── Patterns compilés ────────────────────────────────────────────────────────
_SQLI_UNION  = re.compile(r"UNION\s+(ALL\s+)?SELECT", re.I)
_DESTRUCTIVE = re.compile(r"(DROP\s+TABLE|TRUNCATE\s+TABLE|DELETE\s+FROM\s+\w+\s*;)", re.I)
_EXFIL       = re.compile(r"SELECT.+FROM\s+users(?!\s+WHERE\s+id\s*=)", re.I | re.S)
_TIME_BLIND  = re.compile(r"(SLEEP\s*\(|BENCHMARK\s*\()", re.I)

# ─── Fenêtre glissante par thread_id pour DB-004 ─────────────────────────────
_thread_ts: dict[str, list[float]] = defaultdict(list)


def _flood_check(thread_id: str) -> bool:
    now = time.time()
    _thread_ts[thread_id] = [t for t in _thread_ts[thread_id] if now - t < DB_FLOOD_WIN_SEC]
    _thread_ts[thread_id].append(now)
    return len(_thread_ts[thread_id]) > DB_FLOOD_QUERIES


def check(entry: QueryEntry) -> Optional[tuple[str, str, str]]:
    sql = entry.sql

    if _SQLI_UNION.search(sql):
        return ("DB-001", "sqli_union", "critical")

    if _DESTRUCTIVE.search(sql):
        return ("DB-002", "destructive_query", "critical")

    if _EXFIL.search(sql):
        return ("DB-003", "data_exfiltration", "high")

    if _flood_check(entry.thread_id):
        return ("DB-004", "connection_flood", "high")

    if _TIME_BLIND.search(sql):
        return ("DB-005", "time_based_sqli", "critical")

    return None