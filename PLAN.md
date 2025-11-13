# Project Plan – Valdi Jetpack Component Library

## Objective
Build a Valdi module that mirrors Jetpack Compose primitives and Material components so Valdi app teams can share UI structure, theming, and samples across Android and iOS. The library should live in `valdi_modules/compose_*` and integrate with the upstream Valdi repo via Bazel.

## Non-goals
- Re-implementing the full Jetpack Compose runtime or Kotlin compiler plugin.
- Shipping direct-to-store demo apps; focus on reusable modules and playgrounds.
- Rewriting existing Valdi widgets unless parity gaps demand it.

## Key References
- `../Valdi`: canonical source of Valdi build rules, composer runtime, and shared deps.
- `../Valdi_Widgets`: working example of a Valdi widget workspace (`WORKSPACE`, `valdi_module` usage, scripts).
- Jetpack Compose (Android) Material 3 spec for feature parity and design tokens.

## Operational Guidelines – Durable Record
- Create `docs/progress_log.md` before touching code; every significant action by any coding agent must append a timestamped entry summarizing intent, commands executed, artifacts touched, blockers, and follow-ups.
- Store lightweight design sketches, parity matrices, and interim decisions under `docs/notes/YYYYMMDD_topic.md` so work can resume after interruptions.
- When scripts run long workflows (e.g., Bazel builds, test suites), pipe concise summaries into `docs/progress_log.md` and stash raw logs under `logs/date_target.log`.
- Agents should checkpoint open questions and next steps inside the log before ending a session, mirroring the “handoff memo” pattern discussed in `AGENTS.md`.
- Treat the durable record as a source artifact: review it during code reviews and ensure it lands in commits alongside the related code when appropriate.

## Work Breakdown

### Phase 0 – Research & Design Alignment
- Audit Jetpack Compose primitives (foundation + material) and tag features required for MVP.
- Inventory Valdi composer APIs we can wrap (layout nodes, state/effect helpers, navigation).
- Produce a dependency + parity matrix (component vs. Valdi capability) saved under `docs/`.
- Establish logging workflow: seed `docs/progress_log.md`, add `scripts/log_progress.sh` helper that timestamps entries, and document usage in `AGENTS.md`.
- Definition of done: prioritized backlog of components + gaps with owners.

### Phase 1 – Workspace & Build Scaffolding
- Copy/author `WORKSPACE`, `MODULE.bazel`, `.bazelrc`, and `scripts/` modeled after `../bak/Valdi_Widgets` but named `valdi_jetpack`.
- Initialize `valdi_modules/compose_core`, `compose_foundation`, `compose_material`, each with `BUILD.bazel`, `tsconfig.json`, `ids.yaml`, and placeholder `src/`.
- Wire `local_repository("@open_source")` to `../Valdi` and confirm `bazel query //...` works.
- Definition of done: `bazel build //valdi_modules/compose_core:compose_core` succeeds with placeholder code.

### Phase 2 – Compose Compatibility Layer
- Implement a TypeScript façade that mimics Compose functions (`@Composable`, `remember`, `LaunchedEffect`, slot APIs) backed by Valdi composer runtime.
- Provide lintable typing: align with Valdi `composer_core` and `composer_tsx`.
- Add unit tests using `@open_source//src/composer_modules/.../composer_test`.
- Definition of done: sample composable renders in a playground app and passes tests.

### Phase 3 – Foundation Layer
- Recreate layout primitives (Row, Column, Box, Spacer), text/typography, shapes, animations hook-ups.
- Define theming surface (`CompositionLocal` equivalent) with color/typography/shape tokens and persistence across platforms.
- Add shared resources under `res/` (fonts, icons) with Bazel globbing.
- Definition of done: layout showcase demonstrates responsive behavior on Android/iOS simulators.

### Phase 4 – Material Components
- Implement high-priority Material 3 components (Button variants, TextField, Card, Scaffold, AppBar, NavigationBar, FAB).
- Ensure components compose the foundation layer and expose slots similar to Jetpack Compose.
- Provide Valdi-friendly accessibility hooks (semantics props, talkback labels).
- Definition of done: component catalog renders parity samples versus Jetpack screenshots.

### Phase 5 – Samples, Tooling, and Playground
- Create `apps/compose_playground` Bazel target with navigation between demos (see `../bak/Valdi_Widgets/playground`).
- Add dev scripts for hot reload / platform install mirroring `scripts/bazel_*`.
- Document how to embed the library into downstream Valdi apps.
- Definition of done: `./scripts/bazel_macos_run.sh //apps/compose_playground:playground` launches the showcase.

### Phase 6 – Testing & CI
- Write snapshot/unit tests per component; integrate composer golden testing where possible.
- Configure Bazel test suites and optional visual diff workflows.
- Hook Bazel targets into existing CI (buildkite/GitHub Actions) with lint + test stages.
- Definition of done: `bazel test //...` green; CI pipeline documented; CI publishes `docs/progress_log.md` artifact for traceability.

### Phase 7 – Documentation & Adoption
- Author developer docs (usage guide, migration tips from Jetpack Compose).
- Expand `AGENTS.md` with task-specific instructions as the project evolves.
- Prepare release checklist (versioning, changelog, publishing to internal registry).
- Definition of done: docs reviewed, initial version tagged, downstream teams onboarded.

## Risks & Mitigations
- **Runtime gaps**: Some Compose APIs may not exist in Valdi. Mitigate by creating shims or scoping MVP surface.
- **Bazel complexity**: Keep build files minimal; reuse macros from `@open_source//bzl/valdi`.
- **Cross-platform parity**: Schedule regular iOS/Android validation sessions and track divergences.

## Immediate Next Steps
1. Validate local Bazel toolchain by mirroring `../bak/Valdi_Widgets/WORKSPACE`.
   - Copy `WORKSPACE`, `.bazelrc`, `MODULE.bazel`, and helper scripts from the widgets repo as a baseline, keeping names aligned to `valdi_jetpack`.
   - Replace explicit paths and repository names with the new module identifiers; document every deviation in `docs/progress_log.md` so future merges from upstream are traceable.
   - Run `bazel query //...` (expect many targets to be pending) to smoke-test that the workspace can enumerate packages without resolving deps yet.
2. Draft component parity matrix (Phase 0).
   - Survey Jetpack Compose foundation + Material 3 APIs and log each component/state primitive with columns for Valdi equivalent, implementation status, and notes.
   - Capture the matrix in `docs/parity_matrix.md`; reference specs/screenshots where parity decisions are non-trivial.
   - Flag gaps that block MVP so they can be prioritized for `compose_core` vs. `compose_material`.
3. Scaffold `valdi_modules/compose_core` with placeholder exports to unblock Bazel builds.
   - Create `BUILD.bazel`, `tsconfig.json`, `ids.yaml`, and a minimal `src/index.ts` that exports a stub `Composable` symbol to appease Bazel + TypeScript.
   - Ensure Bazel targets declare deps on Valdi composer packages even if implementations are TODOs; this keeps visibility + layering correct from day one.
   - Add a basic test target (can be a placeholder) so CI wiring in Phase 6 has something to latch onto early.
4. Create `docs/progress_log.md` and `scripts/log_progress.sh`; leave an initial entry outlining current assumptions and pending tasks.
   - Script should accept either stdin or argument text, prepend an ISO timestamp + agent name, and append to the log atomically.
   - Seed the log with today’s actions, open questions, and any blocking issues discovered while executing Steps 1–3.
   - Mention in the log where artifacts live (`docs/parity_matrix.md`, Bazel workspace copies, etc.) to satisfy the durable-record requirement.
