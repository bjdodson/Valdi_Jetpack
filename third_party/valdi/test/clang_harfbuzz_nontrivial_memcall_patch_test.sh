#!/usr/bin/env bash
set -euo pipefail

: "${TEST_SRCDIR:?TEST_SRCDIR is required}"
: "${TEST_WORKSPACE:?TEST_WORKSPACE is required}"

ROOT="$TEST_SRCDIR/$TEST_WORKSPACE"
PATCH="$ROOT/third_party/valdi/clang-harfbuzz-nontrivial-memcall.patch"

grep -Fq '+    "-Wno-nontrivial-memcall",' "$PATCH"
grep -Fq '+    "-Wno-unknown-warning-option",' "$PATCH"
grep -Fq 'third-party/harfbuzz/harfbuzz.BUILD' "$PATCH"
