import { Device } from "valdi_core/src/Device";

/** Pure platform decision used by native-action availability tests. */
export function nativeMacOSActionAvailable(
  deviceIsDesktop: boolean,
  deviceIsWeb: boolean,
): boolean {
  return deviceIsDesktop && !deviceIsWeb;
}

/** Runtime macOS decision shared by native action components. */
export function macOSNativeActionAvailable(): boolean {
  return nativeMacOSActionAvailable(
    Device.isDesktop(),
    Device.isWeb(),
  );
}
