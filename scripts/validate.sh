#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." >/dev/null && pwd)"

usage() {
  echo "Usage: $0 [--quick|--macos-app]" >&2
}

MODE="${1:---quick}"
if [[ $# -gt 1 || ( "$MODE" != "--quick" && "$MODE" != "--macos-app" ) ]]; then
  usage
  exit 2
fi

BAZEL=(bazelisk)
if [[ -n "${VALDI_JETPACK_BAZEL_OUTPUT_ROOT:-}" ]]; then
  BAZEL+=("--output_user_root=$VALDI_JETPACK_BAZEL_OUTPUT_ROOT")
fi

cd "$ROOT_DIR"

"${BAZEL[@]}" query //...

"${BAZEL[@]}" test \
  //third_party/valdi:macos_scroll_direction_patch_test \
  //scripts:developer_workflows_test \
  //valdi_modules/compose_core:test \
  //valdi_modules/compose_core:compose_core_placeholder_test \
  //valdi_modules/compose_core:foundation_correctness_test \
  //valdi_modules/compose_core:controlled_controls_contract_test \
  //valdi_modules/compose_core:macos_directory_picker_contract_test \
  //valdi_modules/compose_core:macos_image_export_contract_test \
  --repo_env=VALDI_PLATFORM_DEPENDENCIES=macos

"${BAZEL[@]}" build \
  //valdi_modules/compose_core:compose_core \
  //apps/compose_playground:compose_playground \
  --repo_env=VALDI_PLATFORM_DEPENDENCIES=macos

if [[ "$MODE" == "--macos-app" ]]; then
  "${BAZEL[@]}" build //apps/compose_playground:app_macos \
    --snap_flavor=platform_development \
    --@valdi//bzl/valdi:assets_mode=inline \
    --repo_env=VALDI_PLATFORM_DEPENDENCIES=macos
fi
