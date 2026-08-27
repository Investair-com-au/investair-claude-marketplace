#!/usr/bin/env python3
"""SessionStart hook: idempotently register the plugin's two weekly
scheduled reports in Cowork's native scheduler.

Runs on every session start. Safe to run repeatedly — only adds entries
that don't already exist; never modifies or removes anything else in the
registry (including unrelated tasks like a user's own scheduled reports).
Fails open everywhere: any unexpected condition (unfamiliar workspace
layout, unreadable/malformed registry, missing reference files) causes a
silent no-op rather than blocking session start or raising.

Workspace layout this relies on (observed, not officially documented):
  .../local-agent-mode-sessions/<space-id>/<session-id>/scheduled-tasks.json
  .../local-agent-mode-sessions/<space-id>/<session-id>/rpm/plugin_<id>/   (CLAUDE_PLUGIN_ROOT)
So the registry is two directories up from CLAUDE_PLUGIN_ROOT.
"""

from __future__ import annotations

import json
import os
import shutil
import time
from pathlib import Path

TASKS = [
    ("investair-weekly-runway-screen", "0 8 * * 1"),
    ("investair-weekly-raises-digest", "0 8 * * 1"),
]


def main() -> None:
    plugin_root_env = os.environ.get("CLAUDE_PLUGIN_ROOT")
    if not plugin_root_env:
        return
    plugin_root = Path(plugin_root_env).resolve()
    if not plugin_root.is_dir():
        return

    workspace_root = plugin_root.parent.parent
    registry_path = workspace_root / "scheduled-tasks.json"
    if not registry_path.is_file():
        return

    try:
        registry = json.loads(registry_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return
    if not isinstance(registry, dict):
        return

    scheduled_tasks = registry.setdefault("scheduledTasks", [])
    if not isinstance(scheduled_tasks, list):
        return

    existing_ids = {
        t.get("id") for t in scheduled_tasks if isinstance(t, dict)
    }

    scheduled_dir = Path.home() / "Claude" / "Scheduled"
    references_dir = (
        plugin_root / "skills" / "setup-scheduled-reports" / "references"
    )

    changed = False
    for task_id, cron_expression in TASKS:
        if task_id in existing_ids:
            continue
        ref_file = references_dir / f"{task_id}.SKILL.md"
        if not ref_file.is_file():
            continue

        dest_dir = scheduled_dir / task_id
        try:
            dest_dir.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(ref_file, dest_dir / "SKILL.md")
        except OSError:
            continue

        scheduled_tasks.append(
            {
                "id": task_id,
                "cronExpression": cron_expression,
                "enabled": True,
                "filePath": str(dest_dir / "SKILL.md"),
                "createdAt": int(time.time() * 1000),
                "permissionMode": "auto",
                "disableJitter": False,
            }
        )
        changed = True

    if changed:
        try:
            registry_path.write_text(
                json.dumps(registry, indent=2) + "\n", encoding="utf-8"
            )
        except OSError:
            pass


if __name__ == "__main__":
    main()
