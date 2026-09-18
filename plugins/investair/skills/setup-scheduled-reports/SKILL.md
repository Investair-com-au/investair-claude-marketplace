---
name: setup-scheduled-reports
description: >
  This skill should be used when the user asks to "set up the scheduled
  reports", "install the weekly digests", or wants the two weekly Investair
  digests registered. Idempotent: safe to re-run. The install hook usually
  does this automatically.
metadata:
  version: "0.1.0"
---

# Set Up Scheduled Reports

Register the two weekly Investair digests (funding-risk screen and capital-raises digest) in Cowork's scheduler if they are not already there.

Do not duplicate existing entries. Confirm cadence (default Monday 8:00am) and that they will appear in Cowork's Scheduled panel.
