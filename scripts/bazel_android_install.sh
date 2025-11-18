#!/usr/bin/env bash

set -euo pipefail
set -x

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null && pwd)"
ROOT_DIR="$SCRIPT_DIR/../"

START_ACTIVITY="com.snap.valdi.composeplayground/.StartActivity"

pushd "$ROOT_DIR"
bazel build "//apps/compose_playground:app_android"
adb install -r "bazel-bin/apps/compose_playground/app_android.apk"
adb shell am start -n $START_ACTIVITY

popd
