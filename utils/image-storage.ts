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
function generateFilename(originalUri: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  const ext = getExtension(originalUri);
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

/**
 * On web, blob/object URLs don't survive page reloads.
 * Convert them to base64 data URIs that can be stored in AsyncStorage.
 */
async function convertBlobToDataUri(blobUrl: string): Promise<string> {
  // Already a data URI — nothing to do
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
  // On web, blob URLs don't survive page reloads — convert to data URI
  if (Platform.OS === 'web') {
    try {
      return await convertBlobToDataUri(tempUri);
    } catch {
      // Fallback to original URI if conversion fails
      return tempUri;
    }
  }

  // If the URI is already in our persistent directory, skip copy
  if (tempUri.includes(`/${IMAGE_DIR}/`)) {
    return tempUri;
  }

  try {
    const dir = getImageDirectory();
    const filename = generateFilename(tempUri);
    const sourceFile = new File(tempUri);
    const destFile = new File(dir, filename);

    sourceFile.copy(destFile);

    // Verify the copy succeeded
    if (!destFile.exists) {
      throw new Error('File copy verification failed');
    }

    return destFile.uri;
  } catch {
    // Return original URI as fallback so the image is at least usable this session
    return tempUri;
  }
}

/**
 * Check whether a persisted image still exists on disk.
 * Always returns true on web (data URIs are inline).
 */
export function isPersistedImageValid(uri: string): boolean {
  if (Platform.OS === 'web') {
    return uri.startsWith('data:') || uri.startsWith('blob:') || uri.startsWith('http');
  }

  if (!uri.includes(`/${IMAGE_DIR}/`)) {
    // Not a persisted image — assume external URI is valid
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
