#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." >/dev/null && pwd)"

START_ACTIVITY="com.snap.valdi.composeplayground/.StartActivity"
APK_PATH="$ROOT_DIR/bazel-bin/apps/compose_playground/app_android.apk"

for tool in bazelisk adb; do
  if ! command -v "$tool" >/dev/null; then
    echo "Required command not found: $tool" >&2
    exit 1
  fi
done

ANDROID_ABI="$(adb shell getprop ro.product.cpu.abi | tr -d '\r')"
case "$ANDROID_ABI" in
  arm64-v8a)
    ARCHITECTURE_FLAGS=(--define client_repo_arm64=true --fat_apk_cpu=arm64-v8a --android_cpu=arm64-v8a)
    ;;
  armeabi | armeabi-v7a)
    ARCHITECTURE_FLAGS=(--define client_repo_arm32=true --fat_apk_cpu=armeabi-v7a --android_cpu=armeabi-v7a)
    ;;
  x86_64)
    ARCHITECTURE_FLAGS=(--define client_repo_x86_64=true --fat_apk_cpu=x86_64 --android_cpu=x86_64)
    ;;
  *)
    echo "Unsupported Android device ABI: ${ANDROID_ABI:-unknown}" >&2
    exit 1
    ;;
esac

cd "$ROOT_DIR"
bazelisk build //apps/compose_playground:app_android \
  --snap_flavor=platform_development \
  --copt=-DANDROID_WITH_JNI \
  --repo_env=VALDI_PLATFORM_DEPENDENCIES=android \
  "${ARCHITECTURE_FLAGS[@]}"

adb install -r "$APK_PATH"
adb shell am start -n "$START_ACTIVITY"
