# Compose Parity Matrix

Source references: Jetpack Compose Material 3 catalog, https://developer.android.com/jetpack/compose/reference/latest.

| Component | Layer | Valdi touchpoint | Status | Notes |
| --- | --- | --- | --- | --- |
| Row / Column / Box | Foundation Layout | Valdi `<layout>` wrappers (flex row/column) | Alpha | Components implemented in compose_core; still need Modifier translation + theming hooks.
| Spacer | Foundation Layout | Valdi layout spacer with size/flex props | Alpha | Empty `<layout>` emitting optional width/height/flex sizing; hook Modifiers once available.
| LazyColumn / LazyRow | Foundation Lists | Valdi recycler (`@open_source//src/composer_modules/lists`) | Blocked | Need virtualization hooks + slot APIs; confirm Valdi supports data-driven item keys.
| Text | Foundation Text | `@open_source//src/composer_modules/text` | Planned | Map Compose `TextStyle` to Valdi typography tokens; fonts to ship under `res/fonts`.
| Button | Material 3 | Build via `compose_foundation.Surface` + gestures | Planned | Need elevation + ripple tokens; tie to Valdi theming system.
| FilledTonalButton / OutlinedButton | Material 3 | Same as Button with variant tokens | Planned | Dependent on Button base + shape tokens.
| TextField (Filled/Outlined) | Material 3 | Valdi text input module | Blocked | Need Compose-like state holders and animated indicators; confirm focus APIs.
| Card / ElevatedCard | Material 3 | Foundation Surface + shadow tokens | Planned | Shims for `onClick` semantics + shape.
| Scaffold | Material Structure | Compose-style slot management over Valdi layout tree | Planned | Requires slot DSL + `remember` support.
| NavigationBar / FAB | Material 3 | Compose foundation + gestures | Backlog | Lower MVP priority until core layouts verified.

Matrix owners: update status as Bazel targets land in `valdi_modules/compose_*`.
