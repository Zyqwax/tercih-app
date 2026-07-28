const API_BASE = (process.env.YOK_API_BASE || "https://yokatlas.yok.gov.tr/api").replace(/\/$/, "");
const LOOKUP_TTL = 6 * 60 * 60 * 1000;
const SEARCH_TTL = Math.max(60_000, Number(process.env.YOK_CACHE_TTL_MS) || 10 * 60 * 1000);
const MAX_CACHE_ENTRIES = 250;
const cache = globalThis.__yokApiMemoryCache || new Map();
globalThis.__yokApiMemoryCache = cache;

const DISPLAY_FIELDS = new Set(["universiteAdi", "birimAdi", "birimGrupAdi", "ilAdi", "uniIlAdi", "uniIlceAdi", "ilceAdi", "fymkAdi", "fymkIlAdi", "fymkIlceAdi", "ogrenimDiliAdi", "bursOraniAdi", "ogrenimTuruAdi"]);
const ACRONYMS = new Set(["AB", "ABD", "AYT", "DGS", "İİBF", "KKTC", "MEB", "MYO", "ÖSYM", "TÖMER", "TR", "TYT", "YDT", "YKS"]);
const COMMON_LANGUAGES = ["Türkçe", "İngilizce", "Almanca", "Fransızca", "Arapça", "Rusça"].map((name, index) => ({ ogrenimDiliId: `live-${index + 1}`, ogrenimDiliAdi: name }));

const normalized = (value = "") => String(value ?? "").toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i").replace(/[^a-z0-9]+/g, " ").trim();
const positiveNumber = (value) => { const number = Number(value); return Number.isFinite(number) && number > 0 ? number : null; };
const asIds = (value) => [...new Set((Array.isArray(value) ? value : value == null ? [] : [value]).map(Number).filter(Number.isFinite))];

function titleWord(value) {
  const upper = value.toLocaleUpperCase("tr-TR");
  if (ACRONYMS.has(upper) || /^\d+$/.test(value)) return upper;
  const lower = value.toLocaleLowerCase("tr-TR");
  return lower ? lower[0].toLocaleUpperCase("tr-TR") + lower.slice(1) : lower;
}

function smartTitle(value) {
  if (!value || typeof value !== "string") return value;
  return String(value).normalize("NFC").replace(/\s+/g, " ").trim().split(/([\s/()\[\],-]+)/).map((part) => /^[\s/()\[\],-]+$/.test(part) ? part : titleWord(part)).join("").replace(/\b(Ve|İle|Veya|İçin)\b/g, (word) => word.toLocaleLowerCase("tr-TR"));
}

function cleanRecord(record) {
  const result = { ...record };
  for (const field of DISPLAY_FIELDS) if (typeof result[field] === "string") result[field] = smartTitle(result[field]);
  return result;
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function pruneMemoryCache() {
  const now = Date.now();
  for (const [key, entry] of cache) if (!entry?.promise && entry?.expiresAt <= now) cache.delete(key);
  while (cache.size > MAX_CACHE_ENTRIES) cache.delete(cache.keys().next().value);
}

async function requestYok(path, { method = "GET", body, ttl = SEARCH_TTL, forceRefresh = false } = {}) {
  const key = `${method}:${path}:${body ? JSON.stringify(body) : ""}`;
  const existing = cache.get(key);
  const now = Date.now();
  if (!forceRefresh && existing?.data && existing.expiresAt > now) return { ...existing, cacheStatus: "hit" };
  if (!forceRefresh && existing?.promise) return existing.promise;

  const promise = (async () => {
    let lastError;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const response = await fetch(`${API_BASE}${path}`, {
          method,
          headers: { Accept: "application/json", "Content-Type": "application/json", "User-Agent": "Mozilla/5.0 (compatible; YOK-Tercih-Assistant/4.0)", Referer: "https://yokatlas.yok.gov.tr/", Origin: "https://yokatlas.yok.gov.tr" },
          body: body ? JSON.stringify(body) : undefined,
          cache: "no-store",
          signal: AbortSignal.timeout(20_000),
        });
        if (!response.ok) throw new Error(`YÖK Atlas HTTP ${response.status}`);
        const entry = { data: await response.json(), fetchedAt: new Date().toISOString(), expiresAt: Date.now() + ttl, cacheStatus: "miss" };
        cache.delete(key);
        cache.set(key, entry);
        pruneMemoryCache();
        return entry;
      } catch (error) {
        lastError = error;
        if (attempt === 0) await sleep(350);
      }
    }
    if (existing?.data) return { ...existing, cacheStatus: "stale" };
    throw lastError;
  })();
  cache.set(key, { ...existing, promise });
  try { return await promise; }
  finally { const current = cache.get(key); if (current?.promise === promise && !current.data) cache.delete(key); }
}

function rowsOf(response) {
  return Array.isArray(response) ? response : Array.isArray(response?.content) ? response.content : [];
}

export async function getLookups(forceRefresh = false) {
  const [programResponse, cityResponse, universityResponse] = await Promise.all([
    requestYok("/tercih-kilavuz/universite-programlar", { ttl: LOOKUP_TTL, forceRefresh }),
    requestYok("/tercih-kilavuz/universite-iller", { ttl: LOOKUP_TTL, forceRefresh }),
    requestYok("/tercih-kilavuz/universiteler", { ttl: LOOKUP_TTL, forceRefresh }),
  ]);
  return {
    programs: rowsOf(programResponse.data).map(cleanRecord),
    cities: rowsOf(cityResponse.data).map(cleanRecord),
    universities: rowsOf(universityResponse.data).map(cleanRecord),
    languages: COMMON_LANGUAGES,
    generatedAt: programResponse.fetchedAt,
    source: "yok-api",
    cacheStatus: [programResponse, cityResponse, universityResponse].every((item) => item.cacheStatus === "hit") ? "hit" : "miss",
  };
}

function optionTokens(value) {
  return normalized(value).split(/\s+/).filter(Boolean);
}

function tokenMatches(optionToken, queryToken) {
  return optionToken === queryToken || (queryToken.length >= 2 && optionToken.startsWith(queryToken));
}

// Optimized linear lookup match (replaces 3^N exponential recursion)
function resolveTextQuery(query, lookups) {
  const queryNorm = normalized(query);
  if (!queryNorm) return null;
  const tokens = queryNorm.split(/\s+/).filter(Boolean).slice(0, 6);
  if (!tokens.length) return null;

  const matchCategory = (options, nameKey, idKey) => {
    return options
      .filter((opt) => {
        const nameNorm = normalized(opt[nameKey]);
        return tokens.some((t) => nameNorm.includes(t));
      })
      .map((opt) => Number(opt[idKey]))
      .filter(Number.isFinite);
  };

  const birimGrupId = matchCategory(lookups.programs || [], "birimGrupAdi", "birimGrupId");
  const universiteId = matchCategory(lookups.universities || [], "universiteAdi", "universiteId");
  const ilKodu = matchCategory(lookups.cities || [], "ilAdi", "ilKodu");

  return { birimGrupId, universiteId, ilKodu };
}

function mergeIds(existing, derived) {
  const current = asIds(existing);
  const next = asIds(derived);
  if (!next.length) return current;
  if (!current.length) return next;
  const allowed = new Set(next);
  return current.filter((id) => allowed.has(id));
}

function liveFilters(filters, resolved) {
  return {
    puanTuru: filters.puanTuru || null,
    universiteId: mergeIds(filters.universiteId, resolved?.universiteId),
    birimGrupId: mergeIds(filters.birimGrupId, resolved?.birimGrupId),
    ilKodu: mergeIds(filters.ilKodu, resolved?.ilKodu),
    birimTuruId: filters.birimTuruId || null,
    universiteTuru: filters.universiteTuru || null,
    bursOraniId: filters.bursOraniId || null,
    ogrenimTuruId: filters.ogrenimTuruId || null,
    kilavuzKodu: filters.kilavuzKodu || null,
    minBasariSirasi: filters.minBasariSirasi ?? null,
    maxBasariSirasi: filters.maxBasariSirasi ?? null,
  };
}

function matchesLocalFilters(program, filters) {
  const haystack = normalized([program.birimAdi, program.birimGrupAdi, program.universiteAdi, program.ilAdi, program.fymkAdi, program.kilavuzKodu].filter(Boolean).join(" "));
  const queryTokens = optionTokens(filters.query);
  if (queryTokens.length && !queryTokens.every((token) => haystack.split(/\s+/).some((word) => tokenMatches(word, token)))) return false;
  if (filters.ogrenimDili && !normalized(program.ogrenimDiliAdi).includes(normalized(filters.ogrenimDili))) return false;
  const score = positiveNumber(program.minPuan ?? program.min_puan);
  if (filters.minPuan != null && (!score || score < Number(filters.minPuan))) return false;
  if (filters.maxPuan != null && (!score || score > Number(filters.maxPuan))) return false;
  return true;
}

export async function searchPrograms(payload = {}) {
  const filters = payload.filters || {};
  const page = Math.max(0, Number(payload.page) || 0);
  const size = Math.min(100, Math.max(1, Number(payload.size) || 50));
  const lookups = filters.query ? await getLookups(Boolean(payload.forceRefresh)) : null;
  const resolved = filters.query ? resolveTextQuery(filters.query, lookups) : null;
  const needsLocalFilter = Boolean(filters.query || filters.ogrenimDili || filters.minPuan != null || filters.maxPuan != null);
  const upstreamSize = needsLocalFilter ? Math.min(1000, Math.max(250, size * 5)) : size;
  const requestedOffset = page * size;
  const upstreamPage = needsLocalFilter ? Math.floor(requestedOffset / upstreamSize) : page;
  const body = { filters: liveFilters(filters, resolved), page: upstreamPage, size: upstreamSize, sortBy: "basariSirasi", direction: "ASC" };
  const response = await requestYok("/tercih-kilavuz/search", { method: "POST", body, ttl: SEARCH_TTL, forceRefresh: Boolean(payload.forceRefresh) });
  const allRows = rowsOf(response.data).map(cleanRecord);
  const filtered = needsLocalFilter ? allRows.filter((program) => matchesLocalFilters(program, filters)) : allRows;
  const offset = needsLocalFilter ? requestedOffset % upstreamSize : 0;
  const content = needsLocalFilter ? filtered.slice(offset, offset + size) : filtered;
  const upstreamTotal = Number(response.data.totalElements ?? response.data.total_elements ?? content.length);
  return { ...response.data, content, page, size, totalElements: upstreamTotal, totalPages: Math.max(1, Math.ceil(upstreamTotal / size)), first: page === 0, last: (page + 1) * size >= upstreamTotal, source: "yok-api", cacheStatus: response.cacheStatus, fetchedAt: response.fetchedAt, filteredLocally: needsLocalFilter };
}

export async function searchNetRows(payload = {}) {
  const filters = payload.filters || {};
  const body = { filters: { puanTuru: filters.puanTuru || null, universiteId: filters.universiteId || null, birimGrupId: filters.birimGrupId || null, birimTuruId: filters.birimTuruId || null, universiteTuru: filters.universiteTuru || null, yil: filters.yil || null, katsayi: filters.katsayi || null, kilavuzKodu: filters.kilavuzKodu || null }, page: Math.max(0, Number(payload.page) || 0), size: Math.min(100, Math.max(1, Number(payload.size) || 20)), sortBy: "yil", direction: "DESC" };
  const response = await requestYok("/netler/search", { method: "POST", body, ttl: 30 * 60 * 1000, forceRefresh: Boolean(payload.forceRefresh) });
  return { ...response.data, content: rowsOf(response.data).map(cleanRecord), source: "yok-api", cacheStatus: response.cacheStatus, fetchedAt: response.fetchedAt };
}

export async function getAdvisorCandidates(profile = {}, answers = {}, limit = 80) {
  const userRank = positiveNumber(profile.rank);
  if (!userRank || !profile.scoreType) return [];
  const lookups = await getLookups();
  const programIds = String(answers.fields || "").split(",").map((phrase) => resolveTextQuery(phrase, lookups)?.birimGrupId || []).flat();
  const cityIds = String(answers.cities || "").split(",").map((phrase) => resolveTextQuery(phrase, lookups)?.ilKodu || []).flat();
  const body = { filters: { puanTuru: profile.scoreType, universiteId: [], birimGrupId: asIds(programIds), ilKodu: answers.cityMode === "strict" ? asIds(cityIds) : [], birimTuruId: Number(answers.degree) || null, universiteTuru: answers.universityType || null, bursOraniId: null, ogrenimTuruId: null, kilavuzKodu: null, minBasariSirasi: Math.floor(userRank / 2.4), maxBasariSirasi: Math.ceil(userRank * 2.6) }, page: 0, size: Math.min(500, Math.max(150, Number(limit) * 5)), sortBy: "basariSirasi", direction: "ASC" };
  const response = await requestYok("/tercih-kilavuz/search", { method: "POST", body, ttl: SEARCH_TTL });
  const fieldPhrases = String(answers.fields || "").split(",").map(normalized).filter(Boolean);
  const cityPhrases = String(answers.cities || "").split(",").map(normalized).filter(Boolean);
  const language = normalized(answers.language);
  const targetRatio = answers.riskStyle === "ambitious" ? 1.18 : answers.riskStyle === "safe" ? 0.78 : 1;
  return rowsOf(response.data).map(cleanRecord).filter((program) => {
    if (language && !normalized(program.ogrenimDiliAdi).includes(language)) return false;
    if (fieldPhrases.length && !fieldPhrases.some((phrase) => phrase.split(/\s+/).every((token) => optionTokens(`${program.birimGrupAdi} ${program.birimAdi}`).some((word) => tokenMatches(word, token))))) return false;
    return true;
  }).map((program) => {
    const rank = positiveNumber(program.basariSirasi);
    const preferredCity = cityPhrases.some((city) => normalized(program.ilAdi).includes(city));
    const score = rank ? 100 - Math.abs(userRank / rank - targetRatio) * 55 + (preferredCity ? 25 : 0) : -Infinity;
    return { program, score };
  }).sort((left, right) => right.score - left.score).slice(0, Math.max(20, Math.min(120, Number(limit) || 80))).map((item) => item.program);
}
