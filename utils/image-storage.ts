import { Platform } from 'react-native';
import { Paths, File, Directory } from 'expo-file-system';

const IMAGE_DIR = 'diary-images';

/**
 * Get or create the persistent image directory.
 */
function getImageDirectory(): Directory {
  const dir = new Directory(Paths.document, IMAGE_DIR);
  if (!dir.exists) {
    dir.create();
  }
  return dir;
}

/**
 * Generate a unique filename for a persisted image.
 */
function generateFilename(hint: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  const ext = getExtension(hint);
  return `img_${timestamp}_${random}${ext}`;
}

function getExtension(uri: string): string {
  const cleanUri = uri.split('?')[0].split('#')[0];
  const match = cleanUri.match(/\.(\w+)$/);
  if (match) {
    const ext = match[1].toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif', 'bmp'].includes(ext)) {
      return `.${ext}`;
    }
  }
  return '.jpg';
}

function mimeToExtension(mime: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/bmp': '.bmp',
  };
  return map[mime] || '.jpg';
}

/**
 * On web, blob/object URLs don't survive page reloads.
 * Convert them to base64 data URIs that can be stored in AsyncStorage.
 */
async function convertBlobToDataUri(blobUrl: string): Promise<string> {
  if (blobUrl.startsWith('data:')) {
    return blobUrl;
  }

  const response = await fetch(blobUrl);
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('FileReader did not return a string'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * Copy an image from a temporary URI (e.g. from expo-image-picker)
 * to a persistent location in the app's document directory.
 *
 * On web, blob URLs are converted to base64 data URIs for persistence.
 * On native, images are copied to the app's document directory.
 *
 * Returns the persistent URI that should be stored.
 */
export async function persistImage(tempUri: string): Promise<string> {
  if (Platform.OS === 'web') {
    try {
      return await convertBlobToDataUri(tempUri);
    } catch {
      return tempUri;
    }
  }

  if (tempUri.includes(`/${IMAGE_DIR}/`)) {
    return tempUri;
  }

  try {
    const dir = getImageDirectory();
    const filename = generateFilename(tempUri);
    const sourceFile = new File(tempUri);
    const destFile = new File(dir, filename);

    sourceFile.copy(destFile);

    if (!destFile.exists) {
      throw new Error('File copy verification failed');
    }

    return destFile.uri;
  } catch {
    return tempUri;
  }
}

/**
 * Read any image URI and return a base64 data URI string.
 * Used for backup export – works on both web and native.
 */
export async function imageToBase64DataUri(uri: string): Promise<string | null> {
  if (!uri) return null;
  if (uri.startsWith('data:')) return uri;

  if (Platform.OS === 'web') {
    try {
      return await convertBlobToDataUri(uri);
    } catch {
      return null;
    }
  }

  // Native: use the new File API's base64() method
  try {
    const file = new File(uri);
    if (!file.exists) return null;
    const base64 = await file.base64();
    const ext = getExtension(uri).replace('.', '');
    const mime = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : 'image/jpeg';
    return `data:${mime};base64,${base64}`;
  } catch {
    return null;
  }
}

/**
 * Persist a base64 data URI to the app's document directory.
 * On web returns the data URI as-is. On native writes a file and returns its URI.
 * Used for backup import.
 */
export async function persistBase64Image(dataUri: string): Promise<string> {
  if (Platform.OS === 'web') return dataUri;
  if (!dataUri.startsWith('data:')) return dataUri;

  const match = dataUri.match(/^data:image\/([^;]+);base64,/);
  if (!match) return dataUri;

  const mime = `image/${match[1]}`;
  const ext = mimeToExtension(mime);
  const base64Data = dataUri.split(',')[1];
  if (!base64Data) return dataUri;

  try {
    const dir = getImageDirectory();
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 8);
    const filename = `img_${timestamp}_${random}${ext}`;
    const destFile = new File(dir, filename);

    destFile.create();
    destFile.write(base64Data, { encoding: 'base64' });

    return destFile.uri;
  } catch {
    return dataUri;
  }
}

/**
 * Check whether a persisted image still exists on disk.
 */
export function isPersistedImageValid(uri: string): boolean {
  if (Platform.OS === 'web') {
    return uri.startsWith('data:') || uri.startsWith('blob:') || uri.startsWith('http');
  }

  if (!uri.includes(`/${IMAGE_DIR}/`)) {
    return true;
  }

  try {
    const file = new File(uri);
    return file.exists;
  } catch {
    return false;
  }
}

/**
 * Delete a persisted image file.
 * Safe to call with any URI - only deletes if it's in our image directory.
 */
export async function deletePersistedImage(uri: string): Promise<void> {
  if (Platform.OS === 'web') return;

  if (!uri.includes(`/${IMAGE_DIR}/`)) return;

  try {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  } catch {
    // Silently ignore deletion errors - file may already be gone
  }
}
