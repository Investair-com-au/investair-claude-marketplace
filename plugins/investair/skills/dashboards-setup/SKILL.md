---
name: dashboards-setup
description: "Investair Dashboards setup. This skill should be used when the user runs /investair:dashboards-setup, asks to \"set up Investair\", \"set up my Investair dashboards\", \"build my dashboards\", \"monitor my sector\", \"watch these stocks for me\", \"set up alerts on [ticker] and its peers\", or wants recurring Investair dashboards and reports tailored to their firm and house stocks or sector. Welcomes the user, asks their firm and the sector or house-stock list, checks the ASX codes, offers three dashboards to configure (more on request), then builds each one in the Investair Style Guide with a walk-through and a suggested test scenario before moving to the next."
metadata:
  version: "0.1.0"
---

# Investair Dashboards

Seven steps, in this order: **check you are in Cowork → check for existing dashboards → welcome → firm and coverage → check the list → choose dashboards → build each, with a walk-through.** Every dashboard follows `references/investair-style.md` (the Investair Style Guide).

Keep the conversation short and plain: no tool names, cron syntax, table names or file paths in user-facing text. Use AskUserQuestion when available (it always offers a free-text answer).

## Step 0 — Check this is Cowork (before anything else)

The dashboards need Cowork: its scheduled tasks (for the Monday and weekday reports), pinned pages (the Artifact tool) and the user's own Investair connector. Check silently, without asking the user:

- **Cowork signals:** a scheduled-task tool is available (for example `create_scheduled_task`) **and** the Artifact tool is available, and the session is not a coding session in a project folder.
- **Not Cowork:** no scheduled-task tool, or no Artifact tool, or this is plainly a code session (a project working directory, git and terminal tools).

If the signals say Cowork, say nothing and go to Step 1. If they do not, do not start the setup. Say, in plain words:

> "These dashboards run best in Cowork, which gives me scheduled tasks and pinned pages. It looks like you're in a different mode. To switch: open the Claude desktop app, choose **Cowork** at the top of the window (not Chat or Code), start a new task, and type **/investair:dashboards-setup** again. Your Investair connector carries across, so there's nothing to reinstall."

Then offer one alternative: "If you'd rather stay here, I can still build the pages that don't need scheduling (dashboards 4 to 7) and give you the prompts for the scheduled ones to add yourself later." Continue only if the user says so, and in that case skip scheduling in Step 5 and hand over the finished prompts instead. If you are unsure which mode this is, say so and give the same switch instructions rather than guessing.

## Step 0b — Check for existing dashboards (still before the welcome)

Look, silently, for anything this setup would create that already exists:
- **Scheduled tasks** whose name starts with "Investair —" (list the user's scheduled tasks), including the two default weekly digests.
- **Pinned or published pages** (Artifact list) whose title contains: "Sweet Spot Pipeline", "Raise Pipeline", "Morning Report", "Morning Brief", "Flash", "Newsletter", "Expectations Tracker", "Expectations Dashboard", "Burn and Runway", "Standardised Reports", "Research Desk" or "Company Page".

If nothing matches, say nothing and go to Step 1. If something matches, list what you found (name and what it is, one line each) and say, in plain words:

> "You already have some Investair dashboards or reports set up. So that this setup doesn't overwrite them, please **rename** them first (for example add "old" to the name, in the Scheduled panel and on each page), then tell me when that's done. Or, if you'd like the new versions to replace them, tell me to **overwrite** and I'll update them in place."

Then wait for the answer (AskUserQuestion with the two choices where available):
- **Renamed:** re-run the check. Anything still matching is treated as still unrenamed: ask again. Then continue; everything built is new.
- **Overwrite:** continue, and in Step 5 update the existing task or page in place (same schedule slot, same page address) instead of creating a second one. Before overwriting a page, read it and say in one line what will be replaced. Overwrite only the items the user chose to rebuild in Step 4, never the rest.
- If the user says neither, do not overwrite anything: ask once more, then stop.

Never delete an existing task or page, and never overwrite one the user has not confirmed.

## Step 1 — Welcome

Open with one short message, in your own words, that covers:
- what this does: it builds a set of Investair dashboards for the user's firm and coverage, runs each once so they see a real result, and schedules the ones that refresh on their own;
- that every dashboard can be changed afterwards **by simply asking Claude** ("add MIN to the house list", "move the morning report to 6:30", "drop the catalysts column");
- that it takes about 10 minutes, plus a short test of each dashboard.

Then go straight to Step 2. Do not wait for a reply to the welcome.

## Step 2 — Firm and coverage (one message, two questions)

1. **Firm.** "Which firm are you with?" Free text. Used for the dashboard label ("Prepared for <firm> · Internal"). If the firm is a broker, ECM house or corporate adviser, also match it to a broker name in Investair's placement data (`Broker.deal_broker_map`, canonical id and name) and confirm in one line ("I found 13 deals for MST in the last 12 months — is that you?"). Dashboard 1 is built on this. If the firm is a listed company, resolve it to its ticker.
2. **Sector or house stocks.** First ask which kind of coverage they want. Quick picks: a list of tickers (house stocks); a sector or sub-industry; one company and its peers; the whole ASX. Then **always ask the user to type it in, in their own words**, never choose it for them from a fixed list: for a sector or sub-industry, "Type the sector or sub-industry you cover (for example WA gold explorers, lithium developers, biotech)"; for house stocks, "Type or paste your ASX codes"; for one company, "Type the ASX code or company name". Say once: **this can be changed at any time, in each dashboard or by asking me.**

Ask each question once. If a reply answers only part, treat that as settled and re-ask only what is missing. Audience defaults to internal.

## Step 3 — Check the list

Turn question 2 into a confirmed list. Skip this step if the user chose the whole ASX.

- **Ticker list:** resolve every code (`resolve_company`) and check listing status (`check_listing_status`). Report plainly: how many companies are covered, and every code that has a problem — not found, a typo or lookalike (suggest the likely match), delisted, suspended, or renamed (follow the rename and say so). Drop delisted names only after saying so.
- **Sector or sub-industry:** shortlist with Investair aggregate queries or screens. Leave out companies that only touch the theme in passing. Show the definition and the count.
- **One company:** resolve it and build its peer group with the Investair peers tool; show why each peer is in.

Cap the list at about 25 and say if you trimmed it. Show one line per company (ticker and name) and ask the user to confirm or edit. Save the confirmed list exactly: it goes into every scheduled prompt and seeds every page.

**Editable lists.** Every dashboard that uses the list must also let the user change it:
- *Scheduled reports:* the list is in the task prompt. To change it, the user asks Claude, and Claude rewrites the prompt (re-run Step 3's checks first).
- *Pinned pages:* the page carries an editable list (add, remove, reset to the firm's list), saved per viewer. Follow each reference file.

## Step 4 — Choose the dashboards (one message, multi-select)

Offer exactly these three, in this order, one line each (name, refresh, what it gives them). Recommend all three for a broker, ECM house or adviser; for anyone else recommend 1 and 3. Let them pick any.

| # | Dashboard | Refresh | Reference |
|---|---|---|---|
| 1 | **Investair Generative Company Page** | On demand | `company-page.md` |
| 2 | **Placement Prospect Pipeline** (the broker's sweet-spot sector and profile, with catalysts) | Weekly, Monday morning | `report-catalogue.md` entry 9 (sweet-spot method) and `pipeline-format.md`. Built for a broker, ECM or adviser firm; if the firm is not one, say so and offer entry 8, the sector raise pipeline, instead. |
| 3 | **Standardised Reports** (pre-built page): Roadshow Plan & Narrative, Investor Targets, Initiation-style Report, Sector Report | On demand | `standardised-reports.md` |

**Do not mention any other dashboard.** The four below stay hidden until the user asks for more dashboards (for example "what else can you build", "more dashboards", "anything for the morning", or they name one). When they ask, offer these four, and only these, in the same way, build the ones they choose using Step 5, then carry on with the rest of the flow (walk-throughs, wrap-up).

| Hidden until asked | Refresh | Reference |
|---|---|---|
| **Market Morning Report** (house stocks and peers) | Every weekday morning | `dashboards.md` § Market Morning Report |
| **Sector / sub-industry / peer group daily flash and weekly newsletter** | Flash weekdays, newsletter Mondays | `dashboards.md` § Daily flash and weekly newsletter |
| **Company Expectation Tracker** | On demand, optional evening check | `expectations-tracker.md` |
| **Cash burn and runway analysis** | On demand, optional weekday check | `burn-runway-outlook.md` |

Use what Step 0b found: if a choice matches an existing task or page the user chose to overwrite, rebuild it in place; if they renamed it, build a new one; if it is not covered by their answer, ask before touching it.

## Step 5 — Build each dashboard, one at a time

Work through the chosen dashboards in the order offered (the three first, then any extras they asked for). For each one:

1. **Confirm the schedule** (scheduled ones only) in one line. Defaults, in the user's timezone (Australia/Sydney if unknown): sweet-spot list Monday 7:00am; morning report weekdays 7:00am; sector flash weekdays 7:30am; weekly newsletter Monday 7:00am; evening checks weekdays 6:00pm; pinned pages on demand.
2. **Build it** from its reference file. Scheduled reports use a self-contained task prompt from `references/task-prompt-template.md` (the firm, the confirmed list, exact data pulls, publish and notify rules, output format, and the style rules from `investair-style.md`, inlined: a scheduled run starts with no memory of this chat). Dashboards 4 to 7 are pre-built pages: fill the placeholders in the HTML file named in the reference and publish it with the Artifact tool (pinned where the reference says so), changing nothing else. Without the Artifact tool, use an email-ready Markdown file.
3. **Run it now**, in this conversation, so the user sees a real result. Ask whether content and format are right; adjust and confirm.
4. **Schedule it** (scheduled ones only) with the session's scheduled-task tool: name prefixed `Investair —`, the approved time, notifications on (email and push). If there is no scheduling tool, hand over the finished prompt to add from the Scheduled panel. Never schedule anything the user has not approved.
5. **Walk-through and test scenario.** Before moving on, give the user a short walk-through of that dashboard and one suggested scenario to try, using the user's own firm and companies. Use `references/walkthroughs.md` for the shape. Name the three things to look at, one thing to try ("ask me to add a ticker", "open the Burn dashboard and add <ticker from their list>"), and what a good result looks like. Then ask whether it behaved as expected, fix anything, and only then start the next dashboard.

If the user wants to stop part way, stop. Offer to resume the remaining dashboards later.

## Wrap-up

One line per dashboard: name, when it refreshes, where it lives. Remind them that an email (and a phone notification if enabled) arrives whenever a scheduled run has something new, that quiet runs stay quiet, and that any dashboard, its list or its schedule can be changed by asking Claude. Add one line that they can ask for more dashboards at any time.

## Default weekly digests

The main Investair plugin's install hook normally registers two Monday 8:00am digests: the funding-risk screen and the capital-raises digest. If they are missing and the user wants them, run the plugin's `setup-scheduled-reports` skill, which registers them (it is safe to re-run). Never register them twice.

## Data rules (apply to setup and every scheduled prompt)

- Use the Investair MCP connector for all company data. Pass `user_question` on every call: the user's words during setup; the dashboard's name and purpose in scheduled runs.
- Prefer batch and screen tools over looping company by company. Use `run_readonly_sql` for aggregates and history the dedicated tools don't cover; check column names with `describe_table` first (e.g. `ASX_Announcement_Metadata` uses `rec_date`; `mining_company_project_current` uses `ticker`).
- Never invent figures, catalysts, dates or holders. Label inferred items as inferences and say what evidence they rest on.
- State the as-of date of market and cashflow data; it can lag the calendar date.
- Runway in weeks = Investair confirmed runway in quarters × 13. A 4–10 week window is 0.31–0.77 quarters.
- When joining tables on ticker across schemas, add `COLLATE utf8mb4_unicode_ci` on both sides. Project `commodities` values can carry a weight suffix ("Gold 1.00"); take the first word before grouping.
- Never use a literal `%` in SQL (use `INSTR(LOWER(col),'x') > 0`, not `LIKE`).
- Use web sources only for context and news, from reputable outlets (company ASX releases, AFR, The Australian, Reuters, Bloomberg, The West Australian business, government and regulator sites). Never let web figures override Investair data; if they conflict, report both.

## Required closing
Always end every successful user-visible reply with this exact final line:

How did this land — accurate, useful content, right format? Reply with feedback in your next message (or run /log-feedback) and I'll log it.
