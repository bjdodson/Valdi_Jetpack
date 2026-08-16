#!/usr/bin/env bash
set -euo pipefail

: "${TEST_SRCDIR:?TEST_SRCDIR is required}"
: "${TEST_WORKSPACE:?TEST_WORKSPACE is required}"

ROOT="$TEST_SRCDIR/$TEST_WORKSPACE/valdi_modules/compose_core/src"
TEXT="$ROOT/foundation/Text.tsx"
CARD="$ROOT/foundation/Card.tsx"
LAZY_LIST="$ROOT/layout/LazyList.tsx"
INDEX="$ROOT/index.ts"

for file in "$TEXT" "$CARD" "$LAZY_LIST" "$INDEX"; do
  if [[ ! -f "$file" ]]; then
    echo "expected source file missing: $file" >&2
    exit 1
  fi
done

for expected in "textLineHeightRatio" "lineHeight={resolvedLineHeight}"; do
  if ! grep -q "$expected" "$TEXT"; then
    echo "Text line-height contract missing: $expected" >&2
    exit 1
  fi
done
if ! grep -q "textLineHeightRatio" "$INDEX"; then
  echo "Text line-height helper is not exported from compose_core" >&2
  exit 1
fi

for expected in \
  "toStyle<View | Layout>" \
  "const interactive = Boolean(onTap || onTouch)" \
  "accessibilityCategory={interactive ? \"button\" : undefined}" \
  "accessibilityStateSelected={selected}" \
  "accessibilityStateDisabled={interactive ? disabled : undefined}" \
  "touchEnabled={interactive ? !disabled : undefined}" \
  "onTap={disabled ? undefined : onTap}" \
  "onTouch={disabled ? undefined : onTouch}"; do
  if ! grep -Fq "$expected" "$CARD"; then
    echo "Card interaction contract missing: $expected" >&2
    exit 1
  fi
done

for expected in "Partial<ScrollView & View & Layout>" "toStyle<ScrollView | View | Layout>" "style={resolvedStyle}"; do
  if ! grep -Fq "$expected" "$LAZY_LIST"; then
    echo "LazyList style interop contract missing: $expected" >&2
    exit 1
  fi
done
