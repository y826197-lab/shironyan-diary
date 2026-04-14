/**
 * Platform-aware Zustand storage adapter.
 *
 * Problem: AsyncStorage on web uses localStorage (5 MB quota). Storing base64
 * photos and stroke arrays quickly exceeds this, throwing:
 *   "Uncaught Error: The quota has been exceeded"
 *
 * Solution: On web, use IndexedDB (quota is typically 50 %+ of available disk
 * space — effectively unlimited for diary use-cases). On native, keep using
 * AsyncStorage as before.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const IS_WEB = process.env.EXPO_OS === 'web';

// ── IndexedDB constants ──────────────────────────────────────────────────────
const IDB_DB_NAME = 'shironyan_diary';
const IDB_DB_VERSION = 1;
const IDB_STORE = 'kv';

/** Singleton promise for the open IDB connection. Reset on error to allow retry. */
let _idbPromise: Promise<IDBDatabase> | null = null;

function openIDB(): Promise<IDBDatabase> {
  if (!_idbPromise) {
    _idbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB not available'));
        return;
      }
      const req = indexedDB.open(IDB_DB_NAME, IDB_DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => {
        _idbPromise = null; // allow retry next time
        reject(req.error);
      };
    });
  }
  return _idbPromise;
}

/** IndexedDB key-value storage — compatible with Zustand's createJSONStorage. */
const idbStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const db = await openIDB();
      return new Promise<string | null>((resolve, reject) => {
        const req = db
          .transaction(IDB_STORE, 'readonly')
          .objectStore(IDB_STORE)
          .get(key);
        req.onsuccess = () =>
          resolve((req.result as string | undefined) ?? null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      const db = await openIDB();
      return new Promise<void>((resolve, reject) => {
        const req = db
          .transaction(IDB_STORE, 'readwrite')
          .objectStore(IDB_STORE)
          .put(value, key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Silently swallow — do NOT crash the app on storage errors
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      const db = await openIDB();
      return new Promise<void>((resolve, reject) => {
        const req = db
          .transaction(IDB_STORE, 'readwrite')
          .objectStore(IDB_STORE)
          .delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Silently swallow
    }
  },
};

/**
 * Returns the appropriate Zustand persist storage for the current platform.
 *
 * - Web   → IndexedDB  (no 5 MB quota problem; survives page reloads)
 * - Native → AsyncStorage (standard Expo/RN approach)
 *
 * Usage:
 *   storage: createJSONStorage(() => getPlatformStorage())
 */
export function getPlatformStorage() {
  return IS_WEB ? idbStorage : AsyncStorage;
}
