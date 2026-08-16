# Pinned Valdi macOS compatibility

Valdi Jetpack intentionally remains pinned to Valdi `beta-0.0.1`. The workspace
therefore applies a small, reviewable patch set at dependency extraction time:

- modern Clang compatibility for Yoga literal operators and the pinned
  Harfbuzz/Hermes warning policy;
- native macOS scroll direction, preserving AppKit's already-adjusted wheel
  deltas;
- custom macOS view resolution restricted to `NSView` subclasses, enabling
  Jetpack-owned native controls while retaining the unknown-class fallback.
- a truthful `Device.isMacOS()` capability across Valdi's TypeScript, web,
  Android, iOS, and standalone bridges. Native macOS standalone returns true;
  browser, mobile, Windows, and Linux hosts return false.

Each patch has a focused structural Bazel test under `third_party/valdi`. These
patches should be removed independently when a future Valdi revision contains
the equivalent behavior.
