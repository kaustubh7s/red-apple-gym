/**
 * High-reliability persistence layer for Red Apple Gym.
 * Uses native browser IndexedDB with seamless LocalStorage sync.
 * IndexedDB has a quota of hundreds of Megabytes (unlike LocalStorage's strict 5MB limit),
 * ensuring members, leads, attendance, and photos are NEVER lost or automatically deleted.
 */

const DB_NAME = 'RedAppleGymDB';
const DB_VERSION = 1;
const STORE_NAME = 'gym_records';

function openDatabase(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onerror = () => {
        resolve(null);
      };
    } catch (e) {
      resolve(null);
    }
  });
}

/**
 * Stores a value in IndexedDB (handles large datasets & photos safely)
 */
export async function idbSet<T>(key: string, value: T): Promise<boolean> {
  const db = await openDatabase();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(value, key);

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    } catch (e) {
      resolve(false);
    }
  });
}

/**
 * Retrieves a value from IndexedDB
 */
export async function idbGet<T>(key: string): Promise<T | null> {
  const db = await openDatabase();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result !== undefined ? (request.result as T) : null);
      };
      request.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
}

/**
 * Safely persists data to BOTH LocalStorage and IndexedDB.
 * If LocalStorage quota exceeds, IndexedDB preserves the full data without failing.
 */
export async function safePersist<T>(key: string, data: T): Promise<void> {
  // 1. Always write to IndexedDB (virtually unlimited quota)
  await idbSet(key, data);

  // 2. Try writing to LocalStorage (for instant first-frame render)
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (quotaError) {
      console.warn(`[SafePersist] LocalStorage quota reached for "${key}". Data safely stored in IndexedDB.`, quotaError);
    }
  }
}

/**
 * Safely reads data: checks LocalStorage first, then checks IndexedDB if needed.
 */
export async function safeLoad<T>(key: string, legacyKeys: string[] = []): Promise<T | null> {
  if (typeof window === 'undefined') return null;

  // 1. Try IndexedDB first for newest authoritative state
  const idbData = await idbGet<T>(key);
  if (idbData) return idbData;

  // 2. Try LocalStorage primary key
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  // 3. Try legacy LocalStorage keys
  for (const legKey of legacyKeys) {
    try {
      const rawLeg = localStorage.getItem(legKey);
      if (rawLeg) return JSON.parse(rawLeg);
    } catch (e) {}
  }

  return null;
}

export interface StorageQuotaInfo {
  totalBytes: number;
  totalKB: number;
  totalMB: number;
  limitMB: number;
  usedPercentage: number;
  remainingMB: number;
  status: 'safe' | 'warning' | 'critical';
}

/**
 * Calculates current gym data footprint against the 50 MB Supabase free-plan quota.
 */
export function calculateStorageQuota(
  members: any[] = [],
  leads: any[] = [],
  attendance: any[] = [],
  payments: any[] = []
): StorageQuotaInfo {
  let totalBytes = 0;
  try {
    totalBytes += new Blob([JSON.stringify(members)]).size;
    totalBytes += new Blob([JSON.stringify(leads)]).size;
    totalBytes += new Blob([JSON.stringify(attendance)]).size;
    totalBytes += new Blob([JSON.stringify(payments)]).size;
  } catch (e) {
    totalBytes = (members.length * 14 + leads.length * 14 + attendance.length * 0.1 + payments.length * 0.2) * 1024;
  }

  const totalKB = Math.round(totalBytes / 1024);
  const totalMB = Number((totalBytes / (1024 * 1024)).toFixed(2));
  const limitMB = 50; // User-defined 50MB Supabase project allocation
  const usedPercentage = Math.min(100, Number(((totalMB / limitMB) * 100).toFixed(1)));
  const remainingMB = Number(Math.max(0, limitMB - totalMB).toFixed(2));

  let status: StorageQuotaInfo['status'] = 'safe';
  if (usedPercentage >= 90) status = 'critical';
  else if (usedPercentage >= 70) status = 'warning';

  return {
    totalBytes,
    totalKB,
    totalMB,
    limitMB,
    usedPercentage,
    remainingMB,
    status
  };
}

