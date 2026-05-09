import { hasNativeImageBridge, pickNativeImage } from "./native-bridge";
import type { AvatarSource, PickedAvatarFile } from "./types";

export function createObjectPreview(file: File): string {
  return URL.createObjectURL(file);
}

const BROWSER_PICKER_RECOVERY_TIMEOUT_MS = 1500;
const BROWSER_PICKER_WATCHDOG_TIMEOUT_MS = 30000;

async function createFileFromRemoteUrl(
  url: string,
  fileName: string,
  mimeType: string,
): Promise<File> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Unable to read the selected avatar image.");
  }

  const blob = await response.blob();
  return new File([blob], fileName, {
    type: mimeType || blob.type,
    lastModified: Date.now(),
  });
}

async function createFileFromNativePick(source: AvatarSource): Promise<PickedAvatarFile> {
  const pickedImage = await pickNativeImage(source);
  const previewSource = pickedImage.dataUrl ?? pickedImage.tempUrl;

  if (!previewSource) {
    throw new Error("Native image picker did not return a usable image URL.");
  }

  const file = await createFileFromRemoteUrl(
    previewSource,
    pickedImage.fileName,
    pickedImage.mimeType,
  );

  return {
    file,
    previewUrl: previewSource,
    source,
  };
}

function pickAvatarFromBrowser(source: AvatarSource): Promise<PickedAvatarFile | null> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.reject(new Error("Avatar picker is unavailable outside the browser."));
  }

  return new Promise<PickedAvatarFile | null>((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif";
    input.style.display = "none";

    if (source === "camera") {
      input.capture = "environment";
    }

    let settled = false;
    let recoveryTimerId: number | null = null;
    let watchdogTimerId: number | null = null;
    let pickerWasBackgrounded = false;

    const scheduleRecoveryCheck = (delayMs: number) => {
      if (recoveryTimerId !== null) {
        window.clearTimeout(recoveryTimerId);
      }

      recoveryTimerId = window.setTimeout(() => {
        if (!settled && !(input.files && input.files.length > 0)) {
          settle(null);
        }
      }, delayMs);
    };

    const cleanup = () => {
      input.removeEventListener("change", handleChange);
      input.removeEventListener("cancel", handleCancel);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
      if (recoveryTimerId !== null) {
        window.clearTimeout(recoveryTimerId);
      }
      if (watchdogTimerId !== null) {
        window.clearTimeout(watchdogTimerId);
      }
      if (input.parentNode) {
        input.parentNode.removeChild(input);
      }
    };

    const settle = (value: PickedAvatarFile | null) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      resolve(value);
    };

    const handleChange = () => {
      const file = input.files?.[0] ?? null;
      if (!file) {
        settle(null);
        return;
      }

      settle({
        file,
        previewUrl: createObjectPreview(file),
        source,
      });
    };

    const handleCancel = () => {
      settle(null);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        pickerWasBackgrounded = true;
        return;
      }

      if (pickerWasBackgrounded) {
        scheduleRecoveryCheck(300);
      }
    };

    const handleWindowFocus = () => {
      if (pickerWasBackgrounded) {
        scheduleRecoveryCheck(300);
        return;
      }

      scheduleRecoveryCheck(BROWSER_PICKER_RECOVERY_TIMEOUT_MS);
    };

    input.addEventListener("change", handleChange, { once: true });
    input.addEventListener("cancel", handleCancel, { once: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);
    document.body.appendChild(input);
    input.click();
    watchdogTimerId = window.setTimeout(() => {
      if (!settled && !(input.files && input.files.length > 0)) {
        settle(null);
      }
    }, BROWSER_PICKER_WATCHDOG_TIMEOUT_MS);
  });
}

export async function pickAvatar(source: AvatarSource): Promise<PickedAvatarFile | null> {
  if (hasNativeImageBridge()) {
    return createFileFromNativePick(source);
  }

  return pickAvatarFromBrowser(source);
}
