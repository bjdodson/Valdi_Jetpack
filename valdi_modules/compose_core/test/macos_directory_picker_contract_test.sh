#!/usr/bin/env bash
set -euo pipefail

: "${TEST_SRCDIR:?TEST_SRCDIR is required}"
: "${TEST_WORKSPACE:?TEST_WORKSPACE is required}"

ROOT="$TEST_SRCDIR/$TEST_WORKSPACE"
NATIVE="$ROOT/valdi_modules/compose_core/macos/VJComposeDirectoryPickerButton.m"
PRESENTATION="$ROOT/valdi_modules/compose_core/src/foundation/DirectoryPickerButton.tsx"
AVAILABILITY="$ROOT/valdi_modules/compose_core/src/foundation/NativeActionAvailability.ts"

require_source() {
  local pattern="$1"
  local file="$2"
  local message="$3"
  if ! grep -Fq "$pattern" "$file"; then
    echo "$message" >&2
    exit 1
  fi
}

require_source "@interface VJComposeDirectoryPickerButton : NSButton" "$NATIVE" "picker must use its namespaced AppKit class"
require_source "NSOpenPanel" "$NATIVE" "picker must use the native macOS open panel"
require_source 'bindUntypedAttribute:@"panelTitle"' "$NATIVE" "panel title must be caller-configurable"
require_source 'bindUntypedAttribute:@"panelPrompt"' "$NATIVE" "panel prompt must be caller-configurable"
require_source 'bindUntypedAttribute:@"panelMessage"' "$NATIVE" "panel message must be caller-configurable"
require_source 'bindUntypedAttribute:@"canCreateDirectories"' "$NATIVE" "directory creation policy must be caller-configurable"
require_source "panel.canChooseDirectories = YES" "$NATIVE" "picker must select directories"
require_source "panel.canChooseFiles = NO" "$NATIVE" "picker must reject files"
require_source "panel.allowsMultipleSelection = NO" "$NATIVE" "picker must return one directory"
require_source "result == NSModalResponseOK" "$NATIVE" "picker must dispatch only confirmed selection"
require_source "selectedURL.isFileURL" "$NATIVE" "picker must return a local file URL path"
require_source "_invocationSequence" "$NATIVE" "picker completions must carry a current invocation token"
require_source "strongSelf.enabled" "$NATIVE" "picker completion must recheck the enabled state"
require_source "_panel == panel" "$NATIVE" "picker completion must reject a replaced panel"
require_source "[panel cancel:nil]" "$NATIVE" "disabling the picker must dismiss its active panel"
require_source "macOSNativeActionAvailable()" "$PRESENTATION" "picker must use the shared platform guard"
require_source "Device.isMacOS()" "$AVAILABILITY" "picker availability must use the truthful native macOS capability"
require_source 'typeof window !== "undefined"' "$AVAILABILITY" "desktop web must be excluded from native availability"
require_source 'typeof document !== "undefined"' "$AVAILABILITY" "document-backed web runtimes must be excluded"
require_source 'iosClass="VJComposeDirectoryPickerButton"' "$PRESENTATION" "presentation must request the namespaced native class"
require_source "unavailableLabel" "$PRESENTATION" "picker must expose an unavailable fallback"

if grep -Eiq 'astro|capture|workspace|artifact' "$NATIVE" "$PRESENTATION"; then
  echo "directory picker defaults must remain product-neutral" >&2
  exit 1
fi
