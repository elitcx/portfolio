// Same limit as the server's MAX_UPLOAD_BYTES in api/_lib/files.js.
export const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;

const MAX_EDGE = 2400;
const QUALITIES = [0.85, 0.75, 0.65, 0.5];

export function fitSize(width, height, maxEdge = MAX_EDGE) {
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

export async function encodeUnderLimit(encode, maxBytes) {
  for (const quality of QUALITIES) {
    const blob = await encode(quality);
    if (blob.size <= maxBytes) return blob;
  }
  throw new Error('Picture is too large. Try a smaller one.');
}

// JPEG because Safari cannot encode WebP from a canvas. The build makes the
// WebP versions the site actually serves.
export async function shrinkPicture(file) {
  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new Error("This picture format can't be read. Try a JPEG or PNG.");
  }

  const { width, height } = fitSize(bitmap.width, bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  // JPEG has no transparency: paint white first, or see-through areas turn black.
  context.fillStyle = '#fff';
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return encodeUnderLimit(
    (quality) => new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('This picture could not be processed.'))),
        'image/jpeg',
        quality,
      );
    }),
    MAX_UPLOAD_BYTES,
  );
}

export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(new Error('That file could not be read.'));
    reader.readAsDataURL(blob);
  });
}
