# Investair Claude marketplace (public)

**Channel: `public`.** This repo is description-only: plugin/skill names, short descriptions, the MCP connector URL, and user-facing update notes. SQL, table names, and other data internals stay in the private plugin (`TerryTian-Investair/investair-claude-plugin`). See [CHANNEL.md](./CHANNEL.md).

Claude plugin marketplace for Investair research skills. Sync this repo in Claude via **Add marketplace → Add from a repository**, then install the `investair` plugin.

Skills call the hosted **Investair MCP** (`https://mcp.investair.com.au/mcp/prefect-v1`). They do not embed SQL or peer logic — that lives on the MCP server.

## Add in Claude

1. Open Claude → **Plugins / Marketplace** → **Add marketplace** → **Add from a repository**
2. Enter:
   ```text
   Investair-com-au/investair-claude-marketplace
   ```
   (org marketplace; personal mirror: `Investair-com-au/investair-claude-marketplace`)
3. Install plugin: **investair** (from this marketplace)
4. Authenticate via Claude’s **OAuth / MCP connector** for Investair MCP
   (plugin `.mcp.json` has no Bearer key — do not set `INVESTAIR_MCP_API_KEY`)
5. Start a **new chat** and try: “Give me a snapshot of SKM” / “Run the raise radar”

## Contents

| Path | Purpose |
|------|---------|
| `.claude-plugin/marketplace.json` | Marketplace catalog |
| `plugins/investair/` | Investair skills plugin v0.18.11 (`channel: public`) |
| `CHANNEL.md` | Public vs private versions and labels |

## Updates

Do not land SQL, table names, or schema here. Push description-only changes to `main`. Users who added the marketplace can sync/update to get new plugin versions. See [CHANNEL.md](./CHANNEL.md).

## Security

- No API keys in this repo — `.mcp.json` is URL-only; auth is OAuth via Claude
- MCP DB access remains read-only on the server
