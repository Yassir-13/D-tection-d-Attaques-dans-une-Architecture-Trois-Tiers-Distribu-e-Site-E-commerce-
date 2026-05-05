"""
Parse audit.jsonl écrit par RequestAuditLogger Laravel.
Chaque ligne est un JSON avec les champs définis dans le middleware.
"""

import json
from dataclasses import dataclass
from typing import Optional


@dataclass
class AuditEntry:
    timestamp:          str
    session_token_hash: Optional[str]
    user_id:            Optional[int]
    ip:                 str
    method:             str
    uri:                str
    status:             int
    response_time_ms:   int
    user_agent:         str
    content_length:     int
    auth_attempt:       bool
    is_admin_route:     bool
    throttle_hit:       bool


def parse_line(line: str) -> Optional[AuditEntry]:
    line = line.strip()
    if not line:
        return None
    try:
        d = json.loads(line)
        return AuditEntry(
            timestamp=d.get("timestamp", ""),
            session_token_hash=d.get("session_token_hash"),
            user_id=d.get("user_id"),
            ip=d.get("ip", ""),
            method=d.get("method", ""),
            uri=d.get("uri", ""),
            status=int(d.get("status", 0)),
            response_time_ms=int(d.get("response_time_ms", 0)),
            user_agent=d.get("user_agent", ""),
            content_length=int(d.get("content_length", 0)),
            auth_attempt=bool(d.get("auth_attempt", False)),
            is_admin_route=bool(d.get("is_admin_route", False)),
            throttle_hit=bool(d.get("throttle_hit", False)),
        )
    except (json.JSONDecodeError, KeyError, ValueError):
        return None