#!/usr/bin/env bash
set -euo pipefail

: "${TEST_SRCDIR:?TEST_SRCDIR is required}"
: "${TEST_WORKSPACE:?TEST_WORKSPACE is required}"

ROOT="$TEST_SRCDIR/$TEST_WORKSPACE"
PATCH="$ROOT/third_party/valdi/macos-respect-scroll-direction.patch"

grep -Fq 'sourceEvent.scrollingDeltaY * additionalScrollingMultiplier' "$PATCH"
if grep '^+.*isDirectionInvertedFromDevice' "$PATCH"; then
  echo "Valdi patch must not undo AppKit's configured scroll direction" >&2
  exit 1
fi
