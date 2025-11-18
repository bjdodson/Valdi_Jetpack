#!/usr/bin/env bash
# Append a timestamped entry to docs/progress_log.md.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null && pwd)"
ROOT_DIR="$SCRIPT_DIR/.."
LOG_FILE="$ROOT_DIR/docs/progress_log.md"

if [[ ! -f "$LOG_FILE" ]]; then
  echo "progress log not found at $LOG_FILE" >&2
  exit 1
fi

AGENT="${CODING_AGENT_NAME:-${AGENT_NAME:-Codex}}"
TIMESTAMP="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

if [[ $# -gt 0 ]]; then
  ENTRY="$*"
else
  ENTRY="$(cat)"
fi

if [[ -z "${ENTRY// }" ]]; then
  echo "Log entry is empty" >&2
  exit 1
fi

{
  printf '## %s – %s\n' "$TIMESTAMP" "$AGENT"
  while IFS= read -r line; do
    if [[ -z "$line" ]]; then
      printf '\n'
    else
      printf -- '- %s\n' "$line"
    fi
  done <<< "$ENTRY"
} >> "$LOG_FILE"
