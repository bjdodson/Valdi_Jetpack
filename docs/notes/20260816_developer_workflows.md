# Developer workflows on Valdi 0.1.1

The repository helper scripts now use Bazelisk, current generated target names,
and the same platform flags as the adopted Valdi 0.1.1 CLI. They do not depend
on legacy `WORKSPACE`-era output executables.

| Command | Purpose | Host requirement |
| --- | --- | --- |
| `scripts/validate.sh` | Query the graph, run representative native/structural tests, and compile both Valdi modules. | macOS toolchain used by the native test target. |
| `scripts/validate.sh --macos-app` | Also build the signed macOS playground with inline assets. | macOS and Xcode command-line tools. |
| `scripts/bazel_macos_run.sh` | Build and run `app_macos` through Bazel. | macOS and Xcode command-line tools. |
| `scripts/bazel_hotreload.sh` | Start the generated `app_hotreload` executable target. | Watchman and an already running compatible app. |
| `scripts/bazel_android_install.sh` | Detect the connected device ABI, build with the matching official architecture/JNI/platform flags, install, and launch. | `adb` plus one connected device or emulator using arm64-v8a, armeabi/armeabi-v7a, or x86_64. |
| `scripts/bazel_ios_install.sh` | Build the iOS app, extract it in a unique temporary directory, and install it. | Xcode `simctl` plus a booted simulator. |

The shell contract test syntax-checks every helper and guards the target labels
and platform flags. Android and iOS device installation are intentionally not
claimed by the macOS-only validation run; their target labels remain covered by
the repository-wide Bazel query. `VALDI_JETPACK_BAZEL_OUTPUT_ROOT` optionally
selects a writable Bazel output root without embedding a machine-specific path
in the validation script.
