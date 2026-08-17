# Controlled compose_core inputs

`compose_core` now includes controlled `Button`, `Slider`,
`SegmentedControl`, `Toggle`/`Switch`, `Select`, `TabBar`, and `TextField`
components. The caller owns each durable value and receives a change callback;
only `Select` menu visibility and `Slider` touch presentation are transient
component state.

The controls share `ComposeControlTheme`, a deliberately small semantic color
surface. `defaultComposeControlTheme` is neutral slate with a blue accent and
contains no product-specific palette. A consumer can supply a partial `theme`
to any control, then use focused color props or color objects for a one-off
override. `resolveComposeControlTheme` and the exported control helpers are
deterministic and do not mutate their inputs.

Runtime resolution ignores `undefined` values in partial theme and color
objects, so an optional override cannot erase a usable fallback. Slider touch
resolution preserves exact minimum and maximum endpoints even when `step` does
not evenly divide the range. TextField submission reports the current
caller-owned `value`, never a potentially stale native return-event payload.
Disabled Select triggers omit the generated activation hint instead of inviting
an action; an explicit caller-provided hint is still preserved.

## Accessibility and Valdi 0.1.1 limits

Controls expose the closest categories available in Valdi 0.1.1,
plus explicit selected/value/disabled state, accessibility labels, stable test
IDs, and matching touch guards. Segmented controls, tab bars, and select options
use supported radio semantics. Toggle uses checkbox semantics because the
runtime does not expose a separate switch category.

The pinned cross-platform surface does not currently provide generic key-down,
roving focus, focus restoration, or adjustable accessibility callbacks to
TypeScript components. As a result:

- Slider cannot yet implement portable arrow-key or accessibility-adjust actions.
- SegmentedControl and TabBar cannot implement portable roving arrow-key focus.
- Select cannot portably handle arrow keys, Escape, or restore trigger focus.
- TextField uses native editing/Return behavior but cannot request focus or the
  keyboard through a portable imperative API.

These behaviors are intentionally documented rather than approximated with
platform-specific branches. They can be added behind the same controlled APIs
when Valdi exposes a common focus and keyboard contract.

Behavioral helper coverage lives in `ControlledControls.spec.ts` and runs
through the generated `//valdi_modules/compose_core:test` Valdi/Jasmine target;
the shell tests remain focused on exports, IDs, accessibility declarations, and
other structural contracts.
