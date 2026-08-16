#!/usr/bin/env bash
set -euo pipefail

: "${TEST_SRCDIR:?TEST_SRCDIR is required}"
: "${TEST_WORKSPACE:?TEST_WORKSPACE is required}"

ROOT="$TEST_SRCDIR/$TEST_WORKSPACE/valdi_modules/compose_core"
FOUNDATION="$ROOT/src/foundation"
INDEX="$ROOT/src/index.ts"
IDS="$ROOT/ids.yaml"
SPEC="$ROOT/test/ControlledControls.spec.ts"

fail() {
  echo "$1" >&2
  exit 1
}

assert_contains() {
  local file="$1"
  local pattern="$2"
  local description="$3"
  grep -Eq "$pattern" "$file" || fail "$description ($file)"
}

assert_contains "$FOUNDATION/ControlTheme.ts" 'defaultComposeControlTheme' 'default control theme missing'
assert_contains "$FOUNDATION/ControlTheme.ts" 'resolveComposeControlTheme' 'theme resolver missing'

for symbol in Button Slider SegmentedControl Toggle Select TabBar TextField; do
  file="$FOUNDATION/$symbol.tsx"
  [[ -f "$file" ]] || fail "$symbol source missing"
  assert_contains "$file" 'theme\?: Partial<ComposeControlTheme>' "$symbol theme override missing"
  assert_contains "$file" 'accessibilityStateDisabled' "$symbol disabled accessibility state missing"
  assert_contains "$INDEX" "export \{[[:space:][:print:]]*$symbol|  $symbol," "$symbol public export missing"
done

assert_contains "$FOUNDATION/SegmentedControl.tsx" 'accessibilityStateSelected' 'segmented selected state missing'
assert_contains "$FOUNDATION/Toggle.tsx" 'accessibilityStateSelected' 'toggle selected state missing'
assert_contains "$FOUNDATION/Select.tsx" 'accessibilityStateSelected' 'select selected state missing'
assert_contains "$FOUNDATION/TabBar.tsx" 'accessibilityStateSelected' 'tab selected state missing'
assert_contains "$FOUNDATION/TextField.tsx" 'value=\{value\}' 'text field is not controlled'
assert_contains "$FOUNDATION/Slider.tsx" 'value: number' 'slider controlled value missing'
assert_contains "$FOUNDATION/Toggle.tsx" 'export \{ Toggle as Switch \}' 'Switch alias missing'

assert_contains "$FOUNDATION/Slider.tsx" 'no portable keyboard-arrow' 'slider focus limitation missing'
assert_contains "$FOUNDATION/Select.tsx" 'generic key event or focus-management API' 'select focus limitation missing'
assert_contains "$FOUNDATION/TextField.tsx" 'portable imperative focus/request-keyboard API' 'text field focus limitation missing'
assert_contains "$FOUNDATION/ControlTheme.ts" 'mergeDefinedOverrides' 'defined-only override resolver missing'
assert_contains "$SPEC" "import 'jasmine/src/jasmine'" 'Jasmine runtime import missing'
assert_contains "$SPEC" "describe\('controlled control helpers'" 'behavioral control suite missing'

for id in \
  compose_core_button \
  compose_core_slider \
  compose_core_segmented_control \
  compose_core_toggle \
  compose_core_select \
  compose_core_select_menu \
  compose_core_tab_bar \
  compose_core_text_field; do
  assert_contains "$IDS" "^  $id:" "$id is missing from ids.yaml"
done
