import MultiPicker from "./MultiPicker";

export default function FilterPanel({
  open, onToggle, filters, setFilter, selectedPrograms, selectedCities,
  setSelectedPrograms, setSelectedCities, programOptions, cityOptions,
  languageOptions, addSelection, onReset, onApply,
}) {
  const fieldClass = "flex flex-col gap-2 [&>span]:sr-only [&_input]:min-h-12 [&_select]:min-h-12";
  return (
    <section className="mb-5 overflow-hidden rounded-xl border border-white/10 bg-slate-900/80 text-slate-200 shadow-2xl shadow-black/20">
      <header className="flex items-center justify-between border-b border-white/10 bg-slate-950/45 px-5 py-4">
        <button type="button" className="flex items-center gap-2 text-sm font-bold text-slate-200 transition hover:text-white" aria-expanded={open} onClick={onToggle}>
          <svg viewBox="0 0 20 20" fill="none" className={"size-4 transition-transform " + (open ? "rotate-0" : "-rotate-90")} aria-hidden="true"><path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Tercih Sihirbazı
        </button>
        <span className="hidden text-xs font-medium text-slate-500 sm:block">Sonuçları seçimlerine göre daralt</span>
      </header>
      {open && (
        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <label className={fieldClass}><span>Puan türü</span><select value={filters.scoreType} onChange={(event) => setFilter("scoreType", event.target.value)}><option value="">Puan Türü</option><option>SAY</option><option>EA</option><option>SÖZ</option><option>DİL</option><option>TYT</option></select></label>
            <label className={fieldClass}><span>Üniversite türü</span><select value={filters.uniType} onChange={(event) => setFilter("uniType", event.target.value)}><option value="">Üniversite Türü</option><option value="DEVLET">Devlet</option><option value="VAKIF">Vakıf</option></select></label>
            <MultiPicker label="Program" placeholder="Program" value={filters.program} onChange={(value) => setFilter("program", value)} onAdd={() => addSelection("program")} selected={selectedPrograms} onRemove={(id) => setSelectedPrograms(selectedPrograms.filter((item) => String(item.id) !== String(id)))} options={programOptions} />
            <MultiPicker label="Şehir" placeholder="Şehir" value={filters.city} onChange={(value) => setFilter("city", value)} onAdd={() => addSelection("city")} selected={selectedCities} onRemove={(id) => setSelectedCities(selectedCities.filter((item) => String(item.id) !== String(id)))} options={cityOptions} />
            <label className={fieldClass}><span>Öğrenim</span><select value={filters.degree} onChange={(event) => setFilter("degree", event.target.value)}><option value="">Ön Lisans / Lisans</option><option value="46">Lisans</option><option value="47">Önlisans</option></select></label>
            <label className={fieldClass}><span>Öğrenim dili</span><select value={filters.language} onChange={(event) => setFilter("language", event.target.value)}><option value="">Öğrenim Dili</option>{languageOptions.map((language) => <option key={language.id} value={language.name}>{language.name}</option>)}</select></label>
            <label className={fieldClass}><span>Minimum başarı sırası</span><input type="number" className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" value={filters.minRank} onChange={(event) => setFilter("minRank", event.target.value)} placeholder="En Az Başarı Sırası" /></label>
            <label className={fieldClass}><span>Maksimum başarı sırası</span><input type="number" className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" value={filters.maxRank} onChange={(event) => setFilter("maxRank", event.target.value)} placeholder="En Çok Başarı Sırası" /></label>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="button" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-emerald-400/50 bg-slate-900 px-4 py-2 text-sm font-bold text-emerald-600 transition hover:bg-emerald-400/10 focus-visible:ring-4 focus-visible:ring-emerald-500/15" onClick={onReset}>
              <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true"><path d="M6.5 6.5v8m3.5-8v8m3.5-8v8M4.5 4h11M8 4V2.8h4V4m-6.5 0 .7 12h7.6l.7-12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>Temizle
            </button>
            <button type="button" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-emerald-600 bg-emerald-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:border-emerald-700 hover:bg-emerald-700 focus-visible:ring-4 focus-visible:ring-emerald-500/20" onClick={onApply}>
              <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5" stroke="currentColor" strokeWidth="1.7" /><path d="m12.5 12.5 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>Ara
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
