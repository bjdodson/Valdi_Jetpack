#!/usr/bin/env bash
set -euo pipefail

: "${TEST_SRCDIR:?TEST_SRCDIR is required}"
: "${TEST_WORKSPACE:?TEST_WORKSPACE is required}"

ROOT="$TEST_SRCDIR/$TEST_WORKSPACE"
SCRIPTS="$ROOT/scripts"

for script in \
  bazel_android_install.sh \
  bazel_hotreload.sh \
  bazel_ios_install.sh \
  bazel_macos_run.sh \
  validate.sh; do
  bash -n "$SCRIPTS/$script"
done

grep -Fq '//apps/compose_playground:app_hotreload' "$SCRIPTS/bazel_hotreload.sh"
grep -Fq '//apps/compose_playground:app_macos' "$SCRIPTS/bazel_macos_run.sh"
grep -Fq -- '--@valdi//bzl/valdi:assets_mode=inline' "$SCRIPTS/bazel_macos_run.sh"
grep -Fq -- '--repo_env=VALDI_PLATFORM_DEPENDENCIES=macos' "$SCRIPTS/bazel_macos_run.sh"
grep -Fq -- '--copt=-DANDROID_WITH_JNI' "$SCRIPTS/bazel_android_install.sh"
grep -Fq -- '--repo_env=VALDI_PLATFORM_DEPENDENCIES=android' "$SCRIPTS/bazel_android_install.sh"
grep -Fq 'ro.product.cpu.abi' "$SCRIPTS/bazel_android_install.sh"
grep -Fq 'client_repo_arm64=true' "$SCRIPTS/bazel_android_install.sh"
grep -Fq 'client_repo_arm32=true' "$SCRIPTS/bazel_android_install.sh"
grep -Fq 'client_repo_x86_64=true' "$SCRIPTS/bazel_android_install.sh"
grep -Fq -- '--repo_env=VALDI_PLATFORM_DEPENDENCIES=ios' "$SCRIPTS/bazel_ios_install.sh"
grep -Fq '//valdi_modules/compose_core:test' "$SCRIPTS/validate.sh"

if grep -R -E '(^|[[:space:]])bazel build|playground_hotreload|app_macos_bin|`mktemp`' \
  "$SCRIPTS"/*.sh; then
  echo "Developer scripts contain a retired Bazel command, label, or output path" >&2
  exit 1
fi

TEST_COMMAND_LOG="$(mktemp "${TMPDIR:-/tmp}/valdi-jetpack-workflow-test.XXXXXX")"
trap 'rm -f "$TEST_COMMAND_LOG"' EXIT
export TEST_COMMAND_LOG

adb() {
  if [[ "$*" == "shell getprop ro.product.cpu.abi" ]]; then
    echo "$TEST_ANDROID_ABI"
  else
    printf 'adb' >>"$TEST_COMMAND_LOG"
    printf ' %q' "$@" >>"$TEST_COMMAND_LOG"
    printf '\n' >>"$TEST_COMMAND_LOG"
  fi
}

bazelisk() {
  printf 'bazelisk' >>"$TEST_COMMAND_LOG"
  printf ' %q' "$@" >>"$TEST_COMMAND_LOG"
  printf '\n' >>"$TEST_COMMAND_LOG"
}

export -f adb bazelisk

run_android_case() {
  local abi="$1"
  local expected_define="$2"
  local expected_cpu="$3"

  : >"$TEST_COMMAND_LOG"
  export TEST_ANDROID_ABI="$abi"
  bash "$SCRIPTS/bazel_android_install.sh"

  grep -Fq -- "--define $expected_define" "$TEST_COMMAND_LOG"
  grep -Fq -- "--fat_apk_cpu=$expected_cpu" "$TEST_COMMAND_LOG"
  grep -Fq -- "--android_cpu=$expected_cpu" "$TEST_COMMAND_LOG"
  grep -Fq 'adb install -r' "$TEST_COMMAND_LOG"
  grep -Fq 'adb shell am start -n com.snap.valdi.composeplayground/.StartActivity' "$TEST_COMMAND_LOG"
}

run_android_case arm64-v8a client_repo_arm64=true arm64-v8a
run_android_case armeabi-v7a client_repo_arm32=true armeabi-v7a
run_android_case x86_64 client_repo_x86_64=true x86_64
