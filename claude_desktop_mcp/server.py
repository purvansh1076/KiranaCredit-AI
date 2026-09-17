from pathlib import Path
import os
import json
from mcp.server import MCPServer

PROJECT_ROOT = Path(
    os.environ.get("KIRANACREDIT_PROJECT_ROOT", Path.cwd())
).expanduser().resolve()

mcp = MCPServer("KiranaCredit Local Project Tools")

IGNORE_DIRS = {
    ".git", "node_modules", ".venv", "venv", "__pycache__",
    ".next", "dist", "build", ".cache"
}

def safe_path(relative_path: str) -> Path:
    candidate = (PROJECT_ROOT / relative_path).resolve()
    if candidate != PROJECT_ROOT and PROJECT_ROOT not in candidate.parents:
        raise ValueError("Path escapes the configured project root.")
    return candidate

@mcp.tool()
def project_status() -> str:
    """Return basic project path and top-level files."""
    items = []
    for p in sorted(PROJECT_ROOT.iterdir()):
        if p.name not in IGNORE_DIRS:
            items.append(("DIR " if p.is_dir() else "FILE") + " " + p.name)
    return json.dumps({
        "project_root": str(PROJECT_ROOT),
        "items": items[:100]
    }, indent=2)

@mcp.tool()
def list_project_files(max_files: int = 250) -> str:
    """List source/config files in the project, excluding dependency/build folders."""
    results = []
    for p in PROJECT_ROOT.rglob("*"):
        if any(part in IGNORE_DIRS for part in p.parts):
            continue
        if p.is_file():
            results.append(str(p.relative_to(PROJECT_ROOT)))
            if len(results) >= max_files:
                break
    return "\n".join(results)

@mcp.tool()
def read_project_file(relative_path: str, max_chars: int = 20000) -> str:
    """Read a UTF-8 text file inside the configured project root."""
    p = safe_path(relative_path)
    if not p.is_file():
        raise ValueError("File not found.")
    if p.stat().st_size > max_chars * 4:
        raise ValueError("File is too large. Use a more focused file.")
    return p.read_text(encoding="utf-8", errors="replace")[:max_chars]

@mcp.tool()
def find_in_project(term: str, max_hits: int = 50) -> str:
    """Find a text term in source/config files without reading dependency/build folders."""
    hits = []
    for p in PROJECT_ROOT.rglob("*"):
        if len(hits) >= max_hits:
            break
        if not p.is_file() or any(part in IGNORE_DIRS for part in p.parts):
            continue
        if p.suffix.lower() not in {
            ".py", ".ts", ".tsx", ".js", ".jsx", ".json", ".md",
            ".css", ".html", ".sql", ".yaml", ".yml", ".toml", ".csv"
        }:
            continue
        try:
            text = p.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        if term.lower() in text.lower():
            hits.append(str(p.relative_to(PROJECT_ROOT)))
    return "\n".join(hits)

@mcp.prompt()
def hackathon_judge_review() -> str:
    """Start a concise KiranaCredit AI judge review using the local project tools."""
    return """Review this KiranaCredit AI repository as a fintech hackathon judge.

Use the local project tools first. Do not modify files.

Check:
- end-to-end demo flow
- dynamic financial calculations
- explainability
- credit recommendation
- loan simulator
- credit builder
- synthetic data realism
- anomaly detection
- data confidence
- consent/privacy
- misleading claims
- build/runtime risks

Return the 5 highest-impact issues and 3 quick fixes. Do not recommend large new features tonight."""

if __name__ == "__main__":
    mcp.run()
