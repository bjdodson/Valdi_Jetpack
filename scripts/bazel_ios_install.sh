#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." >/dev/null && pwd)"
IPA_PATH="$ROOT_DIR/bazel-bin/apps/compose_playground/app_ios.ipa"
TARGET_TEMP_DIR=""

cleanup() {
  if [[ -n "$TARGET_TEMP_DIR" && -d "$TARGET_TEMP_DIR" ]]; then
    rm -rf "$TARGET_TEMP_DIR"
  fi
}
trap cleanup EXIT

for tool in bazelisk unzip xcrun; do
  if ! command -v "$tool" >/dev/null; then
    echo "Required command not found: $tool" >&2
    exit 1
  fi
done

cd "$ROOT_DIR"
bazelisk build //apps/compose_playground:app_ios \
  --snap_flavor=platform_development \
  --repo_env=VALDI_PLATFORM_DEPENDENCIES=ios

TARGET_TEMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/valdi-jetpack-ios.XXXXXX")"
unzip -q "$IPA_PATH" -d "$TARGET_TEMP_DIR"
xcrun simctl install booted "$TARGET_TEMP_DIR/Payload/Compose Playground.app"
echo "Application installed on the booted iOS Simulator"
