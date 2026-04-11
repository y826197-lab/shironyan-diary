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
 * Copy an image from a temporary URI (e.g. from expo-image-picker)
 * to a persistent location in the app's document directory.
 *
 * On web, image URIs are already persistent (blob/object URLs or data URIs)
 * so we return them as-is.
 *
 * Returns the persistent URI that should be stored.
 */
export async function persistImage(tempUri: string): Promise<string> {
  // On web, URIs from image picker are blob/data URIs that work fine
  if (Platform.OS === 'web') {
    return tempUri;
  }

  // If the URI is already in our persistent directory, skip copy
  if (tempUri.includes(`/${IMAGE_DIR}/`)) {
    return tempUri;
  }

  const dir = getImageDirectory();
  const filename = generateFilename(tempUri);
  const sourceFile = new File(tempUri);
  const destFile = new File(dir, filename);

  sourceFile.copy(destFile);

  return destFile.uri;
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
