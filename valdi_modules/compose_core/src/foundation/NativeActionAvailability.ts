import { Device } from "valdi_core/src/Device";

/** Pure platform decision used by native-action availability tests. */
export function nativeMacOSActionAvailable(
  deviceIsMacOS: boolean,
  webRuntimePresent: boolean,
): boolean {
  return deviceIsMacOS && !webRuntimePresent;
}

/** Web globals are a defense-in-depth exclusion around the native capability. */
export function nativeActionWebRuntimePresent(): boolean {
  return typeof window !== "undefined" || typeof document !== "undefined";
}

/** Runtime macOS decision shared by native action components. */
export function macOSNativeActionAvailable(): boolean {
  return nativeMacOSActionAvailable(
    Device.isMacOS(),
    nativeActionWebRuntimePresent(),
  );
}
