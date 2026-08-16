# Compose Parity Matrix

Source references: Jetpack Compose Material 3 catalog, https://developer.android.com/jetpack/compose/reference/latest.

| Component | Layer | Valdi touchpoint | Status | Notes |
| --- | --- | --- | --- | --- |
| Row / Column / Box | Foundation Layout | Valdi `<layout>` wrappers (flex row/column) | Alpha | Components implemented in compose_core; still need Modifier translation + theming hooks.
| Spacer | Foundation Layout | Valdi layout spacer with size/flex props | Alpha | Empty `<layout>` emitting optional width/height/flex sizing; hook Modifiers once available.
| LazyColumn / LazyRow | Foundation Lists | Valdi scroll + lazy child layouts | Alpha | Scroll wrappers defer native child layout and normalize both Valdi `Style` and plain-object style input; they are not recycling lists.
| Text | Foundation Text | Valdi `<label>` wrapper | Alpha | Point-based line height is converted to Valdi's font-size multiplier; richer `TextStyle` and typography tokens remain.
| Button | Material 3 | Controlled Valdi `<view>` action | Alpha | Primary, secondary, danger, disabled, semantic color tokens, and per-instance overrides; ripple remains runtime-dependent.
| Slider / SegmentedControl / Toggle | Foundation Inputs | Valdi touch/layout primitives | Alpha | Controlled values, deterministic helpers, and explicit selected/disabled semantics; portable keyboard/focus events are not exposed by the pinned Valdi runtime.
| Select / TabBar | Foundation Selection | Controlled Valdi view compositions | Alpha | Selection is caller-owned; Select owns only transient menu visibility. Arrow-key, Escape, focus restoration, and tab focus traversal await a portable Valdi key/focus surface.
| FilledTonalButton / OutlinedButton | Material 3 | Button tones and color overrides | Alpha | `secondary` provides the current outlined contract; richer Material animation/elevation tokens remain future work.
| TextField (Filled/Outlined) | Material 3 | Controlled native Valdi `<textfield>` | Alpha | Value/submit/disabled semantics implemented. Native input owns its keyboard session; imperative focus and generic key-down remain unavailable portably.
| Card / ElevatedCard | Material 3 | Valdi `<view>` surface + shadow tokens | Alpha | Plain-object style interop plus selected, disabled, button accessibility, and guarded tap/touch semantics are implemented; ripple/theming remain.
| Scaffold | Material Structure | Compose-style slot management over Valdi layout tree | Planned | Requires slot DSL + `remember` support.
| NavigationBar / FAB | Material 3 | Compose foundation + gestures | Backlog | Lower MVP priority until core layouts verified.

Matrix owners: update status as Bazel targets land in `valdi_modules/compose_*`.
