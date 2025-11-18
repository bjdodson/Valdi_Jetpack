#!/usr/bin/env bash

set -euo pipefail
set -x

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null && pwd)"

ROOT_DIR="$SCRIPT_DIR/../"

pushd "$ROOT_DIR"

bazel build //apps/compose_playground:playground_hotreload
./bazel-bin/apps/compose_playground/run_hotreloader.sh

popd
