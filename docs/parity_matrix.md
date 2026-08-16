# Compose Parity Matrix

Source references: Jetpack Compose Material 3 catalog, https://developer.android.com/jetpack/compose/reference/latest.

| Component | Layer | Valdi touchpoint | Status | Notes |
| --- | --- | --- | --- | --- |
| Row / Column / Box | Foundation Layout | Valdi `<layout>` wrappers (flex row/column) | Alpha | Components implemented in compose_core; still need Modifier translation + theming hooks.
| Spacer | Foundation Layout | Valdi layout spacer with size/flex props | Alpha | Empty `<layout>` emitting optional width/height/flex sizing; hook Modifiers once available.
| LazyColumn / LazyRow | Foundation Lists | Valdi scroll + lazy child layouts | Alpha | Scroll wrappers defer native child layout and normalize both Valdi `Style` and plain-object style input; they are not recycling lists.
| Text | Foundation Text | Valdi `<label>` wrapper | Alpha | Point-based line height is converted to Valdi's font-size multiplier; richer `TextStyle` and typography tokens remain.
| Button | Material 3 | Build via `compose_foundation.Surface` + gestures | Planned | Need elevation + ripple tokens; tie to Valdi theming system.
| FilledTonalButton / OutlinedButton | Material 3 | Same as Button with variant tokens | Planned | Dependent on Button base + shape tokens.
| TextField (Filled/Outlined) | Material 3 | Valdi text input module | Blocked | Need Compose-like state holders and animated indicators; confirm focus APIs.
| Card / ElevatedCard | Material 3 | Valdi `<view>` surface + shadow tokens | Alpha | Plain-object style interop plus selected, disabled, button accessibility, and guarded tap semantics are implemented; ripple/theming remain.
| Scaffold | Material Structure | Compose-style slot management over Valdi layout tree | Planned | Requires slot DSL + `remember` support.
| NavigationBar / FAB | Material 3 | Compose foundation + gestures | Backlog | Lower MVP priority until core layouts verified.

Matrix owners: update status as Bazel targets land in `valdi_modules/compose_*`.
