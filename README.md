# Valdi Jetpack

Valdi Jetpack is a small playground that ships a handful of Compose-style primitives (`compose_core`) and a sample Valdi app (`compose_playground`) to exercise them. It targets the Valdi runtime (https://github.com/snapchat/valdi) and is meant to be a lightweight starting point for experimenting and iterating on Valdi UI patterns.

## Screenshot
<img src="docs/images/latest-screenshot.png" width="400" />

## Prerequisites
- macOS with Xcode command line tools for the macOS/iOS targets.
- Bazel (bazelisk recommended) and the Valdi toolchains fetched via the workspace `http_archive` rules.
- For Android: `ANDROID_NDK_HOME` and `ANDROID_HOME` set to your installed SDK/NDK paths.

## Getting started
1) Install dependencies and run the macOS playground:
```sh
bazel run //apps/compose_playground:app_macos \
  --snap_flavor=platform_development \
  --@valdi//bzl/valdi:assets_mode=inline \
  --repo_env=VALDI_PLATFORM_DEPENDENCIES=macos
# Equivalent: valdi install macos --application //apps/compose_playground:app_macos
```

2) Build just the Valdi module:
```sh
bazel build //valdi_modules/compose_core:compose_core
```

3) Run the Valdi-native module tests and structural smoke test:
```sh
bazel test \
  //valdi_modules/compose_core:test \
  //valdi_modules/compose_core:compose_core_placeholder_test \
  //valdi_modules/compose_core:foundation_correctness_test
```

## Project layout
- `apps/compose_playground/`: Valdi app entry with `root_component_path = ComposePlaygroundApp@compose_playground/src/ComposePlaygroundApp`.
- `valdi_modules/compose_core/`: Compose-like layout, text/image/card, controlled input, list, and fixed-height LazyGrid primitives.
- `scripts/`: helper scripts; `log_progress.sh` should be run after meaningful changes.
- `docs/`: parity matrix, notes, and progress log.

## Implementation notes
- `root_component_path` must use the `<Component>@<valdi_module>/src/...` format so the Valdi module loader resolves bundled assets (repository-relative paths will fail at runtime).
- When consuming `compose_core`, import from `compose_core/src/index` to match the generated `.valdimodule` contents.
- TypeScript is strict via `_configs/base.tsconfig.json`; keep exports surfaced through `src/index.ts` files.

## Troubleshooting
- Android builds will fail without a configured SDK/NDK (`ANDROID_NDK_HOME`, `ANDROID_HOME`).
- If Bazel reports permission issues in `/var/tmp/_bazel_*`, ensure your user owns that directory or set `--output_user_root` to a writable path.
- Runtime "No item named ..." errors usually mean the `root_component_path` or import path does not match the bundled module name; verify the two notes above.

## Contributing
- Follow the logging workflow in `AGENTS.md` (`scripts/log_progress.sh "note"` after meaningful work).
- Keep changes small and Bazel targets green; prefer `bazel run //apps/compose_playground:app_macos ...` for end-to-end validation when editing UI.
