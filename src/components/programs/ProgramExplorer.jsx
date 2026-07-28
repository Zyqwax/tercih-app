"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "../../context/AppContext";
import { cacheGet, cacheSet, cacheTime, fetchJson } from "../../lib/client-data";
import {
  cityOf,
  codeOf,
  emptyFilters,
  facultyOf,
  fmtInt,
  languageOf,
  normalized,
  num,
  programOf,
  scoreAt,
  uniOf,
} from "../../lib/program-utils";
import FilterPanel from "./FilterPanel";
import ProgramDetailModal from "./ProgramDetailModal";
import ProgramResults from "./ProgramResults";

const statusTone = {
  info: "border-sky-400/20 bg-sky-400/10 text-sky-200",
  success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  warn: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  error: "border-rose-400/20 bg-rose-400/10 text-rose-200",
};


export default function ProgramExplorer() {
  const { profile, preferences, ready, togglePreference } = useApp();
  const [filters, setFilters] = useState(emptyFilters);
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [lookups, setLookups] = useState({
    programs: [],
    cities: [],
    universities: [],
    languages: [],
  });
  const [programs, setPrograms] = useState([]);
  const [pageData, setPageData] = useState({ totalElements: 0, totalPages: 1 });
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({
    type: "info",
    text: "YÖK program verileri yükleniyor…",
  });
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [detailProgram, setDetailProgram] = useState(null);
  const initialized = useRef(false);
  const quickSearchUsed = useRef(false);

  const lookupOptions = (list, nameKeys, idKeys) => {
    const unique = new Map();
    list.forEach((item) => {
      const id = idKeys.map((key) => item?.[key]).find((value) => value != null);
      const name = nameKeys.map((key) => item?.[key]).find(Boolean);
      if (id != null && name && !unique.has(String(id))) unique.set(String(id), { id, name });
    });
    return [...unique.values()];
  };
  const programOptions = useMemo(
    () => lookupOptions(lookups.programs, ["birimGrupAdi", "birim_grup_adi"], ["birimGrupId", "birim_grup_id"]),
    [lookups.programs],
  );
  const cityOptions = useMemo(
    () => lookupOptions(lookups.cities, ["ilAdi", "il_adi"], ["ilKodu", "il_kodu"]),
    [lookups.cities],
  );
  const universityOptions = useMemo(
    () => lookupOptions(lookups.universities, ["universiteAdi", "universite_adi"], ["universiteId", "universite_id"]),
    [lookups.universities],
  );
  const languageOptions = useMemo(
    () =>
      lookupOptions(lookups.languages, ["ogrenimDiliAdi", "ogrenim_dili_adi"], ["ogrenimDiliId", "ogrenim_dili_id"]),
    [lookups.languages],
  );

  useEffect(() => {
    if (!ready || initialized.current) return;
    initialized.current = true;
    const initialFilters = {
      ...emptyFilters,
      scoreType: profile.scoreType || "SAY",
    };
    setFilters(initialFilters);
    loadLookups();
    search(0, initialFilters, [], []);
  }, [ready]);

  useEffect(() => {
    const refresh = () => refreshData();
    window.addEventListener("yok:refresh", refresh);
    return () => window.removeEventListener("yok:refresh", refresh);
  });

  useEffect(() => {
    if (!programOptions.length || !cityOptions.length || !universityOptions.length) return;
    const query = filters.query.trim();
    if (query.length === 1 || (!query && !quickSearchUsed.current)) return;
    const timer = window.setTimeout(() => {
      quickSearchUsed.current = Boolean(query);
      search(0, filters, selectedPrograms, selectedCities);
    }, 450);
    return () => window.clearTimeout(timer);
  }, [filters.query, programOptions, cityOptions, universityOptions]);

  async function loadLookups(forceRefresh = false) {
    const cached = !forceRefresh && (await cacheGet("lookups"));
    if (cached?.data) {
      setLookups(cached.data);
      return cached.data;
    }
    try {
      const liveData = await fetchJson(`/api/data/lookups${forceRefresh ? "?refresh=1" : ""}`);
      const next = {
        programs: liveData.programs || [],
        cities: liveData.cities || [],
        universities: liveData.universities || [],
        languages: liveData.languages || [],
        generatedAt: liveData.generatedAt,
      };
      setLookups(next);
      await cacheSet("lookups", next);
      return next;
    } catch (error) {
      setMessage({
        type: "error",
        text: `Referans verileri okunamadı: ${error.message}`,
      });
      return null;
    }
  }

  const setFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const addSelection = (kind) => {
    const isProgram = kind === "program",
      input = filters[kind].trim(),
      options = isProgram ? programOptions : cityOptions;
    if (!input) return;
    const found =
      options.find((item) => normalized(item.name) === normalized(input)) ||
      options.find((item) => normalized(item.name).includes(normalized(input)));
    if (!found)
      return setMessage({
        type: "warn",
        text: `“${input}” için eşleşme bulunamadı.`,
      });
    const list = isProgram ? selectedPrograms : selectedCities;
    if (!list.some((item) => String(item.id) === String(found.id)))
      (isProgram ? setSelectedPrograms : setSelectedCities)([...list, found]);
    setFilter(kind, "");
  };

  async function search(
    targetPage = 0,
    activeFilters = filters,
    activePrograms = selectedPrograms,
    activeCities = selectedCities,
    forceRefresh = false,
  ) {
    setLoading(true);
    setMessage({
      type: "info",
      text: forceRefresh ? "YÖK verileri yeniden sorgulanıyor…" : "Canlı YÖK verileri kontrol ediliyor…",
    });
    try {
      const query = normalized(activeFilters.query.trim());
      const exact = (items) => items.filter((item) => normalized(item.name) === query);
      const partial = (items) => items.filter((item) => normalized(item.name).includes(query)).slice(0, 100);
      let quickPrograms = [],
        quickCities = [],
        quickUniversities = [];
      if (query) {
        if (exact(cityOptions).length) quickCities = exact(cityOptions);
        else if (exact(programOptions).length) quickPrograms = exact(programOptions);
        else if (exact(universityOptions).length) quickUniversities = exact(universityOptions);
        else if (partial(programOptions).length) quickPrograms = partial(programOptions);
        else if (partial(universityOptions).length) quickUniversities = partial(universityOptions);
        else quickCities = partial(cityOptions);
      }
      const programIds = [...new Set([...activePrograms, ...quickPrograms].map((item) => Number(item.id)))];
      const cityIds = [...new Set([...activeCities, ...quickCities].map((item) => Number(item.id)))];
      const universityIds = [...new Set(quickUniversities.map((item) => Number(item.id)))];
      const requestBody = {
        filters: {
          query: activeFilters.query || null,
          puanTuru: activeFilters.scoreType || null,
          universiteId: universityIds,
          birimGrupId: programIds,
          ilKodu: cityIds,
          birimTuruId: activeFilters.degree ? Number(activeFilters.degree) : null,
          universiteTuru: activeFilters.uniType || null,
          ogrenimDili: activeFilters.language || null,
          minBasariSirasi: num(activeFilters.minRank),
          maxBasariSirasi: num(activeFilters.maxRank),
          minPuan: num(activeFilters.minScore),
          maxPuan: num(activeFilters.maxScore),
        },
        page: targetPage,
        size: 50,
        sortBy: "basariSirasi",
        direction: "ASC",
      };
      const cacheKey = `search:${JSON.stringify(requestBody)}`;
      const cached = !forceRefresh && (await cacheGet(cacheKey));
      const data =
        cached?.data ||
        (await fetchJson("/api/data/search", {
          method: "POST",
          body: JSON.stringify({ ...requestBody, forceRefresh }),
        }));
      if (!cached?.data) await cacheSet(cacheKey, data);
      setPrograms(Array.isArray(data.content) ? data.content : []);
      setPageData(data);
      setPage(targetPage);
      const guideYear = Number(data.yil || data.content?.[0]?.yil || new Date().getFullYear());
      const sourceText = cached?.savedAt
        ? `Tarayıcı önbelleği: ${cacheTime(cached.savedAt)}.`
        : data.cacheStatus === "hit"
          ? "Geçici sunucu önbelleği kullanıldı."
          : "Veriler YÖK API'den alındı.";
      setMessage({
        type: "success",
        text: `${fmtInt(data.totalElements ?? 0)} program bulundu. ${sourceText} ${guideYear} kılavuzu; sıralama ve taban puanlar ${guideYear - 1} yerleştirmesine aittir.`,
      });
    } catch (error) {
      setPrograms([]);
      setMessage({
        type: "error",
        text: `Veriler alınamadı: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  }

  const refreshData = async () => {
    await loadLookups(true);
    await search(page, filters, selectedPrograms, selectedCities, true);
  };
  const resetFilters = () => {
    const next = { ...emptyFilters, scoreType: profile.scoreType };
    setFilters(next);
    setSelectedPrograms([]);
    setSelectedCities([]);
    search(0, next, [], []);
  };
  const handleToggle = (program) => {
    const result = togglePreference(program);
    if (!result.ok) setMessage({ type: "warn", text: result.message });
  };
  const visiblePrograms = useMemo(
    () =>
      programs.filter((program) => {
        const haystack = normalized(
          [programOf(program), uniOf(program), cityOf(program), facultyOf(program), codeOf(program)].join(" "),
        );
        const queryTokens = normalized(filters.query).split(/\s+/).filter(Boolean);
        if (queryTokens.length && !queryTokens.every((token) => haystack.includes(token))) return false;
        if (filters.minScore && (scoreAt(program) ?? -Infinity) < Number(filters.minScore)) return false;
        if (filters.maxScore && (scoreAt(program) ?? Infinity) > Number(filters.maxScore)) return false;
        if (filters.language && !normalized(languageOf(program)).includes(normalized(filters.language))) return false;
        return true;
      }),
    [programs, filters.query, filters.minScore, filters.maxScore, filters.language],
  );

  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <FilterPanel
        open={filtersOpen}
        onToggle={() => setFiltersOpen(!filtersOpen)}
        filters={filters}
        setFilter={setFilter}
        selectedPrograms={selectedPrograms}
        selectedCities={selectedCities}
        setSelectedPrograms={setSelectedPrograms}
        setSelectedCities={setSelectedCities}
        programOptions={programOptions}
        cityOptions={cityOptions}
        languageOptions={languageOptions}
        addSelection={addSelection}
        preferenceCount={preferences.length}
        onReset={resetFilters}
        onApply={() => search(0)}
      />
      <div className={`mb-4 flex min-h-12 items-center rounded-2xl border px-4 py-3 text-sm font-medium leading-5 ${statusTone[message.type] || statusTone.info}`}>{message.text}</div>
      <section className="mb-4 grid gap-4 rounded-3xl border border-white/10 bg-slate-900/45 p-4 sm:p-5 lg:grid-cols-[minmax(20rem,1fr)_auto] lg:items-center">
        <div className="relative [&>span]:pointer-events-none [&>span]:absolute [&>span]:left-4 [&>span]:top-1/2 [&>span]:-translate-y-1/2 [&>span]:text-xl [&>span]:text-cyan-300 [&>input]:min-h-12 [&>input]:rounded-2xl [&>input]:pl-11 [&>input]:text-base">
          <span>⌕</span>
          <input
            value={filters.query}
            onChange={(event) => setFilter("query", event.target.value)}
            placeholder="Program, üniversite, şehir veya ÖSYM kodu ara…"
          />
        </div>
        <div className="min-w-fit [&>h2]:text-base [&>h2]:font-black [&>h2]:text-white [&>span]:text-xs [&>span]:text-slate-500">
          <h2>Programlar</h2>
          <span>
            {visiblePrograms.length} gösteriliyor · toplam {fmtInt(pageData.totalElements ?? 0)}
          </span>
        </div>
      </section>
      <ProgramResults
        programs={visiblePrograms}
        loading={loading}
        profile={profile}
        preferences={preferences}
        onTogglePreference={handleToggle}
        onDetails={setDetailProgram}
        page={page}
        pageData={pageData}
        onPage={(target) => search(target)}
      />
      <ProgramDetailModal program={detailProgram} onClose={() => setDetailProgram(null)} onMessage={setMessage} />
    </main>
  );
}
