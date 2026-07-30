"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useApp } from "../../context/AppContext";
import { cityOf, codeOf, fmtInt, placementYearOf, programOf, rankAt, riskOf, scoreTypeOf, uniOf } from "../../lib/program-utils";

/* ── Tone maps ────────────────────────────────────────────────────────── */
const toneStyle = {
  reach:   { borderColor: "var(--warning-border)", background: "var(--warning-bg)", color: "var(--warning-text)" },
  down:    { borderColor: "var(--danger-border)",  background: "var(--danger-bg)",  color: "var(--danger-text)" },
  target:  { borderColor: "var(--info-border)",    background: "var(--info-bg)",    color: "var(--info-text)" },
  flat:    { borderColor: "var(--info-border)",    background: "var(--info-bg)",    color: "var(--info-text)" },
  unknown: { borderColor: "var(--border-soft)",    background: "var(--bg-elevated)", color: "var(--text-muted)" },
  safe:    { borderColor: "var(--success-border)", background: "var(--success-bg)", color: "var(--success-text)" },
  up:      { borderColor: "var(--success-border)", background: "var(--success-bg)", color: "var(--success-text)" },
};

const riskCountStyle = [
  { key: "reach",   label: "İddialı",  ...{ border: "var(--warning-border)", bg: "var(--warning-bg)",  text: "var(--warning-text)" } },
  { key: "target",  label: "Dengeli",  ...{ border: "var(--info-border)",    bg: "var(--info-bg)",    text: "var(--info-text)" } },
  { key: "safe",    label: "Güvenli",  ...{ border: "var(--success-border)", bg: "var(--success-bg)", text: "var(--success-text)" } },
  { key: "unknown", label: "Belirsiz", ...{ border: "var(--border-soft)",    bg: "var(--bg-elevated)", text: "var(--text-muted)" } },
];

export default function PreferencesPageContent() {
  const { profile, preferences, savePreferences, togglePreference } = useApp();
  const [message, setMessage] = useState("");
  const [draggedCode, setDraggedCode] = useState(null);
  const [dragOverCode, setDragOverCode] = useState(null);
  const fileRef = useRef(null);
  const dragRef = useRef(null);

  const counts = useMemo(
    () =>
      preferences.reduce(
        (all, program) => ({
          ...all,
          [riskOf(program, profile).key]: (all[riskOf(program, profile).key] || 0) + 1,
        }),
        { reach: 0, target: 0, safe: 0, unknown: 0 }
      ),
    [preferences, profile]
  );

  const smartSort = () => {
    const riskOrder = { reach: 0, target: 1, safe: 2, unknown: 3 };
    const next = [...preferences].sort(
      (l, r) =>
        riskOrder[riskOf(l, profile).key] - riskOrder[riskOf(r, profile).key] ||
        (rankAt(l) ?? Number.MAX_SAFE_INTEGER) - (rankAt(r) ?? Number.MAX_SAFE_INTEGER)
    );
    savePreferences(next);
    setMessage("Tercihlerin risk dağılımı ve başarı sırasına göre akıllı sıralandı.");
  };

  const movePreference = (sourceCode, targetCode) => {
    const sourceIndex = preferences.findIndex(
      (program) => String(codeOf(program)) === String(sourceCode)
    );
    const targetIndex = preferences.findIndex(
      (program) => String(codeOf(program)) === String(targetCode)
    );
    if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return false;

    const next = [...preferences];
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);
    savePreferences(next);
    setMessage(`${sourceIndex + 1}. sıradaki tercih ${targetIndex + 1}. sıraya taşındı.`);
    return true;
  };

  const finishDragging = (handle) => {
    const drag = dragRef.current;
    if (drag?.pointerId != null && handle?.hasPointerCapture?.(drag.pointerId)) {
      handle.releasePointerCapture(drag.pointerId);
    }
    dragRef.current = null;
    setDraggedCode(null);
    setDragOverCode(null);
  };

  const startDragging = (event, programCode) => {
    if (!event.isPrimary || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      sourceCode: String(programCode),
      targetCode: String(programCode),
    };
    setDraggedCode(String(programCode));
    setDragOverCode(String(programCode));
  };

  const updateDragTarget = (event) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    const row = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest("[data-preference-code]");
    const targetCode = row?.dataset.preferenceCode;
    if (!targetCode || targetCode === dragRef.current.targetCode) return;
    dragRef.current.targetCode = targetCode;
    setDragOverCode(targetCode);
  };

  const dropPreference = (event) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    const { sourceCode, targetCode } = dragRef.current;
    movePreference(sourceCode, targetCode);
    finishDragging(event.currentTarget);
  };

  const movePreferenceWithKeyboard = (event, programCode, index) => {
    const destinations = {
      ArrowUp: Math.max(0, index - 1),
      ArrowDown: Math.min(preferences.length - 1, index + 1),
      Home: 0,
      End: preferences.length - 1,
    };
    if (!(event.key in destinations)) return;
    event.preventDefault();
    const targetIndex = destinations[event.key];
    if (targetIndex === index) return;
    movePreference(programCode, codeOf(preferences[targetIndex]));
  };

  const exportPreferences = () => {
    const blob = new Blob([JSON.stringify({ profile, preferences }, null, 2)], { type: "application/json" });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = "tercih-listem.json";
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  };

  const importPreferences = async (file) => {
    try {
      const parsed = JSON.parse(await file.text());
      const next = Array.isArray(parsed) ? parsed : parsed.preferences;
      if (!Array.isArray(next)) throw new Error();
      savePreferences(next);
      setMessage("Tercih listesi başarıyla içe aktarıldı.");
    } catch {
      setMessage("Tercih dosyası okunamadı. Lütfen geçerli bir JSON dosyası seçin.");
    }
  };

  return (
    <main className="preferences-page">
      <header className="prefs-header prefs-screen-only">
        <div>
          <span className="badge">Tercih Yönetimi</span>
          <h1>Tercih Listem</h1>
          <p>
            <strong>{preferences.length}</strong> / {profile.maxPrefs || 24} tercih
          </p>
        </div>
        <Link href="/programlar" className="btn-primary" style={{ textDecoration: "none" }}>
          + Program Ekle
        </Link>
      </header>

      {message && (
        <div className="prefs-message prefs-screen-only" role="status">
          <span>✓</span>
          <span>{message}</span>
        </div>
      )}

      <section className="prefs-panel">
        <div className="prefs-content">
          <div className="prefs-toolbar prefs-screen-only">
            <button
              type="button"
              className="btn-primary"
              disabled={preferences.length < 2}
              onClick={smartSort}
            >
              ✦ Akıllı Sırala
            </button>
            <button type="button" className="btn-secondary" onClick={exportPreferences}>
              Dışa Aktar
            </button>
            <button type="button" className="btn-secondary" onClick={() => fileRef.current?.click()}>
              İçe Aktar
            </button>
            <button type="button" className="btn-danger" onClick={() => savePreferences([])}>
              Temizle
            </button>
            <input
              ref={fileRef}
              hidden
              type="file"
              accept=".json"
              onChange={(event) =>
                event.target.files?.[0] && importPreferences(event.target.files[0])
              }
            />
          </div>

          <div className="prefs-summary prefs-screen-only" aria-label="Tercih dengesi">
            <span className="prefs-summary-title">Tercih dengesi</span>
            {riskCountStyle.map(({ key, label, border, bg, text }) => (
              <span
                key={key}
                className="prefs-summary-chip"
                style={{ borderColor: border, background: bg, color: text }}
              >
                <strong>{counts[key]}</strong> {label}
              </span>
            ))}
          </div>

          <div className="preference-list">
            {preferences.length === 0 ? (
              <div className="prefs-empty prefs-screen-only">
                <span aria-hidden="true">🔖</span>
                <h2>Henüz tercih eklenmedi</h2>
                <p>Programlar sayfasından listenize üniversite programı ekleyebilirsiniz.</p>
                <Link href="/programlar" className="btn-primary" style={{ textDecoration: "none" }}>
                  Programları İncele
                </Link>
              </div>
            ) : (
              preferences.map((program, index) => {
                const risk = riskOf(program, profile);
                const st = toneStyle[risk.key] || toneStyle.unknown;
                const programCode = String(codeOf(program));
                const isDragging = draggedCode === programCode;
                const isDragTarget = draggedCode && dragOverCode === programCode && !isDragging;

                return (
                  <div
                    key={programCode}
                    data-preference-code={programCode}
                    className={`preference-row${isDragging ? " is-dragging" : ""}${isDragTarget ? " is-drag-target" : ""}`}
                  >
                    <button
                      type="button"
                      className="preference-drag prefs-screen-only"
                      aria-label={`${index + 1}. tercihi taşı. Ok tuşlarıyla sıralayabilirsiniz.`}
                      title="Sürükleyerek sırala"
                      onPointerDown={(event) => startDragging(event, programCode)}
                      onPointerMove={updateDragTarget}
                      onPointerUp={dropPreference}
                      onPointerCancel={(event) => finishDragging(event.currentTarget)}
                      onKeyDown={(event) =>
                        movePreferenceWithKeyboard(event, programCode, index)
                      }
                    >
                      ⠿
                    </button>

                    <span className="preference-index">{index + 1}</span>

                    <div className="preference-info">
                      <strong className="preference-name">{programOf(program)}</strong>
                      <div className="preference-meta">
                        <span className="preference-university">
                          {uniOf(program)} · {cityOf(program)}
                        </span>
                        <span className="preference-detail">
                          {placementYearOf(program)} sıra: {fmtInt(rankAt(program))}
                        </span>
                        <span className="preference-score-type">{scoreTypeOf(program)}</span>
                        <span className="preference-risk" style={st}>{risk.label}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="preference-remove prefs-screen-only"
                      onClick={() => togglePreference(program)}
                      aria-label={`${programOf(program)} programını listeden çıkar`}
                      title="Listeden çıkar"
                    >
                      ×
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {preferences.length > 0 && (
            <button
              type="button"
              className="btn-secondary prefs-print-button prefs-screen-only"
              onClick={() => window.print()}
            >
              🖨️ Listeyi PDF / Yazdır
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
