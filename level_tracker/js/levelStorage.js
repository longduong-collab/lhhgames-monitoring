/**
 * levelStorage.js
 * Persist và restore danh sách level đã parse vào IndexedDB.
 * DB: 'PixelBallTool', Store: 'levels', key: level.fileName
 */

const DB_NAME = 'PixelBallTool';
const DB_VERSION = 2;
const STORE_NAME = 'levels';
const STORE_EDITS = 'mechanic_map_edits';

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB is not supported in this environment'));
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'fileName' });
      }
      if (!db.objectStoreNames.contains(STORE_EDITS)) {
        db.createObjectStore(STORE_EDITS, { keyPath: 'key' });
      }
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

export async function saveLevels(levelsArray) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      
      // Clear old data first, then put new
      store.clear();
      levelsArray.forEach((lvl) => {
        // rawJson có thể lớn — lưu luôn để restore được đầy đủ pixel art & gameplay stats
        store.put(lvl);
      });
      
      tx.oncomplete = () => resolve(true);
      tx.onerror = (e) => reject(e.target.error);
    });
  } catch (e) {
    if (typeof window !== 'undefined') {
      console.warn('[levelStorage] Không thể lưu vào IndexedDB:', e);
    }
    return false;
  }
}

export async function loadLevels() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = (e) => resolve(e.target.result || []);
      req.onerror = (e) => reject(e.target.error);
    });
  } catch (e) {
    if (typeof window !== 'undefined') {
      console.warn('[levelStorage] Không thể load từ IndexedDB:', e);
    }
    return [];
  }
}

export async function clearStoredLevels() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
      tx.oncomplete = () => resolve(true);
      tx.onerror = (e) => reject(e.target.error);
    });
  } catch (e) {
    if (typeof window !== 'undefined') {
      console.warn('[levelStorage] Không thể xóa IndexedDB:', e);
    }
    return false;
  }
}
