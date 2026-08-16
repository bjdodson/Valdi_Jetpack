#!/usr/bin/env bash
set -euo pipefail

: "${TEST_SRCDIR:?TEST_SRCDIR is required}"
: "${TEST_WORKSPACE:?TEST_WORKSPACE is required}"

ROOT="$TEST_SRCDIR/$TEST_WORKSPACE"
PATCH="$ROOT/third_party/valdi/clang-hermes-nontrivial-memcall.patch"

grep -Fq '+        "-Wno-nontrivial-memcall",' "$PATCH"
grep -Fq '+        "-Wno-unknown-warning-option",' "$PATCH"
grep -Fq 'a/valdi/BUILD.bazel' "$PATCH"
