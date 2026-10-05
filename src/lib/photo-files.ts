export const MAX_SOURCE_PHOTO_BYTES = 10 * 1024 * 1024;

const PHOTO_TYPE_BY_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heif'
};

const SUPPORTED_PHOTO_TYPES = new Set(Object.values(PHOTO_TYPE_BY_EXTENSION));

export type PhotoFileValidationError = 'unsupported-type' | 'too-large';

export function getPhotoMimeType(file: Pick<File, 'name' | 'type'>): string | null {
  const declaredType = file.type.toLowerCase().split(';')[0];
  if (SUPPORTED_PHOTO_TYPES.has(declaredType)) return declaredType;

  // Some mobile browsers report an empty or generic MIME type for HEIC/HEIF uploads.
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  return PHOTO_TYPE_BY_EXTENSION[extension] || null;
}

export function getPhotoFileValidationError(
  file: Pick<File, 'name' | 'type' | 'size'>
): PhotoFileValidationError | null {
  if (!getPhotoMimeType(file)) {
    return 'unsupported-type';
  }

  if (file.size <= 0 || file.size > MAX_SOURCE_PHOTO_BYTES) {
    return 'too-large';
  }

  return null;
}

async function convertHeicToJpeg(file: File, mimeType: string): Promise<Blob> {
  const { default: heic2any } = await import('heic2any');
  const converted = await heic2any({
    blob: file.slice(0, file.size, mimeType),
    toType: 'image/jpeg',
    quality: 0.9
  });
  const jpegBlob = Array.isArray(converted) ? converted[0] : converted;

  if (!jpegBlob) {
    throw new Error('Could not convert the HEIC photo.');
  }
  if (jpegBlob.size <= MAX_SOURCE_PHOTO_BYTES) {
    return jpegBlob;
  }

  // Keep the API request within its 10 MB source-photo limit after transcoding.
  const bitmap = await createImageBitmap(jpegBlob);
  const maxDimension = 3072;
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d');
  if (!context) {
    bitmap.close();
    throw new Error('Could not prepare the converted photo.');
  }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const resizedBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Could not compress the converted photo.'));
    }, 'image/jpeg', 0.82);
  });

  if (resizedBlob.size > MAX_SOURCE_PHOTO_BYTES) {
    throw new Error('The converted photo is still larger than 10 MB.');
  }
  return resizedBlob;
}

export async function readPhotoFileAsDataUrl(file: File): Promise<string> {
  const sourceMimeType = getPhotoMimeType(file);
  if (!sourceMimeType) {
    throw new Error('Unsupported photo format.');
  }

  const isHeic = sourceMimeType === 'image/heic' || sourceMimeType === 'image/heif';
  const blob = isHeic ? await convertHeicToJpeg(file, sourceMimeType) : file.slice(0, file.size, sourceMimeType);
  const outputMimeType = isHeic ? 'image/jpeg' : sourceMimeType;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Could not read the selected image.'));
      }
    };
    reader.onerror = () => reject(reader.error || new Error('Could not read the selected image.'));
    reader.readAsDataURL(blob.slice(0, blob.size, outputMimeType));
  });
}
