import { Platform, Alert } from 'react-native';
import { Paths, File, Directory } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { imageToBase64DataUri, persistBase64Image } from '@/utils/image-storage';
import { useDiaryStore } from '@/store/useDiaryStore';
import { useCustomStickerStore } from '@/store/useCustomStickerStore';
import { useAppStore } from '@/store/useAppStore';
import type { DiaryPage, CanvasElement } from '@/store/types';
import type { CustomSticker } from '@/store/useCustomStickerStore';

interface BackupData {
  version: number;
  exportedAt: string;
  app: {
    customTitle: string;
    preferences: {
      themeKey: string;
      fontScale: number;
    };
  };
  pages: (DiaryPage & {
    elements: (CanvasElement & { imageData?: string | null })[];
  })[];
  customStickers: (CustomSticker & { imageData?: string | null })[];
}

function getTimestamp(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

/**
 * Export all diary data as a JSON backup file.
 * On web: triggers a file download.
 * On native: writes a temp file and opens the share sheet.
 */
export async function exportBackup(
  onProgress?: (message: string) => void
): Promise<void> {
  const pages = useDiaryStore.getState().pages;
  const customStickers = useCustomStickerStore.getState().stickers;
  const { customTitle, preferences } = useAppStore.getState();

  onProgress?.('データを準備中...');

  // Convert page element images to base64
  const exportPages = await Promise.all(
    pages.map(async (page) => {
      const exportElements = await Promise.all(
        page.elements.map(async (el) => {
          if (el.type === 'photo' || el.type === 'custom-image') {
            const imageData = await imageToBase64DataUri(el.content);
            return { ...el, imageData };
          }
          return { ...el, imageData: undefined };
        })
      );
      return { ...page, elements: exportElements };
    })
  );

  onProgress?.('ステッカー画像を変換中...');

  // Convert custom sticker images to base64
  const exportStickers = await Promise.all(
    customStickers.map(async (sticker) => {
      const imageData = await imageToBase64DataUri(sticker.uri);
      return { ...sticker, imageData };
    })
  );

  const backup: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    app: {
      customTitle,
      preferences: {
        themeKey: preferences.themeKey,
        fontScale: preferences.fontScale,
      },
    },
    pages: exportPages,
    customStickers: exportStickers,
  };

  const jsonString = JSON.stringify(backup);
  const filename = `hibinoki_backup_${getTimestamp()}.json`;

  onProgress?.('ファイルを保存中...');

  if (Platform.OS === 'web') {
    // Web: trigger download via blob URL
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  } else {
    // Native: write temp file and share
    const cacheDir = Paths.cache;
    const tempFile = new File(cacheDir, filename);
    if (tempFile.exists) {
      tempFile.delete();
    }
    tempFile.create();
    tempFile.write(jsonString);

    await Sharing.shareAsync(tempFile.uri, {
      mimeType: 'application/json',
      dialogTitle: 'バックアップデータを保存',
      UTI: 'public.json',
    });
  }
}

/**
 * Import diary data from a JSON backup file.
 * Returns true on success, false if cancelled, or throws on error.
 */
export async function importBackup(
  onProgress?: (message: string) => void
): Promise<boolean> {
  onProgress?.('ファイルを選択中...');

  let jsonString: string;

  if (Platform.OS === 'web') {
    // Web: use document picker
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.[0]) {
      return false;
    }

    const fileUri = result.assets[0].uri;
    const response = await fetch(fileUri);
    jsonString = await response.text();
  } else {
    // Native: use document picker
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.[0]) {
      return false;
    }

    const pickedFile = new File(result.assets[0].uri);
    jsonString = await pickedFile.text();
  }

  onProgress?.('データを検証中...');

  let backup: BackupData;
  try {
    backup = JSON.parse(jsonString);
  } catch {
    throw new Error('JSONファイルの解析に失敗しました。ファイルが破損している可能性があります。');
  }

  // Validate structure
  if (!backup.version || !backup.pages || !Array.isArray(backup.pages)) {
    throw new Error('バックアップファイルの形式が正しくありません。');
  }

  onProgress?.('画像を復元中...');

  // Restore page element images
  const restoredPages: DiaryPage[] = await Promise.all(
    backup.pages.map(async (page) => {
      const restoredElements: CanvasElement[] = await Promise.all(
        page.elements.map(async (el) => {
          const { imageData, ...element } = el as typeof el & { imageData?: string | null };
          if (imageData && (element.type === 'photo' || element.type === 'custom-image')) {
            const persistedUri = await persistBase64Image(imageData);
            return { ...element, content: persistedUri };
          }
          return element;
        })
      );
      return { ...page, elements: restoredElements };
    })
  );

  onProgress?.('ステッカーを復元中...');

  // Restore custom sticker images
  const restoredStickers: CustomSticker[] = await Promise.all(
    backup.customStickers.map(async (sticker) => {
      const { imageData, ...stickerData } = sticker;
      if (imageData) {
        const persistedUri = await persistBase64Image(imageData);
        return { ...stickerData, uri: persistedUri };
      }
      return stickerData;
    })
  );

  onProgress?.('データを適用中...');

  // Apply all data to stores
  useDiaryStore.getState().replaceAllPages(restoredPages);
  useCustomStickerStore.getState().replaceAllStickers(restoredStickers);

  if (backup.app) {
    if (backup.app.customTitle) {
      useAppStore.getState().setCustomTitle(backup.app.customTitle);
    }
    if (backup.app.preferences) {
      useAppStore.getState().setPreferences({
        themeKey: (backup.app.preferences.themeKey as 'pink' | 'lavender' | 'mint' | 'yellow') || 'pink',
        fontScale: backup.app.preferences.fontScale || 1,
      });
    }
  }

  return true;
}
