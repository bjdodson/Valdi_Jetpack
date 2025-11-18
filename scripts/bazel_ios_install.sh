#!/usr/bin/env bash

# This script builds //apps/compose_playground:app_ios using Bazel and then installs it
# on a currently-booted simulator

set -o errexit  # Exit on most errors (see the manual)
set -o nounset  # Disallow expansion of unset variables
set -o pipefail # Use last non-zero exit code in a pipeline
set -o xtrace   # Print commands as they are executed

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
ROOT_DIR="$SCRIPT_DIR/../"

pushd "$ROOT_DIR"
bazel build //apps/compose_playground:app_ios
TARGET_TEMP_DIR=`mktemp`
rm "$TARGET_TEMP_DIR"
mkdir "$TARGET_TEMP_DIR"
unzip "bazel-bin/apps/compose_playground/app_ios.ipa" -d "$TARGET_TEMP_DIR"
xcrun simctl install booted "$TARGET_TEMP_DIR/Payload/Compose Playground.app"
rm -r "$TARGET_TEMP_DIR"
popd
echo "Application installed on iOS Simulator"
