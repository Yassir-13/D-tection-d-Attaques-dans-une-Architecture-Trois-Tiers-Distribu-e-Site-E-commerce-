"""
Parse MySQL general_query.log.
Format : 'YYYY-MM-DDTHH:MM:SS.ffffff+00:00\t\t   <thread_id> Query\t<sql>'
Les lignes d'entête (Version, Tcp port, etc.) sont ignorées.
"""

import re
from dataclasses import dataclass
from typing import Optional

# Ligne de requête : timestamp, thread_id, commande, SQL
_PATTERN = re.compile(
    r"^(?P<ts>\S+)\s+"
    r"(?P<thread>\d+)\s+"
    r"(?P<cmd>Query|Execute|Prepare)\s+"
    r"(?P<sql>.+)$"
)


@dataclass
class QueryEntry:
    timestamp: str
    thread_id: str
    command:   str
    sql:       str


def parse_line(line: str) -> Optional[QueryEntry]:
    m = _PATTERN.match(line.strip())
    if not m:
        return None
    return QueryEntry(
        timestamp=m.group("ts"),
        thread_id=m.group("thread"),
        command=m.group("cmd"),
        sql=m.group("sql").strip(),
    )