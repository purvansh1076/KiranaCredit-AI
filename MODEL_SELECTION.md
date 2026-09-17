# Model selection for this sprint

## Antigravity
Use:
1. Gemini 3.1 Pro — architecture, difficult debugging, financial logic review
2. Gemini Flash — repetitive implementation, UI tweaks, quick fixes
3. Claude Sonnet 4.6 Thinking — alternative strong reasoning pass if your Antigravity account exposes it

Do not burn the strongest model on simple CSS changes.

## OpenCode
Run `/models` to see the models actually available to your provider/project. Do not assume a model ID is enabled. OpenCode's current docs say model availability is project/provider-specific.

Suggested division:
- primary/build agent: strongest free/available model
- reviewer subagent: a lighter model
- backend specialist: strongest available model for the financial logic

## Claude Desktop
Use the desktop app mainly as:
- repository reviewer through MCP
- architecture critic
- demo-script writer
- final judge

Do not depend on Claude Desktop Free for autonomous repository editing. Current Anthropic documentation lists Claude Code/Cowork as paid-plan features, while local MCP servers can be connected to Claude Desktop.
