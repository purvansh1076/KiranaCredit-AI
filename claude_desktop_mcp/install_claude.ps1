param(
  [Parameter(Mandatory=$true)]
  [string]$ProjectRoot
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command uv -ErrorAction SilentlyContinue)) {
  Write-Host "uv is required. Install it first, then rerun this script."
  Write-Host "Official installer: https://docs.astral.sh/uv/"
  exit 1
}

$server = (Resolve-Path (Join-Path $PSScriptRoot "server.py")).Path
$project = (Resolve-Path $ProjectRoot).Path

Write-Host "Registering KiranaCredit MCP server with Claude Desktop..."
uv run --with "mcp[cli]" mcp install $server

Write-Host ""
Write-Host "IMPORTANT: The generated Claude Desktop config must contain:"
Write-Host "KIRANACREDIT_PROJECT_ROOT = $project"
Write-Host ""
Write-Host "If mcp install did not add the environment variable, open the Claude Desktop"
Write-Host "config and add it manually using claude_desktop_config.template.json."
Write-Host ""
Write-Host "Restart Claude Desktop after configuration."
