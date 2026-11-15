#!/usr/bin/env python3
"""SessionStart hook: state the always-on Investair citation rule.

Prints a short standing instruction so every reply that uses Investair
data is cited, whether or not an Investair skill was invoked. The full
rule lives in the source-citations skill. Never blocks session start.
"""

RULE = """Investair standing rule — applies to every reply in this session that states a figure or fact obtained from the Investair connector, with or without an Investair skill:
- Put a Unicode superscript number (¹ ² ³) immediately after each such figure or fact.
- End the reply with a numbered "Sources — Investair" list, in order of first appearance. Each number resolves to one row: the announcement, capital-raise filing or substantial holder notice the fact came from, shown as ticker, date and title (holder name for a holder notice); or, where no filing was returned, the Investair dataset in plain words with its as-at date.
- Take dates and titles from the tool response. Never cite a source that was not returned in this session.
- Never print feed IDs, document IDs or other internal identifiers, or internal table, column or tool names.
- The only link you may construct is https://www.asx.com.au/markets/company/TICKER. Never invent a document link.
Follow the source-citations skill for the full format."""


def main() -> None:
    try:
        print(RULE)
    except Exception:  # noqa: BLE001 — never block session start
        return


if __name__ == "__main__":
    main()
