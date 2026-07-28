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
  return (
    <section
      style={{
        marginBottom: "1.25rem",
        overflow: "hidden",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--border-subtle)",
        background: "var(--bg-surface)",
      }}
    >
      {/* Toggle header */}
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        style={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.875rem 1.25rem",
          background: "var(--bg-elevated)",
          border: "none",
          borderBottom: open ? "1px solid var(--border-subtle)" : "none",
          cursor: "pointer",
          color: "var(--text-secondary)",
          transition: "color 0.15s ease",
          gap: "0.75rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <div
            style={{
              width: "1.625rem",
              height: "1.625rem",
              display: "grid",
              placeItems: "center",
              borderRadius: "var(--radius-sm)",
              background: "rgba(56,189,248,0.1)",
              color: "var(--primary-300)",
              fontSize: "0.75rem",
              flexShrink: 0,
            }}
          >
            ⚡
          </div>
          <span
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
            }}
          >
            Filtreleme &amp; Tercih Rehberi
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
          <span
            className="hidden sm:inline"
            style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
          >
            {open ? "Gizle" : "Göster"}
          </span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{
              width: "1rem",
              height: "1rem",
              color: "var(--text-muted)",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m6 15 6-6 6 6" />
          </svg>
        </div>
      </button>

      {open && (
        <div style={{ padding: "1.25rem 1.5rem" }}>
          {/* Filter grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(1, 1fr)",
              gap: "1rem",
            }}
            className="sm:grid-cols-2 lg:grid-cols-4"
          >
            {/* Puan Türü */}
            <label style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              <span className="form-label">Puan Türü</span>
              <select value={filters.scoreType} onChange={(e) => setFilter("scoreType", e.target.value)}>
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
              placeholder="Tümü (ör. Bilgisayar Mühendisliği)"
              value={filters.program}
              onChange={(v) => setFilter("program", v)}
              onAdd={() => addSelection("program")}
              selected={selectedPrograms}
              onRemove={(id) => setSelectedPrograms(selectedPrograms.filter((i) => String(i.id) !== String(id)))}
              options={programOptions}
            />

            <MultiPicker
              label="Şehir"
              placeholder="Tümü (ör. İstanbul)"
              value={filters.city}
              onChange={(v) => setFilter("city", v)}
              onAdd={() => addSelection("city")}
              selected={selectedCities}
              onRemove={(id) => setSelectedCities(selectedCities.filter((i) => String(i.id) !== String(id)))}
              options={cityOptions}
            />

            {/* Ön Lisans / Lisans */}
            <label style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              <span className="form-label">Ön Lisans / Lisans</span>
              <select value={filters.degree} onChange={(e) => setFilter("degree", e.target.value)}>
                <option value="">Tümü</option>
                <option value="46">Lisans</option>
                <option value="47">Ön Lisans</option>
              </select>
            </label>

            {/* Üniversite Türü */}
            <label style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              <span className="form-label">Üniversite Türü</span>
              <select value={filters.uniType} onChange={(e) => setFilter("uniType", e.target.value)}>
                <option value="">Tümü</option>
                <option value="DEVLET">Devlet</option>
                <option value="VAKIF">Vakıf</option>
              </select>
            </label>

            {/* Eğitim Dili */}
            <label style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              <span className="form-label">Eğitim Dili</span>
              <select value={filters.language} onChange={(e) => setFilter("language", e.target.value)}>
                <option value="">Tümü</option>
                {languageOptions.map((lang) => (
                  <option key={lang.id} value={lang.name}>{lang.name}</option>
                ))}
              </select>
            </label>

            {/* Min Sıra */}
            <label style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              <span className="form-label">En Az Başarı Sırası</span>
              <input
                type="number"
                inputMode="numeric"
                className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                value={filters.minRank}
                onChange={(e) => setFilter("minRank", e.target.value)}
                placeholder="Örn: 50.000"
              />
            </label>

            {/* Max Sıra */}
            <label style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              <span className="form-label">En Çok Başarı Sırası</span>
              <input
                type="number"
                inputMode="numeric"
                className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                value={filters.maxRank}
                onChange={(e) => setFilter("maxRank", e.target.value)}
                placeholder="Örn: 150.000"
              />
            </label>
          </div>

          {/* Footer actions */}
          <div
            style={{
              marginTop: "1.25rem",
              paddingTop: "1rem",
              borderTop: "1px solid var(--border-subtle)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.75rem",
            }}
          >
            {/* Tercih link */}
            <Link
              href="/tercihler"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 0.875rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-soft)",
                background: "var(--bg-elevated)",
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: "var(--text-secondary)",
                textDecoration: "none",
                transition: "all 0.15s ease",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "1rem", height: "1rem", color: "var(--primary-300)" }} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
              </svg>
              Tercih Listem
              <span
                style={{
                  padding: "0.125rem 0.5rem",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(56,189,248,0.1)",
                  color: "var(--info-text)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                }}
              >
                {preferenceCount}
              </span>
            </Link>

            {/* Action buttons */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              <button type="button" className="btn-danger" onClick={onReset}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "0.875rem", height: "0.875rem" }} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14M10 10v6m4-6v6" />
                </svg>
                Sıfırla
              </button>
              <button type="button" className="btn-primary" onClick={onApply}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: "0.875rem", height: "0.875rem" }} aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path strokeLinecap="round" d="m20 20-4-4" />
                </svg>
                Filtrele
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
