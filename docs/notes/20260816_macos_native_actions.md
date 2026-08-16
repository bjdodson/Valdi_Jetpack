# 2026-08-16 – Guarded macOS native actions

`compose_core` exposes two generic native actions on macOS:
`DirectoryPickerButton` for one local directory and `ImageExportActions` for
copying or saving a JPEG/PNG image. Their presentation uses neutral
`ComposeControlTheme` tokens and caller-owned copy. Product names, workflow
promises, and product-specific palettes do not belong in these primitives.

## Platform boundary

`NativeActionAvailability` requires the pinned runtime's truthful
`Device.isMacOS()` capability **and**, as defense in depth, the absence of
`window`/`document` web globals before either component emits an AppKit
`<custom-view>`. iOS, Android, non-Apple standalone hosts, and web report false,
render disabled explanatory fallbacks, and never resolve the native class.

The Objective-C libraries are selected only for the macOS target and use
`alwayslink` because Valdi resolves their `VJCompose…` classes by name. This
depends on the pinned Valdi custom-`NSView` resolver patch documented in
`20260816_pinned_valdi_macos.md`.

## Directory picker contract

- Selection is one existing local directory; files and multiple selection are
  disabled.
- Button label, panel title, prompt, message, unavailable copy, and directory
  creation policy are caller-controlled.
- `fallbackTheme` styles only the unavailable Valdi button; AppKit owns the
  native button and panel appearance.
- Cancellation emits no selection callback.
- Disabling or destroying the component dismisses an active panel. Every
  completion rechecks the current invocation and enabled state before callback.
- The callback supplies an ephemeral absolute path. Persisting a macOS
  security-scoped bookmark is outside this component's current contract.
- Manual path entry, validation, and durable storage remain caller concerns.

## Image export contract

- Sources must be `file:`, `http:`, or `https:` URLs. HTTP(S) is fetched only
  from caller-supplied URLs under the host app's ATS policy, using an ephemeral,
  cookie-free session. The bridge accepts only complete, single-frame JPEG or
  PNG sources recognized by ImageIO, caps input at 256 MiB while streaming, and
  rejects decoded dimensions above 100 megapixels before creating an `NSImage`.
- Copy uses the macOS pasteboard. Downloads writes bytes off the main thread to
  a hidden same-directory UUID temporary file, then publishes with an atomic
  no-replace hard link and retries name collisions. Save As likewise stages its
  potentially large write off-main and publishes only after the native panel
  authorizes the destination.
- JPEG/PNG file saves preserve the supplied bytes. The suggested extension is
  replaced by the detected format, and unsafe filename characters are reduced
  to a bounded ASCII filename.
- Request, source, and suggested filename cross the bridge in one versioned JSON
  command, avoiding Valdi custom-view attribute-order races. Command execution
  is deferred and generation-checked; clearing, replacing, disabling, or
  destroying the component cancels network work and open panels. Large staged
  writes can finish privately, but stale generations never publish them.
- Results contain operation, success/cancel/failure, a stable typed reason, and
  an English diagnostic message. Callers should present localized copy from the
  reason; bridge prose is diagnostic and may evolve. Results never expose a
  destination path, and stale completions are ignored.
- Disabling the component clears any transient open-menu/busy state, so
  re-enabling cannot silently reopen the prior action menu.

The first version intentionally omits TIFF, arbitrary files, multi-selection,
share/open-in actions, security-scoped bookmark persistence, and iOS/Android/web
native implementations. Its 100-megapixel decode ceiling is intentionally fixed
rather than caller-configurable in this alpha surface.

## Validation

Pure Jasmine specs cover copy/theme resolution, supported operations, outcome
normalization, and the desktop-web availability guard. Structural macOS tests
hold the native selection, source-validation, size/signature, atomic-write,
collision, panel fallback, and product-neutrality contracts. The playground
accepts a caller-entered image URL and suggested filename so it has no implicit
network dependency.
