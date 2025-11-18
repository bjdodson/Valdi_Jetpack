# Valdi Jetpack – Agent Guide

Purpose: lightweight playground for Valdi UI (see https://github.com/snapchat/valdi) plus local `compose_core` primitives that mirror Compose-like layout components.

## Repo map
- `apps/compose_playground`: Valdi application wiring the playground root component (`ComposePlaygroundApp@compose_playground/src/ComposePlaygroundApp`).
- `valdi_modules/compose_core`: Compose-style primitives (Row, Column, Box, Spacer, Text, Image, Card, Lazy lists).
- `scripts/`: helpers; use `log_progress.sh` for durable notes.
- `docs/`: parity notes and project progress; `logs/` for appended run artifacts.

## Build and run
- Mac app: `bazel run //apps/compose_playground:app_macos --snap_flavor=platform_development --@valdi//bzl/valdi:assets_mode=inline --repo_env=VALDI_PLATFORM_DEPENDENCIES=macos` (equivalent to `valdi install macos --application //apps/compose_playground:app_macos`).
- Android/iOS targets exist but may need local toolchains (Xcode, Android NDK/SDK). Set `ANDROID_NDK_HOME` when running Android targets.
- Module loader expects `root_component_path` in the form `<Component>@<valdi_module>/src/...`; avoid repository-relative prefixes (a prior issue).
- Import compose primitives via `compose_core/src/index` (not `compose_core/src`), matching the generated `.valdimodule` contents.

## Validation and tests
- Lightweight placeholder test lives at `//valdi_modules/compose_core:compose_core_placeholder_test` (sh_test). Expand with TS/XUnit-style tests as Valdi runner support grows.
- Keep TypeScript strict (`noImplicitAny/Returns`); prefer TS paths as configured in `_configs/base.tsconfig.json`.

## Durable logging workflow
- Always run `scripts/log_progress.sh "short description"` (or pipe multi-line notes) after meaningful work.
- The script writes ISO-8601 timestamps and resolves the agent name from `CODING_AGENT_NAME` (fallbacks to `AGENT_NAME`, then `Codex`).
- Keep entries action-oriented: mention touched files, commands, blockers, and next steps; attach long logs under `logs/` and reference them in the note.
- If the log script is unavailable (e.g., bootstrap), create the entry manually and immediately fix the script before proceeding.
