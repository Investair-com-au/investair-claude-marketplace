---
name: setup-scheduled-reports
description: >
  This skill should be used when the user asks to "set up the scheduled
  reports", "install the weekly digests", "wire up the investair scheduled
  tasks", or right after installing the investair plugin and the
  user wants the two weekly digests (cash-runway screen, capital raises
  digest) actually registered in Cowork's own scheduler — not Claude Code's
  local scheduler and not a session-only cron. Idempotent: safe to re-run.
metadata:
  version: "0.1.0"
---

# Set Up Scheduled Reports

Register this plugin's two weekly digests (`investair-weekly-runway-screen`,
`investair-weekly-raises-digest`) as real, persistent Cowork scheduled tasks — the
ones that show up in Cowork's own "Scheduled" panel, not Claude Code's
local `~/.claude/scheduled-tasks/` and not an in-session `CronCreate` job
(that one is ephemeral and expires in 7 days).

Cowork's native scheduler has two parts, both required:

1. A task file at `~/Claude/Scheduled/<task-id>/SKILL.md` (YAML
   frontmatter `name` + `description`, body = the prompt that runs each
   fire)
2. An entry in the active workspace's `scheduled-tasks.json` registry that
   points at that file (`id`, `cronExpression`, `enabled`, `filePath`,
   `createdAt`, `permissionMode`, `disableJitter`)

## 1. Find the active workspace's registry

Locate `scheduled-tasks.json` for the current Cowork session/workspace.
It lives at:

```
~/Library/Application Support/Claude/local-agent-mode-sessions/<space-id>/<session-id>/scheduled-tasks.json
```

If you can't tell which `<space-id>/<session-id>` is the active one from
context, check the most recently modified `scheduled-tasks.json` under
`local-agent-mode-sessions/`, or ask the user to confirm — do not guess
across multiple candidates and write to the wrong workspace.

Read the file first. If entries with `id: investair-weekly-runway-screen`
or `id: investair-weekly-raises-digest` already exist, this has already
been set up — report that and stop rather than duplicating entries.

## 2. Write the task files

Copy the two reference files in this skill's `references/` directory
verbatim to:

- `~/Claude/Scheduled/investair-weekly-runway-screen/SKILL.md`
- `~/Claude/Scheduled/investair-weekly-raises-digest/SKILL.md`

(Create the parent directories if they don't exist.)

## 3. Register both in scheduled-tasks.json

Add two entries to the `scheduledTasks` array (append, don't replace
existing entries):

```json
{
  "id": "investair-weekly-runway-screen",
  "cronExpression": "0 8 * * 1",
  "enabled": true,
  "filePath": "<home>/Claude/Scheduled/investair-weekly-runway-screen/SKILL.md",
  "createdAt": <current epoch millis>,
  "permissionMode": "auto",
  "disableJitter": false
}
```

Same shape for `investair-weekly-raises-digest`. Get the current epoch
millis from the shell (e.g. `date +%s000`) rather than guessing.
`cronExpression` is 5-field, local time. Default to `0 8 * * 1` (Monday
8am) — the user's confirmed cadence for these two reports — but ask first
if the user wants something different when running this skill fresh in a
new environment.

Validate the JSON parses after editing before finishing (e.g.
`python3 -m json.tool <file>`).

## 4. Confirm

Tell the user both tasks are registered, their cadence, and that they'll
now appear in Cowork's own Scheduled panel — distinct from anything set up
via Claude Code's `/schedule` or the cloud-routine (`RemoteTrigger`)
mechanisms, which are different systems entirely and won't show up there.
