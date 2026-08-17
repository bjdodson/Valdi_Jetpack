# Modernization status and backlog

## Review snapshot

As of 2026-08-16 (America/Los_Angeles), the repository targets the newest
published official Valdi release, `beta-0.1.1`, at immutable commit
`41d6d87643e0b9f9dcd8d7b7c162cf0ac7c969a2`. The bzlmod graph, representative
Valdi/TypeScript and structural tests, both modules, and the signed macOS
playground build pass. Android and iOS application analysis also passes with
the official platform flags.

The final review found no known P0 or P1 correctness, security, data-loss, or
build-blocking issue in the supported macOS/library surface. The items below
are intentionally lower priority and should be selected by an actual consumer
need rather than treated as unfinished hidden scope.

## P2 — schedule before the affected capability is relied upon

- Upstream or retire `macos-respect-scroll-direction.patch` when an equivalent
  official Valdi change is released; it is the sole remaining source patch.
- Run complete Android and iOS builds plus on-device/simulator interaction and
  accessibility checks. Their Bazel graphs pass analysis, but this audit did
  not claim runtime installation on those platforms.
- Add hosted CI and dependency caching when a runner/cost policy is chosen.
  `scripts/validate.sh` is the checked-in reproducible entry point for that
  future job.
- Add security-scoped directory bookmark persistence if a consumer must retain
  macOS folder access across launches; the current picker intentionally returns
  only the selected path for the active process.

## P3 — parity and test-depth improvements

- Add portable focus, keyboard, and adjustable-accessibility behavior when
  Valdi exposes a common event surface; current controls document their exact
  supported semantics.
- Extend `LazyGrid` only when required with measured/variable heights, spans,
  sticky content, or owned scrolling; its current fixed-height contract is
  bounded and tested.
- Expand Material catalog and typography/shape/motion tokens without coupling
  reusable components to a downstream product vocabulary.
- Replace more source-structure contracts with native UI, lifecycle, and visual
  tests as the open-source Valdi test harness gains those capabilities.
