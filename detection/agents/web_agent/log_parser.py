"""
Parse le format Nginx combined log :
'$remote_addr - $remote_user [$time_local] "$request" $status $body_bytes_sent "$http_referer" "$http_user_agent"'
"""

import re
from dataclasses import dataclass
from typing import Optional

# Regex stricte sur le format combined configuré dans app.conf
_PATTERN = re.compile(
    r'(?P<ip>\S+) - \S+ \[(?P<time>[^\]]+)\] '
    r'"(?P<method>\S+) (?P<uri>\S+) \S+" '
    r'(?P<status>\d{3}) (?P<bytes>\d+) '
    r'"[^"]*" "(?P<ua>[^"]*)"'
)


@dataclass
class NginxEntry:
    ip:     str
    time:   str
    method: str
    uri:    str
    status: int
    bytes:  int
    ua:     str


def parse_line(line: str) -> Optional[NginxEntry]:
    m = _PATTERN.match(line.strip())
    if not m:
        return None
    return NginxEntry(
        ip=m.group("ip"),
        time=m.group("time"),
        method=m.group("method"),
        uri=m.group("uri"),
        status=int(m.group("status")),
        bytes=int(m.group("bytes")),
        ua=m.group("ua"),
    )