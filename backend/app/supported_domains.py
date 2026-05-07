"""Whitelist of domains accepted by the scraper.

Built dynamically from recipe-scrapers' own registry so the list stays in sync
with the installed library version. Used to reject any URL whose host is not a
known recipe site, preventing abuse of the backend as a generic fetch proxy.
"""
from functools import lru_cache
from urllib.parse import urlparse


@lru_cache(maxsize=1)
def _supported_domains() -> frozenset[str]:
    try:
        from recipe_scrapers import SCRAPERS
    except ImportError:
        return frozenset()
    return frozenset(SCRAPERS.keys())


def is_supported_url(url: str) -> bool:
    try:
        host = urlparse(url).hostname
    except ValueError:
        return False
    if not host:
        return False
    host = host.lower().lstrip(".")
    domains = _supported_domains()
    if host in domains:
        return True
    parts = host.split(".")
    for i in range(1, len(parts) - 1):
        if ".".join(parts[i:]) in domains:
            return True
    return False
