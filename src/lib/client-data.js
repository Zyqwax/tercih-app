const CACHE_DB = "yokTercih.live-cache.v4";
const CACHE_STORE = "responses";
const LEGACY_DATABASES = ["yokTercih.static-data.v3"];
const MAX_CACHE_ENTRIES = 100;

let dbPromise = null;
let legacyCleanupDone = false;

const ttlFor = (key) =>
  key === "lookups"
    ? 6 * 60 * 60 * 1000
    : key.startsWith("netler:")
    ? 30 * 60 * 1000
    : 10 * 60 * 1000;

export async function fetchJson(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function getDatabase() {
  if (typeof window === "undefined" || !window.indexedDB) return Promise.resolve(null);
  
  if (!legacyCleanupDone) {
    legacyCleanupDone = true;
    for (const name of LEGACY_DATABASES) {
      try { indexedDB.deleteDatabase(name); } catch {}
    }
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(CACHE_DB, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(CACHE_STORE);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        dbPromise = null;
        reject(request.error);
      };
    });
  }
  return dbPromise;
}

export async function cacheGet(key) {
  try {
    const db = await getDatabase();
    if (!db) return null;
    return await new Promise((resolve) => {
      const transaction = db.transaction(CACHE_STORE, "readonly");
      const request = transaction.objectStore(CACHE_STORE).get(key);
      request.onsuccess = () => {
        const entry = request.result || null;
        if (entry && Date.now() - Number(entry.savedAt || 0) > ttlFor(key)) {
          resolve(null);
          cacheDelete(key);
        } else {
          resolve(entry);
        }
      };
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function cacheDelete(key) {
  try {
    const db = await getDatabase();
    if (!db) return;
    const transaction = db.transaction(CACHE_STORE, "readwrite");
    transaction.objectStore(CACHE_STORE).delete(key);
  } catch {}
}

export async function cacheSet(key, data) {
  try {
    const db = await getDatabase();
    if (!db) return;
    const transaction = db.transaction(CACHE_STORE, "readwrite");
    const store = transaction.objectStore(CACHE_STORE);
    store.put({ data, savedAt: Date.now() }, key);
    const keysRequest = store.getAllKeys();
    keysRequest.onsuccess = () => {
      const keys = keysRequest.result || [];
      if (keys.length > MAX_CACHE_ENTRIES) {
        keys.slice(0, keys.length - MAX_CACHE_ENTRIES).forEach((oldKey) => store.delete(oldKey));
      }
    };
  } catch {}
}

export const cacheTime = (savedAt) =>
  new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "medium" }).format(new Date(savedAt));
