# Investair Claude marketplace

Public Claude plugin marketplace for Investair research skills. Add this repository in Claude, then install the `investair` plugin.

Skills use the hosted **Investair MCP**. This repo does not include data internals.

## Add in Claude

1. Open Claude → **Plugins / Marketplace** → **Add marketplace** → **Add from a repository**
2. Enter:
   ```text
   Investair-com-au/investair-claude-marketplace
   ```
3. Install plugin: **investair**
4. Sign in with Claude’s **OAuth / MCP connector** for Investair
5. Start a **new chat** and try: “Give me a snapshot of SKM” / “Run the raise radar”

## Contents

| Path | Purpose |
|------|---------|
| `.claude-plugin/marketplace.json` | Marketplace catalog |
| `plugins/investair/` | Investair plugin v0.18.12 (`channel: public`) |
| `CHANNEL.md` | What belongs on public vs private |

## Updates

Description and skill-list updates only. Users who added the marketplace can sync to get new plugin versions.

## Security

- No API keys in this repo — `.mcp.json` is URL-only; auth is OAuth via Claude
