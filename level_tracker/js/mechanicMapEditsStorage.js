/**
 * mechanicMapEditsStorage.js
 * Quản lý lưu trữ và khôi phục các chỉnh sửa (overrides, comments) của người dùng
 * đối với Mechanic Map Proposed Blueprint vào IndexedDB.
 *
 * DB: 'PixelBallTool', Store: 'mechanic_map_edits'
 * Key composite: `${levelNum}_${mechId}`
 */

const DB_NAME = 'PixelBallTool';
const DB_VERSION = 2; // Nâng version để tạo store mới nếu cần
const STORE_EDITS = 'mechanic_map_edits';
const STORE_LEVELS = 'levels';

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB is not supported in this environment'));
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_LEVELS)) {
        db.createObjectStore(STORE_LEVELS, { keyPath: 'fileName' });
      }
      if (!db.objectStoreNames.contains(STORE_EDITS)) {
        db.createObjectStore(STORE_EDITS, { keyPath: 'key' });
      }
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Lưu hoặc cập nhật 1 record edit
 * @param {Object} editRecord - { key, levelNum, mechId, mechName, overrideType, overridePhase, comment, timestamp }
 */
export async function saveEdit(editRecord) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_EDITS, 'readwrite');
      const store = tx.objectStore(STORE_EDITS);
      const record = {
        ...editRecord,
        timestamp: new Date().toISOString()
      };
      store.put(record);
      tx.oncomplete = () => resolve(record);
      tx.onerror = (e) => reject(e.target.error);
    });
  } catch (e) {
    console.warn('[mechanicMapEditsStorage] Không thể lưu edit:', e);
    return null;
  }
}

/**
 * Xóa 1 edit record (reset cell về mặc định)
 * @param {string} key - Composite key `${levelNum}_${mechId}`
 */
export async function removeEdit(key) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_EDITS, 'readwrite');
      const store = tx.objectStore(STORE_EDITS);
      store.delete(key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = (e) => reject(e.target.error);
    });
  } catch (e) {
    console.warn('[mechanicMapEditsStorage] Không thể xóa edit:', e);
    return false;
  }
}

/**
 * Tải toàn bộ edits từ IndexedDB
 * @returns {Promise<Map<string, Object>>} Map với key là `${levelNum}_${mechId}`
 */
export async function loadAllEdits() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_EDITS, 'readonly');
      const store = tx.objectStore(STORE_EDITS);
      const req = store.getAll();
      req.onsuccess = (e) => {
        const list = e.target.result || [];
        const map = new Map();
        list.forEach((item) => {
          map.set(item.key, item);
        });
        resolve(map);
      };
      req.onerror = (e) => reject(e.target.error);
    });
  } catch (e) {
    console.warn('[mechanicMapEditsStorage] Không thể load edits:', e);
    return new Map();
  }
}

/**
 * Xóa toàn bộ edits đã lưu
 */
export async function clearAllEdits() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_EDITS, 'readwrite');
      tx.objectStore(STORE_EDITS).clear();
      tx.oncomplete = () => resolve(true);
      tx.onerror = (e) => reject(e.target.error);
    });
  } catch (e) {
    console.warn('[mechanicMapEditsStorage] Không thể xóa tất cả edits:', e);
    return false;
  }
}
