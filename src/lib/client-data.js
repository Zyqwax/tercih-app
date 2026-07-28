const CACHE_DB = "yokTercih.live-cache.v4";
const CACHE_STORE = "responses";
const LEGACY_DATABASES = ["yokTercih.static-data.v3"];
const MAX_CACHE_ENTRIES = 100;
let legacyCleanupStarted = false;

const ttlFor = (key) => key === "lookups" ? 6 * 60 * 60 * 1000 : key.startsWith("netler:") ? 30 * 60 * 1000 : 10 * 60 * 1000;

export async function fetchJson(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { Accept: "application/json", "Content-Type": "application/json", ...options.headers } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function openCache() {
  if (!legacyCleanupStarted) {
    legacyCleanupStarted = true;
    for (const name of LEGACY_DATABASES) indexedDB.deleteDatabase(name);
  }
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(CACHE_DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(CACHE_STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function cacheGet(key) {
  try {
    const db = await openCache();
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(CACHE_STORE, "readonly");
      const request = transaction.objectStore(CACHE_STORE).get(key);
      request.onsuccess = () => {
        const entry = request.result || null;
        if (entry && Date.now() - Number(entry.savedAt || 0) > ttlFor(key)) {
          resolve(null);
          setTimeout(() => cacheDelete(key), 0);
        } else resolve(entry);
      };
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => db.close();
    });
  } catch { return null; }
}

async function cacheDelete(key) {
  try {
    const db = await openCache();
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(CACHE_STORE, "readwrite");
      transaction.objectStore(CACHE_STORE).delete(key);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
    db.close();
  } catch {}
}

export async function cacheSet(key, data) {
  try {
    const db = await openCache();
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(CACHE_STORE, "readwrite");
      const store = transaction.objectStore(CACHE_STORE);
      store.put({ data, savedAt: Date.now() }, key);
      const keys = store.getAllKeys();
      keys.onsuccess = () => keys.result.slice(0, Math.max(0, keys.result.length - MAX_CACHE_ENTRIES + 1)).forEach((oldKey) => store.delete(oldKey));
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
    db.close();
  } catch {}
}

export const cacheTime = (savedAt) => new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "medium" }).format(new Date(savedAt));
