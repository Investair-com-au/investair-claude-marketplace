#!/usr/bin/env python3
"""SessionStart hook: notify if installed Investair plugin is behind GitHub main.

Fails open everywhere — network/auth/parse errors and up-to-date installs
produce no output. Only prints when remote version > local version.
"""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from pathlib import Path

REMOTE_PLUGIN_JSON = (
    "https://raw.githubusercontent.com/Investair-com-au/"
    "investair-claude-marketplace/main/plugins/investair/"
    ".claude-plugin/plugin.json"
)
TIMEOUT_SEC = 3


def _parse_semver(raw: str) -> tuple[int, ...] | None:
    text = (raw or "").strip()
    if not text:
        return None
    # Allow optional leading "v"
    if text.lower().startswith("v"):
        text = text[1:]
    parts: list[int] = []
    for piece in text.split("."):
        # Strip pre-release / build metadata: 1.2.3-rc1 → 1.2.3
        num = ""
        for ch in piece:
            if ch.isdigit():
                num += ch
            else:
                break
        if not num:
            return None
        parts.append(int(num))
    return tuple(parts) if parts else None


def _read_version(path: Path) -> str | None:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None
    if not isinstance(data, dict):
        return None
    ver = data.get("version")
    return ver.strip() if isinstance(ver, str) and ver.strip() else None


def _fetch_remote_version() -> str | None:
    try:
        req = urllib.request.Request(
            REMOTE_PLUGIN_JSON,
            headers={
                "Accept": "application/json",
                "User-Agent": "investair-plugin-version-check",
            },
        )
        with urllib.request.urlopen(req, timeout=TIMEOUT_SEC) as resp:
            raw = resp.read().decode("utf-8", errors="replace")
        data = json.loads(raw)
    except (
        urllib.error.URLError,
        urllib.error.HTTPError,
        TimeoutError,
        json.JSONDecodeError,
        OSError,
    ):
        return None
    if not isinstance(data, dict):
        return None
    ver = data.get("version")
    return ver.strip() if isinstance(ver, str) and ver.strip() else None


def main() -> None:
    try:
        plugin_root_env = os.environ.get("CLAUDE_PLUGIN_ROOT")
        if not plugin_root_env:
            return
        plugin_root = Path(plugin_root_env).resolve()
        local_path = plugin_root / ".claude-plugin" / "plugin.json"
        if not local_path.is_file():
            return

        local = _read_version(local_path)
        remote = _fetch_remote_version()
        if not local or not remote:
            return

        local_t = _parse_semver(local)
        remote_t = _parse_semver(remote)
        if local_t is None or remote_t is None:
            return

        if remote_t > local_t:
            print(
                f"Investair plugin update available: you have {local}, "
                f"latest is {remote} — Sync/Update the marketplace in Claude."
            )
    except Exception:  # noqa: BLE001 — never block session start
        return


if __name__ == "__main__":
    main()
