#!/usr/bin/env bash
set -euo pipefail

: "${TEST_SRCDIR:?TEST_SRCDIR is required}"
: "${TEST_WORKSPACE:?TEST_WORKSPACE is required}"

BASE="$TEST_SRCDIR/$TEST_WORKSPACE/valdi_modules/compose_core/src/layout"

check_file() {
  local file="$1"
  local symbol="$2"
  if [[ ! -f "$file" ]]; then
    echo "expected source file missing: $file" >&2
    exit 1
  fi
  if ! grep -q "class $symbol" "$file"; then
    echo "$symbol class declaration missing in $file" >&2
    exit 1
  fi
  if ! grep -q "<layout" "$file"; then
    echo "Expected <$symbol> to render a layout node in $file" >&2
    exit 1
  fi
}

check_file "$BASE/Row.tsx" "Row"
check_file "$BASE/Column.tsx" "Column"
check_file "$BASE/Box.tsx" "Box"
check_file "$BASE/Spacer.tsx" "Spacer"
