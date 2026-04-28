from __future__ import annotations

import time
import requests


def _make_session(token: str, is_post: bool = False) -> requests.Session:
    s = requests.Session()
    s.headers.update({
        "Authorization": f"Bearer {token}",
        "Connection": "close",
    })
    if is_post:
        s.headers["Content-Type"] = "application/json"
    return s


def arm_get(url: str, token: str, timeout: int = 30) -> requests.Response:
    last_err: Exception | None = None
    for attempt in range(3):
        try:
            with _make_session(token) as s:
                return s.get(url, timeout=timeout)
        except requests.exceptions.ConnectionError as e:
            last_err = e
            time.sleep(0.5 * (attempt + 1))
    raise last_err


def arm_post(url: str, token: str, timeout: int = 30) -> requests.Response:
    last_err: Exception | None = None
    for attempt in range(3):
        try:
            with _make_session(token, is_post=True) as s:
                return s.post(url, json={}, timeout=timeout)
        except requests.exceptions.ConnectionError as e:
            last_err = e
            time.sleep(0.5 * (attempt + 1))
    raise last_err
