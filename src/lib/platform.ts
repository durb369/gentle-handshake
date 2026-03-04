import { Capacitor } from "@capacitor/core";

/** True when running inside a native Android shell (Capacitor) */
export const isAndroid = (): boolean =>
  Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";

/** True when running inside any native shell */
export const isNative = (): boolean => Capacitor.isNativePlatform();

/** True when running in a regular browser (not wrapped by Capacitor) */
export const isWeb = (): boolean => !Capacitor.isNativePlatform();
