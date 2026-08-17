# Historical: pinned Valdi macOS compatibility

This note records the patch set that was necessary while Valdi Jetpack used
Valdi `beta-0.0.1`. It was superseded by the `beta-0.1.1` bzlmod migration
documented in `20260816_valdi_0_1_1_migration.md`.

The Yoga and Hermes fixes and generic macOS custom-view resolution are present
upstream in `beta-0.1.1`. The upgraded Harfbuzz builds with the current Xcode
toolchain without the old suppression. Valdi's upstream `Device.isDesktop()`
and `Device.isWeb()` capabilities now provide the native-desktop boundary used
by `compose_core`, so the seven-file `Device.isMacOS()` fork was retired.

Only the still-unupstreamed AppKit scroll-direction patch remains. It is applied
by `MODULE.bazel` and retains its focused structural test.
