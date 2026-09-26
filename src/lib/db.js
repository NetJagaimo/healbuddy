import { openDB } from 'idb';

// 所有資料只存在本機 IndexedDB（見 docs/entities/離線使用.md）
export const STORES = ['foods', 'intakes', 'exerciseTypes', 'exerciseChecks'];
export const EXPORT_VERSION = 1;

export const DEFAULT_EXERCISES = [
  { id: 'gym', name: '健身房', emoji: '🏋' },
  { id: 'hike', name: '爬山', emoji: '⛰' },
  { id: 'walk', name: '走路 8000 步', emoji: '🚶' },
  { id: 'swim', name: '游泳', emoji: '🏊' }
];

export async function openAppDB(name = 'healbuddy') {
  const db = await openDB(name, 1, {
    upgrade(db) {
      db.createObjectStore('foods', { keyPath: 'id' });
      db.createObjectStore('intakes', { keyPath: 'id' }).createIndex('date', 'date');
      db.createObjectStore('exerciseTypes', { keyPath: 'id' });
      db.createObjectStore('exerciseChecks', { keyPath: 'id' }).createIndex('date', 'date');
      db.createObjectStore('meta');
    }
  });

  if (!(await db.get('meta', 'seeded'))) {
    const tx = db.transaction(['exerciseTypes', 'meta'], 'readwrite');
    DEFAULT_EXERCISES.forEach((t, i) => tx.objectStore('exerciseTypes').put({ ...t, order: i }));
    tx.objectStore('meta').put(true, 'seeded');
    await tx.done;
  }
  return db;
}

export async function loadAll(db) {
  const entries = await Promise.all(STORES.map((s) => db.getAll(s)));
  return Object.fromEntries(STORES.map((s, i) => [s, entries[i]]));
}

export async function replaceAll(db, data) {
  const tx = db.transaction(STORES, 'readwrite');
  for (const s of STORES) {
    await tx.objectStore(s).clear();
    for (const row of data[s]) tx.objectStore(s).put(row);
  }
  await tx.done;
}

export function validateImport(data) {
  if (!data || data.app !== 'healbuddy') throw new Error('這不是 healbuddy 的備份檔');
  if (data.version !== EXPORT_VERSION) throw new Error('不支援的備份版本');
  for (const s of STORES) {
    if (!Array.isArray(data[s])) throw new Error('備份檔內容不完整');
  }
  return data;
}
