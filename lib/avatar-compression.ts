const DEFAULT_TARGET_BYTES = Math.floor(4.75 * 1024 * 1024);
const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;
const OUTPUT_TYPE = "image/jpeg";
const CANDIDATE_LONG_EDGES = [1600, 1280, 1024, 800];
const CANDIDATE_QUALITIES = [0.9, 0.84, 0.78, 0.72, 0.66];

type CompressionOptions = {
  targetBytes?: number;
  maxBytes?: number;
};

type DecodedImage = {
  source: CanvasImageSource;
  width: number;
  height: number;
  cleanup: () => void;
};

export async function compressAvatarImage(
  file: File,
  options: CompressionOptions = {},
): Promise<File> {
  if (typeof document === "undefined") {
    throw new Error("Avatar image compression is only available in the browser.");
  }

  const targetBytes = options.targetBytes ?? DEFAULT_TARGET_BYTES;
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
  const decoded = await decodeImage(file);

  try {
    let smallestCandidate: File | null = null;

    for (const longEdge of CANDIDATE_LONG_EDGES) {
      const { width, height } = fitWithinLongEdge(decoded.width, decoded.height, longEdge);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Unable to prepare the selected avatar image.");
      }

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
      context.drawImage(decoded.source, 0, 0, width, height);

      for (const quality of CANDIDATE_QUALITIES) {
        const blob = await canvasToBlob(canvas, OUTPUT_TYPE, quality);
        const candidate = new File([blob], compressedFileName(file.name), {
          type: OUTPUT_TYPE,
          lastModified: Date.now(),
        });

        if (!smallestCandidate || candidate.size < smallestCandidate.size) {
          smallestCandidate = candidate;
        }

        if (candidate.size <= targetBytes) {
          return candidate;
        }
      }
    }

    if (smallestCandidate && smallestCandidate.size <= maxBytes) {
      return smallestCandidate;
    }

    throw new Error("We compressed the image, but it is still larger than 5MB.");
  } finally {
    decoded.cleanup();
  }
}

function fitWithinLongEdge(width: number, height: number, longEdge: number) {
  const currentLongEdge = Math.max(width, height);
  if (currentLongEdge <= longEdge) {
    return { width, height };
  }

  const scale = longEdge / currentLongEdge;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

async function decodeImage(file: File): Promise<DecodedImage> {
  if ("createImageBitmap" in window) {
    try {
      const bitmap = await createImageBitmap(file);
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        cleanup: () => bitmap.close(),
      };
    } catch {
      return decodeImageElement(file);
    }
  }

  return decodeImageElement(file);
}

function decodeImageElement(file: File): Promise<DecodedImage> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      resolve({
        source: image,
        width: image.naturalWidth || image.width,
        height: image.naturalHeight || image.height,
        cleanup: () => URL.revokeObjectURL(objectUrl),
      });
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Unable to read the selected avatar image."));
    };
    image.src = objectUrl;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Unable to compress the selected avatar image."));
          return;
        }
        resolve(blob);
      },
      type,
      quality,
    );
  });
}

function compressedFileName(originalName: string) {
  const baseName = originalName.replace(/\.[^.]+$/, "") || "avatar";
  return `${baseName}-compressed.jpg`;
}
