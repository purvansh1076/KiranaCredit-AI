# KiranaCredit AI — Free-Agent Hackathon Pack

This pack is designed for a fast multi-agent build using:
- Google Antigravity as the primary builder
- OpenCode as the backend/data/debug specialist
- Claude Desktop as a reviewer/planner and optional local MCP client

## Important
The included Claude Desktop integration is a **local MCP server**. It does not give Claude Desktop paid Claude Code/Cowork features. It gives Claude Desktop local project tools through MCP.

The MCP server is intentionally conservative:
- project listing
- safe file reading
- project status
- financial-model inspection
- a curated prompt for reviewing the hackathon build

It does NOT execute arbitrary shell commands or modify/delete files.

## Quick setup (Windows)

1. Extract this folder somewhere permanent, e.g.
   `C:\Users\<YOU>\Documents\KiranaCredit-Agent-Pack`

2. Put/copy your actual KiranaCredit project path into the MCP server configuration by setting:
   `KIRANACREDIT_PROJECT_ROOT`

3. Install `uv` if you don't already have it.

4. Open PowerShell in `claude_desktop_mcp` and run:
   `.\install_claude.ps1 -ProjectRoot "C:\path\to\your\KiranaCredit"`

5. Restart Claude Desktop.

6. In Claude Desktop, use the connected MCP tools to inspect the project.

## Agent order tonight

1. Antigravity: architecture + core implementation
2. OpenCode: financial engine + data + debugging
3. Antigravity: UI polish + demo flow
4. Claude Desktop: judge review + final checklist

See the prompt files in:
- `antigravity/`
- `opencode/`
- `claude_desktop/`

## Safety
Do not put API keys in these files. Do not expose real customer/banking data. Use synthetic hackathon data.
