#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(".").resolve()

INCLUDE_EXTENSIONS = {
    ".html",
    ".css",
    ".js",
    ".mjs",
    ".ts",
    ".tsx",
    ".jsx",
    ".json",
    ".md",
}

# Add or remove patterns as needed.
IGNORE_DIRS = {
    ".git",
    ".github",
    "node_modules",
    "dist",
    "build",
    ".next",
    ".vite",
    "__pycache__",
    ".vscode",
    ".idea",
}

IGNORE_FILES = {
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "favicon.ico",
}

IGNORE_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".ico",
    ".pdf",
    ".zip",
    ".yaml",
    ".yml",
    ".csv",
    ".xlsx",
    ".docx",
    ".woff",
    ".woff2",
    ".ttf",
    ".otf",
}

def should_include(path: Path) -> bool:
    if any(part in IGNORE_DIRS for part in path.parts):
        return False

    if path.name in IGNORE_FILES:
        return False

    if path.suffix.lower() in IGNORE_EXTENSIONS:
        return False

    return path.suffix.lower() in INCLUDE_EXTENSIONS

def dump_file(path: Path) -> str:
    relative = path.relative_to(ROOT)

    try:
        content = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return ""

    return f"""\
================================================================================
FILE: {relative}
================================================================================

{content.rstrip()}

"""

def main() -> None:
    files = sorted(
        path for path in ROOT.rglob("*")
        if path.is_file() and should_include(path)
    )

    output = "\n".join(dump_file(path) for path in files)

    print(output)

if __name__ == "__main__":
    main()