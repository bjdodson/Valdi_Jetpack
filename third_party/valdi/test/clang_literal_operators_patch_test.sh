#!/usr/bin/env bash
set -euo pipefail

: "${TEST_SRCDIR:?TEST_SRCDIR is required}"
: "${TEST_WORKSPACE:?TEST_WORKSPACE is required}"

ROOT="$TEST_SRCDIR/$TEST_WORKSPACE"
PATCH="$ROOT/third_party/valdi/clang-literal-operators.patch"

for literal in '_pt' '_percent'; do
  grep -Fq "+inline YGValue operator\"\"$literal" "$PATCH"
done

if grep '^+.*operator"" _' "$PATCH"; then
  echo "Valdi patch must not add deprecated spaced literal operators" >&2
  exit 1
fi
