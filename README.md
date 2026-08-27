# Investair Claude marketplace

Claude plugin marketplace for Investair research skills. Sync this repo in Claude via **Add marketplace → Add from a repository**, then install the `investair` plugin.

Skills call the hosted **Investair MCP** (`https://investair-mcp.fastmcp.app/mcp`). They do not embed SQL or peer logic — that lives on the MCP server.

## Add in Claude

1. Open Claude → **Plugins / Marketplace** → **Add marketplace** → **Add from a repository**
2. Enter:
   ```text
   Investair-com-au/investair-claude-marketplace
   ```
   (org marketplace; personal mirror: `Investair-com-au/investair-claude-marketplace`)
3. Install plugin: **investair** (from this marketplace)
4. Ensure MCP auth works:
   - Either connect Investair MCP in Claude’s connector UI, **or**
   - Set env `INVESTAIR_MCP_API_KEY` to your FastMCP/Horizon Bearer token (`fmcp_…`)
5. Start a **new chat** and try: “Give me a snapshot of SKM” / “Run the raise radar”

## Contents

| Path | Purpose |
|------|---------|
| `.claude-plugin/marketplace.json` | Marketplace catalog |
| `plugins/investair/` | Investair skills plugin v0.18.1 |

## Updates

Push changes to `main` on this repo. Users who added the marketplace can sync/update to get new plugin versions.

## Security

- No API keys in this repo — only `${INVESTAIR_MCP_API_KEY}` placeholder in `.mcp.json`
- MCP DB access remains read-only on the server
