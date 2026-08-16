#!/usr/bin/env bash
set -euo pipefail

: "${TEST_SRCDIR:?TEST_SRCDIR is required}"
: "${TEST_WORKSPACE:?TEST_WORKSPACE is required}"

BASE="$TEST_SRCDIR/$TEST_WORKSPACE/valdi_modules/compose_core/src/layout"
FOUNDATION="$TEST_SRCDIR/$TEST_WORKSPACE/valdi_modules/compose_core/src/foundation"

check_file() {
  local file="$1"
  local symbol="$2"
  local native_node="$3"
  if [[ ! -f "$file" ]]; then
    echo "expected source file missing: $file" >&2
    exit 1
  fi
  if ! grep -q "class $symbol" "$file"; then
    echo "$symbol class declaration missing in $file" >&2
    exit 1
  fi
  if ! grep -q "<$native_node" "$file"; then
    echo "Expected <$symbol> to render a <$native_node> node in $file" >&2
    exit 1
  fi
}

check_file "$BASE/Row.tsx" "Row" "view"
check_file "$BASE/Column.tsx" "Column" "view"
check_file "$BASE/Box.tsx" "Box" "view"
check_file "$BASE/Spacer.tsx" "Spacer" "view"

check_native_control() {
  local file="$1"
  local symbol="$2"
  local native_node="$3"
  if [[ ! -f "$file" ]]; then
    echo "expected source file missing: $file" >&2
    exit 1
  fi
  if ! grep -Eq "class $symbol|export \{ Toggle as Switch \}" "$file"; then
    echo "$symbol declaration missing in $file" >&2
    exit 1
  fi
  if ! grep -q "<$native_node" "$file"; then
    echo "Expected $symbol to render a <$native_node> node in $file" >&2
    exit 1
  fi
}

check_native_control "$FOUNDATION/Button.tsx" "Button" "view"
check_native_control "$FOUNDATION/Slider.tsx" "Slider" "view"
check_native_control "$FOUNDATION/SegmentedControl.tsx" "SegmentedControl" "view"
check_native_control "$FOUNDATION/Toggle.tsx" "Toggle" "view"
check_native_control "$FOUNDATION/Select.tsx" "Select" "view"
check_native_control "$FOUNDATION/TabBar.tsx" "TabBar" "view"
check_native_control "$FOUNDATION/TextField.tsx" "TextField" "textfield"

check_file "$BASE/LazyGrid.tsx" "LazyGrid" "view"

if ! grep -q "function lazyGridLayout" "$BASE/LazyGrid.tsx"; then
  echo "lazyGridLayout helper declaration missing in $BASE/LazyGrid.tsx" >&2
  exit 1
fi
