#!/usr/bin/env bash
set -euo pipefail

: "${TEST_SRCDIR:?TEST_SRCDIR is required}"
: "${TEST_WORKSPACE:?TEST_WORKSPACE is required}"

ROOT="$TEST_SRCDIR/$TEST_WORKSPACE"
PATCH="$ROOT/third_party/valdi/device-macos-capability.patch"

require_patch_text() {
  local text="$1"
  local message="$2"
  if ! grep -Fq "$text" "$PATCH"; then
    echo "$message" >&2
    exit 1
  fi
}

require_patch_text "export function isMacOS(): boolean;" "DeviceBridge declaration must expose isMacOS"
require_patch_text "export function isMacOS(): boolean {" "Device namespace/web bridge must expose isMacOS"
require_patch_text "const cacheIsMacOS" "Device namespace must cache the native capability"
require_patch_text '"isMacOS" to makeBridgeMethod(this::isMacOS)' "Android bridge must publish false"
require_patch_text '@"isMacOS" : BRIDGE_METHOD(isMacOS)' "iOS bridge must publish false"
require_patch_text "BIND_METHOD(module, isMacOS)" "standalone bridge must publish the capability"
require_patch_text "#if defined(__APPLE__)" "standalone capability must distinguish Apple desktop hosts"
require_patch_text "return false;" "web and non-Apple desktop bridges must publish false"

for path in \
  src/valdi_modules/src/valdi/valdi_core/src/DeviceBridge.d.ts \
  src/valdi_modules/src/valdi/valdi_core/src/Device.ts \
  src/valdi_modules/src/valdi/valdi_core/web/DeviceBridge.ts \
  valdi/src/java/com/snap/valdi/modules/ValdiDeviceModule.kt \
  valdi/src/valdi/ios/NativeModules/SCValdiDeviceModule.m \
  valdi/src/valdi/standalone_runtime/BridgeModules/DeviceModule.hpp \
  valdi/src/valdi/standalone_runtime/BridgeModules/DeviceModule.cpp; do
  require_patch_text "diff --git a/$path b/$path" "missing patched bridge file: $path"
done
