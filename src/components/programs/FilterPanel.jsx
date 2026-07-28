import Link from "next/link";
import MultiPicker from "./MultiPicker";

export default function FilterPanel({
  open,
  onToggle,
  filters,
  setFilter,
  selectedPrograms,
  selectedCities,
  setSelectedPrograms,
  setSelectedCities,
  programOptions,
  cityOptions,
  languageOptions,
  addSelection,
  preferenceCount = 0,
  onReset,
  onApply,
}) {
  const fieldClass =
    "flex min-w-0 flex-col gap-1 [&>span]:px-0.5 [&>span]:text-[10px] [&>span]:font-semibold [&>span]:text-slate-400 [&_input]:h-9 [&_input]:rounded-md [&_input]:border-slate-700/80 [&_input]:bg-[#2d2d30] [&_input]:px-2.5 [&_input]:py-1 [&_input]:text-xs [&_input]:text-slate-100 [&_input]:placeholder:text-slate-500 [&_input]:focus:border-blue-500 [&_input]:focus:ring-2 [&_input]:focus:ring-blue-500/20 [&_select]:h-9 [&_select]:rounded-md [&_select]:border-slate-700/80 [&_select]:bg-[#2d2d30] [&_select]:px-2.5 [&_select]:py-1.5 [&_select]:text-xs [&_select]:text-slate-100 [&_select]:focus:border-blue-500 [&_select]:focus:ring-2 [&_select]:focus:ring-blue-500/20";

  return (
    <section className="mb-5 overflow-hidden rounded-xl border border-slate-700/70 bg-slate-900 text-slate-200 shadow-2xl shadow-black/20">
      <button
        type="button"
        className="flex w-full items-center justify-between bg-[#2d2d30] px-5 py-4 text-left text-sm font-bold text-slate-200 transition hover:bg-[#323235] hover:text-white"
        aria-expanded={open}
        onClick={onToggle}
      >
        <span>Filtreleme &amp; Tercih Rehberi</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={"size-4 text-blue-400 transition-transform " + (open ? "rotate-180" : "rotate-0")}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 15 6-6 6 6" />
        </svg>
      </button>

      {open && (
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-x-3 gap-y-3 sm:grid-cols-2 xl:grid-cols-4">
            <label className={fieldClass}>
              <span>Puan Türü</span>
              <select value={filters.scoreType} onChange={(event) => setFilter("scoreType", event.target.value)}>
                <option value="">Tümü</option>
                <option>SAY</option>
                <option>EA</option>
                <option>SÖZ</option>
                <option>DİL</option>
                <option>TYT</option>
              </select>
            </label>

            <MultiPicker
              label="Program"
              placeholder="Tümü"
              value={filters.program}
              onChange={(value) => setFilter("program", value)}
              onAdd={() => addSelection("program")}
              selected={selectedPrograms}
              onRemove={(id) => setSelectedPrograms(selectedPrograms.filter((item) => String(item.id) !== String(id)))}
              options={programOptions}
            />
            <MultiPicker
              label="Şehir"
              placeholder="Tümü"
              value={filters.city}
              onChange={(value) => setFilter("city", value)}
              onAdd={() => addSelection("city")}
              selected={selectedCities}
              onRemove={(id) => setSelectedCities(selectedCities.filter((item) => String(item.id) !== String(id)))}
              options={cityOptions}
            />

            <label className={fieldClass}>
              <span>Ön Lisans / Lisans</span>
              <select value={filters.degree} onChange={(event) => setFilter("degree", event.target.value)}>
                <option value="">Tümü</option>
                <option value="46">Lisans</option>
                <option value="47">Ön Lisans</option>
              </select>
            </label>

            <label className={fieldClass}>
              <span>Üniversite Türü</span>
              <select value={filters.uniType} onChange={(event) => setFilter("uniType", event.target.value)}>
                <option value="">Tümü</option>
                <option value="DEVLET">Devlet</option>
                <option value="VAKIF">Vakıf</option>
              </select>
            </label>

            <label className={fieldClass}>
              <span>Eğitim Dili</span>
              <select value={filters.language} onChange={(event) => setFilter("language", event.target.value)}>
                <option value="">Tümü</option>
                {languageOptions.map((language) => (
                  <option key={language.id} value={language.name}>
                    {language.name}
                  </option>
                ))}
              </select>
            </label>

            <label className={fieldClass}>
              <span>En Az Başarı Sırası</span>
              <input
                type="number"
                inputMode="numeric"
                className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                value={filters.minRank}
                onChange={(event) => setFilter("minRank", event.target.value)}
                placeholder="Örn: 50.000"
              />
            </label>

            <label className={fieldClass}>
              <span>En Çok Başarı Sırası</span>
              <input
                type="number"
                inputMode="numeric"
                className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                value={filters.maxRank}
                onChange={(event) => setFilter("maxRank", event.target.value)}
                placeholder="Örn: 150.000"
              />
            </label>
          </div>

          <div className="mt-8 flex flex-col gap-4 border-t border-slate-700/70 pt-7 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/tercihler"
              className="inline-flex min-h-10 w-fit items-center gap-2 rounded-lg border border-slate-600 bg-[#2d2d30] px-4 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-[#363639]"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="size-4"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
                />
              </svg>
              Tercih Listem <span className="text-slate-300">({preferenceCount})</span>
            </Link>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-blue-500 px-4 text-sm font-semibold text-blue-400 transition hover:bg-blue-500/10 hover:text-blue-300"
                onClick={onReset}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="size-4"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14M10 10v6m4-6v6"
                  />
                </svg>
                Temizle
              </button>
              <button
                type="button"
                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
                onClick={onApply}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="size-4"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path strokeLinecap="round" d="m20 20-4-4" />
                </svg>
                Ara
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
