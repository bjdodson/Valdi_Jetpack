# Compose Parity Matrix

Source references: Jetpack Compose Material 3 catalog, https://developer.android.com/jetpack/compose/reference/latest.

| Component | Layer | Valdi touchpoint | Status | Notes |
| --- | --- | --- | --- | --- |
| Row / Column / Box | Foundation Layout | Valdi `<layout>` wrappers (flex row/column) | Alpha | Components implemented in compose_core; still need Modifier translation + theming hooks.
| Spacer | Foundation Layout | Valdi layout spacer with size/flex props | Alpha | Empty `<layout>` emitting optional width/height/flex sizing; hook Modifiers once available.
| LazyColumn / LazyRow | Foundation Lists | Valdi scroll + lazy child layouts | Alpha | Scroll wrappers defer native child layout and normalize both Valdi `Style` and plain-object style input; they are not recycling lists.
| LazyGrid | Foundation Grids | Parent viewport events + absolutely positioned lazy layouts | Alpha | Adaptive fixed-height columns use bounded native windowing, explicit full materialization for accessibility, and a correctness-first full Web fallback. No variable-height items, spans, sticky content, or owned scrolling yet.
| Text | Foundation Text | Valdi `<label>` wrapper | Alpha | Point-based line height is converted to Valdi's font-size multiplier; richer `TextStyle` and typography tokens remain.
| Button | Material 3 | Controlled Valdi `<view>` action | Alpha | Primary, secondary, danger, disabled, semantic color tokens, and per-instance overrides; ripple remains runtime-dependent.
| Slider / SegmentedControl / Toggle | Foundation Inputs | Valdi touch/layout primitives | Alpha | Controlled values, deterministic helpers, and explicit selected/disabled semantics; portable keyboard/focus events are not exposed by Valdi 0.1.1.
| Select / TabBar | Foundation Selection | Controlled Valdi view compositions | Alpha | Selection is caller-owned; Select owns only transient menu visibility. Arrow-key, Escape, focus restoration, and tab focus traversal await a portable Valdi key/focus surface.
| FilledTonalButton / OutlinedButton | Material 3 | Button tones and color overrides | Alpha | `secondary` provides the current outlined contract; richer Material animation/elevation tokens remain future work.
| TextField (Filled/Outlined) | Material 3 | Controlled native Valdi `<textfield>` | Alpha | Value/submit/disabled semantics implemented. Native input owns its keyboard session; imperative focus and generic key-down remain unavailable portably.
| Directory picker | Platform action | Guarded AppKit `NSOpenPanel` custom view | Alpha (macOS) | Single-directory selection with caller-owned panel copy, cancellation-safe invocation tokens, and an explicit unavailable state on iOS, Android, and desktop web. Security-scoped bookmark persistence is not implemented.
| Image export | Platform action | Guarded AppKit pasteboard, Downloads, and `NSSavePanel` bridge | Alpha (macOS) | JPEG/PNG copy and staged byte-preserving saves with bounded streaming, byte/pixel caps, atomic no-overwrite Downloads publication, and stable result reasons. No TIFF, share sheet, or non-macOS implementation.
| Card / ElevatedCard | Material 3 | Valdi `<view>` surface + shadow tokens | Alpha | Plain-object style interop plus selected, disabled, button accessibility, and guarded tap/touch semantics are implemented; ripple/theming remain.
| Scaffold | Material Structure | Compose-style slot management over Valdi layout tree | Planned | Requires a class-owned slot/state design consistent with Valdi's `StatefulComponent` lifecycle.
| NavigationBar / FAB | Material 3 | Compose foundation + gestures | Backlog | Lower MVP priority until core layouts verified.

Matrix owners: update status as Bazel targets land in `valdi_modules/compose_*`.
