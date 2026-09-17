$ErrorActionPreference = "Stop"
if (-not (Get-Command uv -ErrorAction SilentlyContinue)) {
  throw "uv is not installed."
}
$server = (Resolve-Path (Join-Path $PSScriptRoot "server.py")).Path
uv run --with "mcp[cli]" mcp dev $server
