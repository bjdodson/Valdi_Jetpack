# Valdi beta-0.1.1 migration

## Verified upstream revision

The audit on 2026-08-16 (America/Los_Angeles) checked the official Snapchat
repository and release metadata:

- latest published release: [`beta-0.1.1`](https://github.com/Snapchat/Valdi/releases/tag/beta-0.1.1), published 2026-07-01;
- immutable tag commit: [`41d6d87643e0b9f9dcd8d7b7c162cf0ac7c969a2`](https://github.com/Snapchat/Valdi/commit/41d6d87643e0b9f9dcd8d7b7c162cf0ac7c969a2);
- official `main` observed during the audit: [`ef734168d70c37b99209b0e3affe48e3d48b1cc4`](https://github.com/Snapchat/Valdi/commit/ef734168d70c37b99209b0e3affe48e3d48b1cc4).

`main` was newer but unreleased and moving. Jetpack therefore uses the newest
published consumer revision, `beta-0.1.1`, with the archive integrity and
resolved bzlmod graph checked in for reproducibility.

The evidence was cross-checked with:

```sh
gh release list --repo Snapchat/Valdi
gh release view beta-0.1.1 --repo Snapchat/Valdi
git ls-remote https://github.com/Snapchat/Valdi.git \
  refs/heads/main refs/tags/beta-0.1.1
```

## Build-system migration

- `MODULE.bazel` now follows the official 0.1.x consumer template: Valdi and
  its nested modules come from the same integrity-pinned release archive, and
  the Valdi registry precedes the Bazel Central Registry.
- `.bazelrc` enables bzlmod, disables WORKSPACE resolution, uses Java 17 for
  Bazel tools, and removes the legacy local Android NDK crosstool selection.
- `MODULE.bazel.lock` records the complete resolved graph. The obsolete
  `WORKSPACE` file and unused `Valdi_Widgets` fetch were removed.
- `platforms` is a direct root dependency because Valdi's generated Android
  application graph resolves `@platforms` from the consumer repository. The
  Android and iOS application targets both complete analysis with their
  official 0.1.1 platform flags.
- macOS-only Objective-C bridges use the upstream `macos_deps` API rather than
  a platform-select workaround in generic native dependencies.

## Compatibility patch disposition

| Previous patch | 0.1.1 disposition |
| --- | --- |
| Yoga literal operators | Removed; fixed by the 0.1.1 release. |
| Hermes nontrivial `memcpy` warning | Removed; fixed by the 0.1.1 release. |
| Harfbuzz warning suppression | Removed; the upgraded source completed both the native Jasmine and macOS app builds unpatched. |
| macOS custom-view resolution | Removed; generic class resolution is upstream in 0.1.1. |
| `Device.isMacOS()` bridge fork | Removed; `Device.isDesktop()` plus `Device.isWeb()` supplies the required public capability boundary. |
| AppKit scroll direction | Retained as the only local Valdi patch; the equivalent change is not present in 0.1.1. |

## Validation

The migration was validated with:

- repository-wide `bazelisk query //...`;
- six representative Bazel tests, including the executable Valdi/Jasmine
  suite and five structural/native bridge contracts;
- `compose_core` and `compose_playground` module builds; and
- a signed `//apps/compose_playground:app_macos` build with inline assets.

The official 0.1.1 consumer dependency graph emits version-selection warnings
for `rules_java` and `rules_jvm_external`; the selected graph resolves and all
listed validation succeeds. Android and iOS runtime installation were not
performed during this macOS migration.
