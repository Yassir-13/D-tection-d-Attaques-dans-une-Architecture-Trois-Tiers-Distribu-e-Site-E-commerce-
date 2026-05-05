from __future__ import annotations

"""
Modèles Pydantic partagés entre agents et moteur CEP.
Chaque agent produit un Alert, le moteur CEP produit un CorrelatedAlert.
"""

from datetime import datetime
from typing import Any, Literal, Optional
from uuid import uuid4

from pydantic import BaseModel, Field


# ─── Enums (Literal types) ────────────────────────────────────────────────────

Tier     = Literal["web", "app", "db"]
Severity = Literal["low", "medium", "high", "critical"]
AttackType = Literal[
    "sqli", "sqli_union", "xss", "path_traversal", "ddos",
    "brute_force", "privilege_escalation", "insider_fraud",
    "dos_probe", "payload_oversize", "destructive_query",
    "data_exfiltration", "connection_flood", "time_based_sqli",
    "slow_anomaly", "scanner", "anomaly",
]


# ─── Alerte produite par un agent (topics alerts.web/app/db) ──────────────────

class Alert(BaseModel):
    alert_id:           str       = Field(default_factory=lambda: str(uuid4()))
    timestamp:          str       = Field(default_factory=lambda: datetime.utcnow().isoformat())
    tier:               Tier
    source_ip:          str
    session_token_hash: Optional[str]  = None
    user_id:            Optional[int]  = None
    attack_type:        AttackType
    severity:           Severity
    confidence:         float          = 1.0
    raw_evidence:       str            = ""
    rule_id:            str            = ""
    extra:              dict[str, Any] = Field(default_factory=dict)

    def to_kafka(self) -> bytes:
        """Sérialise en JSON bytes pour le producer Kafka."""
        return self.model_dump_json().encode()


# ─── Alerte corrélée produite par le moteur CEP (topic alerts.correlated) ──────

class CorrelatedAlert(BaseModel):
    alert_id:    str      = Field(default_factory=lambda: str(uuid4()))
    timestamp:   str      = Field(default_factory=lambda: datetime.utcnow().isoformat())
    rule_id:     str                        # CEP-1 … CEP-7
    label:       str                        # ex: CONFIRMED_SQLI_CHAIN
    risk_score:  int                        # 0-100
    source_ip:   Optional[str]  = None
    user_id:     Optional[int]  = None
    trigger_ids: list[str]      = Field(default_factory=list)  # alert_ids déclencheurs
    extra:       dict[str, Any] = Field(default_factory=dict)

    def to_kafka(self) -> bytes:
        return self.model_dump_json().encode()