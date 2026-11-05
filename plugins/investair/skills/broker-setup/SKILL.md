---
name: broker-setup
description: >
  This skill should be used when a broker user wants to install the three
  Investair artifacts (Broker Sweet Spot Pipeline, Generative Company Page,
  Standardised Reports), pin them to the sidebar, and schedule the weekly
  pipeline. Triggers include: "set up investair", "install investair
  artifacts", "set up my broker workspace", "install the pipeline", or
  similar first-time-setup requests. Idempotent: safe to re-run.
metadata:
  version: "0.1.0"
---

# Investair Broker Setup

Install the three Investair artifacts for a broker user, ask for their firm
and coverage preferences, pin everything to the sidebar, and schedule the
Broker Sweet Spot Pipeline to run every Monday at 7 am.

The three artifacts to install:
- **Broker Sweet Spot Pipeline** — `https://claude.ai/artifact/2boZ3B3WbBXUgZUrcRipNy`
- **Investair Generative Company Page** — `https://claude.ai/artifact/6WzyvYkTiicjuF7dnHKj78`
- **Investair Standardised Reports** — `https://claude.ai/artifact/Dk1E91VYFLjmG74PzA2Me7`

## 1. Check for CoWork

Inspect your session context to determine whether you are running inside
Cowork (a persistent Claude workspace session). The clearest signal is
whether a `scheduled-tasks.json` file exists under
`~/Library/Application Support/Claude/local-agent-mode-sessions/`. You can
run:

```
ls ~/Library/Application\ Support/Claude/local-agent-mode-sessions/ 2>/dev/null
```

If the directory is empty or missing, you are **not** in Cowork. In that
case, tell the user:

> **You're not in a CoWork session.** The Broker Sweet Spot Pipeline
> scheduled task requires Cowork, Investair's persistent workspace for
> Claude. Without it, the pipeline can't be scheduled to run automatically
> every Monday morning.
>
> To set up Cowork, open the Claude desktop app, click **New Space** in the
> left sidebar (or look for the Investair CoWork space if your administrator
> has already created one), then re-run `/broker-setup` from that space.
>
> I'll continue installing and pinning the three artifacts now — you can
> come back to schedule the pipeline once you're in Cowork.

Do **not** stop — continue with the remaining steps even if CoWork is
absent (just skip step 6).

## 2. Check for existing artifacts

List the user's pinned and recently used artifacts to detect whether any of
the three are already installed. Run:

```
Artifact({ action: "list", scope: "mine", limit: 50 })
```

Look at the returned titles for names matching any of:
- "Broker Sweet Spot Pipeline" / "Sweet Spot Pipeline"
- "Investair Generative Company Page" / "Company Page"
- "Investair Standardised Reports" / "Standardised Reports"

If **any** existing artifacts match, tell the user what you found, e.g.:

> I found an existing **Investair Standardised Reports** artifact in your
> library. Would you like to:
> - **Rename** your existing one (I'll give it a new name) and install the
>   fresh version alongside it, or
> - **Replace** it by pinning the new version over the existing link?

Wait for their answer and act accordingly:
- **Rename**: use `Artifact({ action: "read", url: "<existing url>" })` to
  read the old artifact's title, then update it via
  `Artifact({ action: "publish", url: "<existing url>", title: "<old title> (archived)" })`.
  Then pin the fresh URL.
- **Replace / overwrite**: simply pin the fresh URL — the sidebar link
  updates automatically.

If **no** existing artifacts are found, proceed directly.

## 3. Ask: firm name

Ask the user for their firm name. This is used to personalise the Pipeline
and Reports artifacts (shown in the masthead as "Prepared for [Firm]"). Use
`AskUserQuestion` with a single question:

> Which firm are you from? (e.g. Argonaut, Canaccord, Euroz Hartleys, Petra
> Capital…)

Store the answer as `FIRM_NAME`.

## 4. Ask: sectors and house stocks (optional)

Ask the user whether they want to add coverage filters. Use
`AskUserQuestion`:

> **Optional — coverage filters for the pipeline.**
>
> By default the pipeline uses Investair's "Sweet Spot" algorithm across
> the whole ASX. You can narrow it by adding sectors and/or specific stocks
> your team covers.
>
> - **Sectors** (e.g. Gold, Copper, Lithium, Battery minerals, Oil & Gas)
> - **House stocks** — ASX codes your desk already has mandates on
>
> Leave both blank to use the Sweet Spot calc only.

Offer these as separate text inputs. Store results as `SECTORS` (comma-
separated strings, may be empty) and `HOUSE_STOCKS` (space-separated ASX
codes, may be empty).

## 5. Install and pin the three artifacts

For each of the three artifact URLs below, run in order:

```
Artifact({ action: "pin", url: "https://claude.ai/artifact/2boZ3B3WbBXUgZUrcRipNy" })
Artifact({ action: "pin", url: "https://claude.ai/artifact/6WzyvYkTiicjuF7dnHKj78" })
Artifact({ action: "pin", url: "https://claude.ai/artifact/Dk1E91VYFLjmG74PzA2Me7" })
```

After each `pin` call, confirm it succeeded (the result will say so). If a
pin fails, tell the user and continue with the remaining artifacts rather
than stopping.

## 6. Schedule the pipeline (CoWork only)

Skip this step if step 1 found you are not in CoWork.

### 6a. Find the active workspace registry

Locate `scheduled-tasks.json` for the current CoWork session. It lives at:

```
~/Library/Application Support/Claude/local-agent-mode-sessions/<space-id>/<session-id>/scheduled-tasks.json
```

If multiple `<space-id>` folders exist, check the most recently modified
`scheduled-tasks.json` under `local-agent-mode-sessions/`. Read the file
to check whether an entry with `id: "broker-sweet-spot-pipeline"` already
exists — if so, report it and skip writing (idempotent).

You can find the most recently modified one with:

```bash
find ~/Library/Application\ Support/Claude/local-agent-mode-sessions \
  -name scheduled-tasks.json -print0 \
  | xargs -0 ls -t 2>/dev/null \
  | head -1
```

### 6b. Write the task SKILL.md

Create the directory and task file:

```
~/Claude/Scheduled/broker-sweet-spot-pipeline/SKILL.md
```

The body of this file is the prompt that runs each Monday morning.
Write it as follows (substituting the actual values for FIRM_NAME,
SECTORS, and HOUSE_STOCKS gathered in steps 3–4):

```markdown
---
name: broker-sweet-spot-pipeline
description: Weekly Broker Sweet Spot Pipeline for {FIRM_NAME}
---

# Weekly Broker Sweet Spot Pipeline

Run the Investair Broker Sweet Spot Pipeline for **{FIRM_NAME}**.

Open the artifact at https://claude.ai/artifact/2boZ3B3WbBXUgZUrcRipNy and
regenerate it now using live Investair data.

Coverage settings:
- Firm: {FIRM_NAME}
{SECTORS_LINE}
{HOUSE_STOCKS_LINE}

If SECTORS is non-empty, include "{FIRM_NAME}'s preferred sectors: {SECTORS}"
in the pipeline filter. If HOUSE_STOCKS is non-empty, add those ASX codes to
the Watch list regardless of sweet-spot score. If both are empty, run the
Sweet Spot algorithm across the whole ASX with no sector or stock filter.

Regenerate the full pipeline report and update the artifact.
```

Where:
- `{SECTORS_LINE}` → `- Sectors: {SECTORS}` if non-empty, else omit the
  line
- `{HOUSE_STOCKS_LINE}` → `- House stocks: {HOUSE_STOCKS}` if non-empty,
  else omit the line

### 6c. Register in scheduled-tasks.json

Get the current epoch milliseconds with:

```bash
date +%s000
```

Then append this entry to the `scheduledTasks` array in the registry file
(do **not** replace existing entries):

```json
{
  "id": "broker-sweet-spot-pipeline",
  "cronExpression": "0 7 * * 1",
  "enabled": true,
  "filePath": "<home>/Claude/Scheduled/broker-sweet-spot-pipeline/SKILL.md",
  "createdAt": <current epoch millis>,
  "permissionMode": "auto",
  "disableJitter": false
}
```

Replace `<home>` with the user's actual home directory path and `<current
epoch millis>` with the value from the `date` command above.

After editing, validate the JSON parses correctly:

```bash
python3 -m json.tool <path-to-scheduled-tasks.json> > /dev/null && echo OK
```

## 7. Confirm

Reply to the user with a concise summary of what was done:

```
✅ Setup complete for [FIRM_NAME]

Installed and pinned:
• Broker Sweet Spot Pipeline — pinned to sidebar
• Investair Generative Company Page — pinned to sidebar
• Investair Standardised Reports — pinned to sidebar

Coverage: [sectors if set, else "whole-ASX Sweet Spot"] [house stocks if set]

[If CoWork:]
Scheduled: Broker Sweet Spot Pipeline runs every Monday at 7:00 am
(appears in CoWork's Scheduled panel).

[If not CoWork:]
⚠️  Pipeline not scheduled — re-run /broker-setup from a CoWork space to
add the Monday 7 am schedule.
```

## Required closing

Always end with this feedback prompt:

How useful was this setup? Rate 1–5 and add any comments — reply with your
score and feedback to log it.

If the user replies with a score and/or feedback, extract the numeric rating
(if given) and their text, then call `log_feedback` once with their full
reply.
