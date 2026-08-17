#!/usr/bin/env bash
set -euo pipefail

: "${TEST_SRCDIR:?TEST_SRCDIR is required}"
: "${TEST_WORKSPACE:?TEST_WORKSPACE is required}"

ROOT="$TEST_SRCDIR/$TEST_WORKSPACE"
NATIVE="$ROOT/valdi_modules/compose_core/macos/VJComposeImageExportBridge.m"
PRESENTATION="$ROOT/valdi_modules/compose_core/src/foundation/ImageExportActions.tsx"
AVAILABILITY="$ROOT/valdi_modules/compose_core/src/foundation/NativeActionAvailability.ts"
BUILD_FILE="$ROOT/valdi_modules/compose_core/BUILD.bazel"

require_source() {
  local pattern="$1"
  local file="$2"
  local message="$3"
  if ! grep -Fq "$pattern" "$file"; then
    echo "$message" >&2
    exit 1
  fi
}

require_source "@interface VJComposeImageExportBridge : NSView <NSURLSessionDataDelegate>" "$NATIVE" "export must use its namespaced AppKit class and bounded streaming delegate"
require_source "VJComposeMaximumImageBytes = 256 * 1024 * 1024" "$NATIVE" "export must enforce the fixed size cap"
require_source "VJComposeMaximumImagePixels" "$NATIVE" "export must cap decoded pixel dimensions"
require_source "CGImageSourceCopyPropertiesAtIndex" "$NATIVE" "pixel dimensions must be inspected before AppKit decoding"
require_source "CGImageSourceGetType" "$NATIVE" "ImageIO must confirm the source is JPEG or PNG"
require_source "CGImageSourceGetStatus(imageSource) == kCGImageStatusComplete" "$NATIVE" "the image container must be complete"
require_source "CGImageSourceGetStatusAtIndex(imageSource, 0) == kCGImageStatusComplete" "$NATIVE" "the image frame must be complete"
require_source "CGImageSourceGetCount(imageSource) == 1" "$NATIVE" "multi-frame images must not bypass the fixed pixel budget"
require_source "NSURLFileSizeKey" "$NATIVE" "local files must be size-checked before loading"
require_source "expectedContentLength" "$NATIVE" "remote responses must be preflighted when length is known"
require_source "didReceiveData:(NSData *)data" "$NATIVE" "remote bodies must stream through the bounded delegate"
require_source "VJComposeMaximumImageBytes - _receivedData.length" "$NATIVE" "unknown-length responses must be cancelled at the cap"
require_source "ephemeralSessionConfiguration" "$NATIVE" "remote loads must use an ephemeral session"
require_source "NSHTTPCookieAcceptPolicyNever" "$NATIVE" "remote loads must not retain cookies"
require_source "@property(nonatomic, weak) VJComposeImageExportBridge *owner" "$NATIVE" "the session delegate must not retain a removed native view"
require_source "delegate:_sessionDelegate" "$NATIVE" "remote callbacks must use the weak forwarding delegate"
require_source "_sessionDelegate.owner = nil" "$NATIVE" "network invalidation must detach the forwarding delegate"
require_source 'isEqualToString:@"http"' "$NATIVE" "HTTP sources must be explicitly allowed"
require_source 'isEqualToString:@"https"' "$NATIVE" "HTTPS sources must be explicitly allowed"
require_source "url.isFileURL" "$NATIVE" "local file URLs must be explicitly handled"
require_source "pngSignature" "$NATIVE" "PNG bytes must be signature-checked"
require_source "bytes[0] == 0xff" "$NATIVE" "JPEG bytes must be signature-checked"
require_source "NSPasteboard" "$NATIVE" "copy export must use the macOS pasteboard"
require_source "NSDownloadsDirectory" "$NATIVE" "quick-save must resolve Downloads"
require_source "NSDataWritingAtomic" "$NATIVE" "file saves must be atomic"
require_source "linkItemAtURL:temporaryURL toURL:candidate" "$NATIVE" "Downloads publication must atomically refuse overwrite"
require_source "NSFileWriteFileExistsError" "$NATIVE" "Downloads publication must retry collisions"
require_source ".vj-export-%@.tmp" "$NATIVE" "large writes must stage through an adjacent hidden temporary file"
require_source "NSSavePanel" "$NATIVE" "Save As must use the native save panel"
require_source "_savePanel" "$NATIVE" "Save As panel lifecycle must be tracked"
require_source "[panel cancel:nil]" "$NATIVE" "invalidated Save As panels must be dismissed"
require_source "beginSheetModalForWindow" "$NATIVE" "Save As should attach to an available host window"
require_source "beginWithCompletionHandler" "$NATIVE" "Save As must work without a host window"
require_source "UTTypePNG" "$NATIVE" "Save As must constrain PNG output"
require_source "UTTypeJPEG" "$NATIVE" "Save As must constrain JPEG output"
require_source "panel.allowedFileTypes" "$NATIVE" "Save As must retain a pre-macOS-11 type fallback"
require_source 'weak_sdk_frameworks = ["UniformTypeIdentifiers"]' "$BUILD_FILE" "the macOS-11-only UniformTypeIdentifiers framework must be weak-linked"
require_source 'bindUntypedAttribute:@"command"' "$NATIVE" "request and source configuration must arrive atomically"
require_source "vj_scheduleCurrentCommand" "$NATIVE" "command execution must be deferred across unordered attribute application"
require_source "vj_isCurrentRequest" "$NATIVE" "every asynchronous side effect must be token-checked"
require_source "vj_invalidateActiveRequest" "$NATIVE" "cleared commands must invalidate native work"
require_source "executionGeneration" "$NATIVE" "same-text requests must still reject stale generations"
require_source "request !== this.state.request" "$PRESENTATION" "stale native results must be ignored"
require_source "becameDisabled" "$PRESENTATION" "disabling export must clear transient menu and busy state"
require_source "imageExportNativeCommand" "$PRESENTATION" "presentation must atomically bind request configuration"
require_source "ImageExportResult" "$PRESENTATION" "presentation must return a typed result"
require_source "ImageExportReason" "$PRESENTATION" "native outcomes must include a stable typed reason"
require_source "macOSNativeActionAvailable()" "$PRESENTATION" "export must use the shared platform guard"
require_source "Device.isDesktop()" "$AVAILABILITY" "export availability must require an upstream native desktop capability"
require_source "Device.isWeb()" "$AVAILABILITY" "desktop web must be excluded through Valdi's upstream web capability"
require_source 'iosClass="VJComposeImageExportBridge"' "$PRESENTATION" "presentation must request the namespaced native class"

if grep -Fq "NSDataWritingWithoutOverwriting" "$NATIVE"; then
  echo "NSDataWritingAtomic cannot be combined with NSDataWritingWithoutOverwriting" >&2
  exit 1
fi

if grep -Fq "completionHandler:^(NSData *data" "$NATIVE"; then
  echo "remote bodies must not use the unbounded NSURLSession completion buffer" >&2
  exit 1
fi

if grep -Eiq 'astro|capture|workspace|artifact' "$NATIVE" "$PRESENTATION"; then
  echo "image export defaults must remain product-neutral" >&2
  exit 1
fi
