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
    <main
      style={{ maxWidth: "72rem", margin: "0 auto", padding: "1.5rem 1.25rem" }}
      className="sm:px-6 lg:px-8 lg:py-8"
    >
      {/* Header */}
      <header className="page-header sm:flex-row sm:items-center" style={{ marginBottom: "1.5rem" }}>
        <div>
          <span className="badge">Tercih Yönetimi</span>
          <h1
            style={{
              marginTop: "0.75rem",
              fontSize: "1.625rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
            }}
            className="sm:text-3xl"
          >
            Tercih Listem
          </h1>
          <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", lineHeight: 1.7, color: "var(--text-muted)" }}>
            Seçtiğiniz{" "}
            <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>{preferences.length}</strong>{" "}
            program — Maksimum {profile.maxPrefs || 24} tercih hakkınız bulunmaktadır
          </p>
        </div>
        <Link
          href="/programlar"
          className="btn-primary"
          style={{ textDecoration: "none", flexShrink: 0 }}
        >
          + Program Ekle
        </Link>
      </header>

      {/* Alert */}
      {message && (
        <div
          style={{
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--success-border)",
            background: "var(--success-bg)",
            padding: "0.875rem 1rem",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "var(--success-text)",
          }}
        >
          <span>✓</span>
          <span>{message}</span>
        </div>
      )}

      <section className="panel">
        <div style={{ padding: "1.5rem" }}>
          {/* Toolbar */}
          <div
            style={{
              marginBottom: "1.5rem",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "0.5rem",
              paddingBottom: "1.25rem",
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            <button
              type="button"
              className="btn-primary"
              disabled={preferences.length < 2}
              onClick={smartSort}
            >
              ✦ Akıllı Sırala
            </button>
            <button type="button" className="btn-secondary" onClick={exportPreferences}>
              Dışa Aktar (.json)
            </button>
            <button type="button" className="btn-secondary" onClick={() => fileRef.current?.click()}>
              İçe Aktar
            </button>
            <button type="button" className="btn-danger" onClick={() => savePreferences([])}>
              Listeyi Temizle
            </button>
            <input
              ref={fileRef}
              hidden
              type="file"
              accept=".json"
              onChange={(e) => e.target.files?.[0] && importPreferences(e.target.files[0])}
            />
          </div>

          {/* Risk breakdown */}
          <h2
            style={{
              marginBottom: "0.75rem",
              fontSize: "0.6875rem",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
            }}
          >
            Tercih Dengesi Analizi
          </h2>
          <div
            style={{ marginBottom: "1.5rem", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem" }}
            className="lg:grid-cols-4"
          >
            {riskCountStyle.map(({ key, label, border, bg, text }) => (
              <div
                key={key}
                style={{
                  borderRadius: "var(--radius-lg)",
                  border: `1px solid ${border}`,
                  background: bg,
                  padding: "1rem 1.125rem",
                }}
              >
                <b
                  style={{
                    display: "block",
                    fontSize: "1.875rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                  }}
                >
                  {counts[key]}
                </b>
                <span
                  style={{
                    display: "block",
                    marginTop: "0.375rem",
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    color: text,
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* List */}
          <div
            style={{
              overflow: "hidden",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-subtle)",
              background: "var(--bg-elevated)",
            }}
          >
            {preferences.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  minHeight: "16rem",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.875rem",
                  padding: "2rem",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "3rem",
                    height: "3rem",
                    display: "grid",
                    placeItems: "center",
                    borderRadius: "var(--radius-lg)",
                    background: "var(--info-bg)",
                    color: "var(--info-text)",
                    fontSize: "1.25rem",
                  }}
                >
                  🔖
                </div>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)" }}>
                  Henüz tercih eklenmedi
                </h3>
                <p style={{ maxWidth: "28rem", fontSize: "0.8125rem", lineHeight: 1.6, color: "var(--text-muted)" }}>
                  Programlar sayfasından ilginizi çeken üniversite programlarını &ldquo;+ Tercih&rdquo; düğmesini kullanarak listenize ekleyebilirsiniz.
                </p>
                <Link
                  href="/programlar"
                  className="btn-primary"
                  style={{ marginTop: "0.5rem", textDecoration: "none" }}
                >
                  Programları İncele
                </Link>
              </div>
            ) : (
              <div>
                {preferences.map((program, index) => {
                  const risk = riskOf(program, profile);
                  const st = toneStyle[risk.key] || toneStyle.unknown;
                  const programCode = String(codeOf(program));
                  const isDragging = draggedCode === programCode;
                  const isDragTarget = draggedCode && dragOverCode === programCode && !isDragging;
                  return (
                    <div
                      key={programCode}
                      data-preference-code={programCode}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "1rem",
                        padding: "1rem 1.125rem",
                        borderBottom: "1px solid var(--border-subtle)",
                        background: isDragging
                          ? "rgba(56, 189, 248, 0.06)"
                          : undefined,
                        boxShadow: isDragTarget
                          ? "inset 0 2px 0 var(--primary-400)"
                          : undefined,
                        opacity: isDragging ? 0.55 : 1,
                        transition: "background 0.1s ease, opacity 0.1s ease, box-shadow 0.1s ease",
                      }}
                      className="hover:bg-white/[0.01]"
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem", minWidth: 0 }}>
                        {/* Drag handle */}
                        <button
                          type="button"
                          aria-label={`${index + 1}. tercihi taşı. Ok tuşlarıyla sıralayabilirsiniz.`}
                          title="Sürükleyerek sırala"
                          onPointerDown={(event) => startDragging(event, programCode)}
                          onPointerMove={updateDragTarget}
                          onPointerUp={dropPreference}
                          onPointerCancel={(event) => finishDragging(event.currentTarget)}
                          onKeyDown={(event) =>
                            movePreferenceWithKeyboard(event, programCode, index)
                          }
                          style={{
                            flexShrink: 0,
                            width: "1.5rem",
                            height: "2.25rem",
                            display: "grid",
                            placeItems: "center",
                            borderRadius: "var(--radius-sm)",
                            border: "none",
                            padding: 0,
                            background: "transparent",
                            color: isDragging ? "var(--primary-300)" : "var(--text-muted)",
                            cursor: isDragging ? "grabbing" : "grab",
                            touchAction: "none",
                            fontSize: "1.25rem",
                            lineHeight: 1,
                          }}
                        >
                          ⠿
                        </button>
                        {/* Index */}
                        <span
                          style={{
                            flexShrink: 0,
                            width: "2.25rem",
                            height: "2.25rem",
                            display: "grid",
                            placeItems: "center",
                            borderRadius: "var(--radius-md)",
                            background: "var(--info-bg)",
                            border: "1px solid var(--info-border)",
                            fontSize: "0.8125rem",
                            fontWeight: 700,
                            color: "var(--info-text)",
                          }}
                        >
                          {index + 1}
                        </span>
                        {/* Program info */}
                        <div style={{ minWidth: 0 }}>
                          <strong
                            style={{
                              display: "block",
                              fontSize: "0.9375rem",
                              fontWeight: 600,
                              color: "var(--text-primary)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {programOf(program)}
                          </strong>
                          <span
                            style={{
                              display: "block",
                              marginTop: "0.125rem",
                              fontSize: "0.75rem",
                              color: "var(--text-muted)",
                            }}
                          >
                            {uniOf(program)} · {cityOf(program)}
                          </span>
                          <div style={{ marginTop: "0.5rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                borderRadius: "var(--radius-sm)",
                                border: "1px solid",
                                padding: "0.125rem 0.5rem",
                                fontSize: "0.625rem",
                                fontWeight: 700,
                                letterSpacing: "0.04em",
                                textTransform: "uppercase",
                                ...st,
                              }}
                            >
                              {risk.label}
                            </span>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                              {placementYearOf(program)} Sırası:{" "}
                              <strong style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
                                {fmtInt(rankAt(program))}
                              </strong>
                            </span>
                            <span
                              style={{
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                color: "var(--primary-300)",
                              }}
                            >
                              {scoreTypeOf(program)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => togglePreference(program)}
                        title="Listeden çıkar"
                        style={{
                          flexShrink: 0,
                          width: "2.25rem",
                          height: "2.25rem",
                          display: "grid",
                          placeItems: "center",
                          borderRadius: "var(--radius-md)",
                          border: "1px solid var(--border-soft)",
                          background: "var(--bg-overlay)",
                          color: "var(--text-muted)",
                          fontSize: "1.125rem",
                          lineHeight: 1,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Print button */}
          {preferences.length > 0 && (
            <button
              type="button"
              className="btn-secondary print:hidden"
              style={{ marginTop: "1rem" }}
              onClick={() => window.print()}
            >
              🖨️ Yazdır / PDF Kaydet
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
