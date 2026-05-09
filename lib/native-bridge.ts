import type { AvatarSource } from "./types";

export type NativePickedImage = {
  fileName: string;
  mimeType: string;
  fileSize: number;
  dataUrl?: string;
  tempUrl?: string;
};

type NativePickerBridge = {
  pickImage?: (source: AvatarSource) => Promise<NativePickedImage> | NativePickedImage;
};

type NativeWebkitMessage = {
  type: "pickImage";
  source: AvatarSource;
};

declare global {
  interface Window {
    ZokoMartNative?: NativePickerBridge;
    webkit?: {
      messageHandlers?: {
        zokoMartNative?: {
          postMessage: (message: NativeWebkitMessage) => void;
        };
      };
    };
  }
}

function getBrowserWindow(): Window | undefined {
  return typeof window === "undefined" ? undefined : window;
}

export function hasNativeImageBridge(): boolean {
  const browserWindow = getBrowserWindow();
  if (!browserWindow) {
    return false;
  }

  return Boolean(
    browserWindow.ZokoMartNative?.pickImage ||
      browserWindow.webkit?.messageHandlers?.zokoMartNative,
  );
}

export async function pickNativeImage(source: AvatarSource): Promise<NativePickedImage> {
  const browserWindow = getBrowserWindow();

  if (!browserWindow) {
    throw new Error("Native image picker is unavailable outside the browser environment.");
  }

  const bridge = browserWindow.ZokoMartNative?.pickImage;
  if (bridge) {
    return Promise.resolve(bridge(source));
  }

  if (browserWindow.webkit?.messageHandlers?.zokoMartNative) {
    throw new Error(
      "iOS native image picker bridge is present, but no callback channel is wired yet.",
    );
  }

  throw new Error("Native image picker bridge is not available in this environment.");
}
