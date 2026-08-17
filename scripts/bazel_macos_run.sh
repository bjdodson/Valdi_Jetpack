#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." >/dev/null && pwd)"

cd "$ROOT_DIR"
exec bazelisk run //apps/compose_playground:app_macos \
  --snap_flavor=platform_development \
  --@valdi//bzl/valdi:assets_mode=inline \
  --repo_env=VALDI_PLATFORM_DEPENDENCIES=macos
