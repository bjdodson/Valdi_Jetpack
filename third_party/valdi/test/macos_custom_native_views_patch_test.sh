#!/usr/bin/env bash
set -euo pipefail

: "${TEST_SRCDIR:?TEST_SRCDIR is required}"
: "${TEST_WORKSPACE:?TEST_WORKSPACE is required}"

ROOT="$TEST_SRCDIR/$TEST_WORKSPACE"
PATCH="$ROOT/third_party/valdi/macos-custom-native-views.patch"

grep -Fq '[requestedClass isSubclassOfClass:[NSView class]]' "$PATCH"
grep -Fq 'return Valdi::StringBox::emptyString();' "$PATCH"
