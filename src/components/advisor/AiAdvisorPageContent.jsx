"use client";

import { useState } from "react";
import Link from "next/link";
import { useApp } from "../../context/AppContext";
import { cityOf, codeOf, fmtInt, placementYearOf, programOf, rankAt, scoreTypeOf, uniOf } from "../../lib/program-utils";

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

const initialAnswers = {
  fields: "",
  cities: "",
  cityMode: "prefer",
  degree: "46",
  universityType: "",
  language: "",
  priority: "career",
  riskStyle: "balanced",
  count: 18,
  notes: "",
};

const steps = [
  { title: "Hangi bölümleri düşünüyorsun?", hint: "Birden fazla alanı virgülle ayırarak yazabilirsin." },
  { title: "Nerede okumak istersin?", hint: "Şehir tercihlerini ve ne kadar esnek olduğunu belirt." },
  { title: "Üniversite yapısı tercihin nedir?", hint: "Lisans/önlisans ve devlet/vakıf seçimini yap." },
  { title: "Öğrenim dili senin için önemli mi?", hint: "Zorunlu değilse tüm dilleri değerlendirebiliriz." },
  { title: "Üniversitede en önemli önceliğin ne?", hint: "AI açıklamalarını bu önceliğe göre hazırlayacak." },
  { title: "Tercih listen ne kadar riskli olsun?", hint: "Son ayrıntıları belirleyip öneriyi hazırlayalım." },
];

/* ── Reusable section label ─────────────────────────────────────────── */
function SectionHeader({ children }) {
  return (
    <h3
      style={{
        marginBottom: "0.75rem",
        fontSize: "0.6875rem",
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: "var(--text-muted)",
      }}
    >
      {children}
    </h3>
  );
}

export default function AiAdvisorPageContent() {
  const { profile, preferences, savePreferences } = useApp();
  const [answers, setAnswers] = useState(initialAnswers);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const update = (key, value) => setAnswers((c) => ({ ...c, [key]: value }));
  const canContinue = step !== 0 || answers.fields.trim().length >= 2;

  const generate = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/ai-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, answers }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error([data.message, data.setup].filter(Boolean).join(" "));
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addRecommendations = () => {
    const merged = [...preferences];
    const existing = new Set(merged.map(codeOf));
    for (const item of result.recommendations) {
      if (merged.length >= Number(profile.maxPrefs || 24)) break;
      if (!existing.has(codeOf(item.program))) {
        merged.push(item.program);
        existing.add(codeOf(item.program));
      }
    }
    savePreferences(merged);
  };

  /* ── No rank guard ─────────────────────────────────────────────────── */
  if (!Number(profile.rank)) {
    return (
      <main
        style={{ maxWidth: "72rem", margin: "0 auto", padding: "1.5rem 1.25rem" }}
        className="sm:px-6 lg:px-8 lg:py-8"
      >
        <header className="page-header sm:flex-row sm:items-center" style={{ marginBottom: "1.5rem" }}>
          <div>
            <span className="badge">AI Danışmanı</span>
            <h1
              style={{
                marginTop: "0.75rem",
                fontSize: "1.625rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                letterSpacing: "-0.03em",
              }}
              className="sm:text-3xl"
            >
              Önce Sıralamanı Eklemelisin
            </h1>
            <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", lineHeight: 1.7, color: "var(--text-muted)" }}>
              AI önerilerinin gerçek YÖK program sıralamalarıyla eşleştirilebilmesi için aday profilinizde başarı sırası bulunmalıdır.
            </p>
          </div>
        </header>

        <section
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "20rem",
            borderRadius: "var(--radius-2xl)",
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-surface)",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "4rem",
              height: "4rem",
              display: "grid",
              placeItems: "center",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--info-border)",
              background: "var(--info-bg)",
              fontSize: "1.75rem",
              color: "var(--info-text)",
            }}
          >
            ✦
          </div>
          <h2
            style={{
              marginTop: "1.25rem",
              fontSize: "1.125rem",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            Aday Profil Bilgisi Eksik
          </h2>
          <p style={{ marginTop: "0.5rem", maxWidth: "28rem", fontSize: "0.875rem", lineHeight: 1.7, color: "var(--text-muted)" }}>
            YKS başarı sıranızı kaydettikten sonra AI tercih sihirbazını hemen kullanmaya başlayabilirsiniz.
          </p>
          <Link
            href="/profil"
            className="btn-primary"
            style={{ marginTop: "1.5rem", textDecoration: "none" }}
          >
            Profil Bilgilerini Doldur
          </Link>
        </section>
      </main>
    );
  }

  /* ── Main view ─────────────────────────────────────────────────────── */
  return (
    <main
      style={{ maxWidth: "72rem", margin: "0 auto", padding: "1.5rem 1.25rem" }}
      className="sm:px-6 lg:px-8 lg:py-8"
    >
      {/* Header */}
      <header className="page-header sm:flex-row sm:items-center" style={{ marginBottom: "1.5rem" }}>
        <div>
          <span className="badge">AI Akıllı Asistan</span>
          <h1
            style={{
              marginTop: "0.75rem",
              fontSize: "1.625rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.03em",
            }}
            className="sm:text-3xl"
          >
            AI Tercih Danışmanı
          </h1>
          <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", lineHeight: 1.7, color: "var(--text-muted)" }}>
            Soruları yanıtlayın; AI yalnızca YÖK Atlas veritabanındaki gerçek programlar arasından size özel optimal tercih taslağı hazırlasın.
          </p>
        </div>

        {/* Profile rank display */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--info-border)",
            background: "var(--info-bg)",
            padding: "0.875rem 1.125rem",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "2.5rem",
              height: "2.5rem",
              display: "grid",
              placeItems: "center",
              borderRadius: "var(--radius-md)",
              background: "rgba(56,189,248,0.15)",
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "var(--info-text)",
            }}
          >
            {profile.scoreType}
          </div>
          <div>
            <b style={{ display: "block", fontSize: "1.375rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.025em" }}>
              {fmtInt(Number(profile.rank))}
            </b>
            <span style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)" }}>
              Aday Sıralaması
            </span>
          </div>
        </div>
      </header>

      {/* Wizard form */}
      {!result && (
        <section
          style={{
            maxWidth: "48rem",
            margin: "0 auto",
            overflow: "hidden",
            borderRadius: "var(--radius-2xl)",
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-surface)",
            padding: "1.75rem 2rem",
          }}
        >
          {/* Progress */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.625rem" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--primary-300)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Adım {step + 1} / {steps.length}
              </span>
              <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)" }}>
                {steps[step].title}
              </span>
            </div>
            <div
              style={{
                height: "0.25rem",
                width: "100%",
                borderRadius: "9999px",
                background: "var(--bg-elevated)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  background: "linear-gradient(90deg, hsl(200 75% 52%), hsl(252 68% 58%))",
                  borderRadius: "9999px",
                  width: `${((step + 1) / steps.length) * 100}%`,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>

          {/* Hint */}
          <p
            style={{
              marginBottom: "1.5rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid rgba(99,102,241,0.2)",
              background: "rgba(99,102,241,0.08)",
              padding: "0.75rem 1rem",
              fontSize: "0.8125rem",
              fontWeight: 500,
              color: "rgba(165,180,252,0.9)",
            }}
          >
            💡 {steps[step].hint}
          </p>

          {/* Step content */}
          <div style={{ minHeight: "15rem", paddingTop: "0.5rem", paddingBottom: "0.5rem" }}>
            {step === 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label className="form-label" htmlFor="fields-input">
                  İlgilendiğin Bölüm veya Alanlar
                </label>
                <input
                  id="fields-input"
                  autoFocus
                  value={answers.fields}
                  onChange={(e) => update("fields", e.target.value)}
                  placeholder="Örn. Bilgisayar Mühendisliği, Tıp, Hukuk, Mimarlık"
                />
              </div>
            )}

            {step === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label className="form-label" htmlFor="cities-input">Tercih Edilen Şehirler</label>
                  <input
                    id="cities-input"
                    autoFocus
                    value={answers.cities}
                    onChange={(e) => update("cities", e.target.value)}
                    placeholder="Örn. İstanbul, Ankara, İzmir, Eskişehir"
                  />
                </div>
                <div style={{ display: "grid", gap: "0.625rem" }} className="sm:grid-cols-3">
                  {[
                    ["strict", "Yalnızca Bunlar", "Şehirler kesin koşulum"],
                    ["prefer", "Öncelik Ver", "Esnek olabilirim"],
                    ["any", "Fark Etmez", "Tüm şehirleri incele"],
                  ].map(([mode, title, text]) => (
                    <button
                      key={mode}
                      type="button"
                      className={`choice-btn ${answers.cityMode === mode ? "active" : ""}`}
                      onClick={() => update("cityMode", mode)}
                    >
                      <b style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>{title}</b>
                      <span style={{ marginTop: "0.25rem", fontSize: "0.75rem", opacity: 0.65 }}>{text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: "grid", gap: "1.25rem" }} className="sm:grid-cols-2">
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label className="form-label" htmlFor="degree-select">Program Türü</label>
                  <select id="degree-select" value={answers.degree} onChange={(e) => update("degree", e.target.value)}>
                    <option value="46">Lisans (4 Yıl)</option>
                    <option value="47">Ön Lisans (2 Yıl)</option>
                    <option value="">Fark Etmez</option>
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label className="form-label" htmlFor="unitype-select">Üniversite Türü</label>
                  <select id="unitype-select" value={answers.universityType} onChange={(e) => update("universityType", e.target.value)}>
                    <option value="">Fark Etmez</option>
                    <option value="DEVLET">Devlet</option>
                    <option value="VAKIF">Vakıf</option>
                  </select>
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label className="form-label" htmlFor="lang-select">Öğrenim Dili</label>
                <select id="lang-select" value={answers.language} onChange={(e) => update("language", e.target.value)}>
                  <option value="">Fark Etmez (Tüm Diller)</option>
                  <option value="Türkçe">Türkçe</option>
                  <option value="İngilizce">İngilizce</option>
                  <option value="Almanca">Almanca</option>
                  <option value="Fransızca">Fransızca</option>
                </select>
              </div>
            )}

            {step === 4 && (
              <div style={{ display: "grid", gap: "0.625rem" }} className="sm:grid-cols-2">
                {[
                  ["career", "Kariyer Olanakları", "Mezuniyet sonrası iş fırsatları ve sektör gücü"],
                  ["academic", "Akademik Kalite", "Akademik kadro yetkinliği ve araştırma kalitesi"],
                  ["campus", "Kampüs & Şehir Yaşamı", "Sosyal imkânlar ve aktif öğrenci hayatı"],
                  ["cost", "Maliyet & Burs", "Devlet, burs ve yaşam maliyeti dengesi"],
                  ["abroad", "Yurt Dışı & Dil", "Uluslararası değişim programları"],
                ].map(([value, title, text]) => (
                  <button
                    key={value}
                    type="button"
                    className={`choice-btn ${answers.priority === value ? "active" : ""}`}
                    onClick={() => update("priority", value)}
                  >
                    <b style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>{title}</b>
                    <span style={{ marginTop: "0.25rem", fontSize: "0.75rem", opacity: 0.65 }}>{text}</span>
                  </button>
                ))}
              </div>
            )}

            {step === 5 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div style={{ display: "grid", gap: "0.625rem" }} className="sm:grid-cols-3">
                  {[
                    ["ambitious", "İddialı", "Yüksek hedefli programlar"],
                    ["balanced", "Dengeli", "Dengeli dağıtılmış risk grubu"],
                    ["safe", "Güvenli", "Kesin yerleşme odaklı"],
                  ].map(([value, title, text]) => (
                    <button
                      key={value}
                      type="button"
                      className={`choice-btn ${answers.riskStyle === value ? "active" : ""}`}
                      onClick={() => update("riskStyle", value)}
                    >
                      <b style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>{title}</b>
                      <span style={{ marginTop: "0.25rem", fontSize: "0.75rem", opacity: 0.65 }}>{text}</span>
                    </button>
                  ))}
                </div>
                <div style={{ display: "grid", gap: "1rem" }} className="sm:grid-cols-2">
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <label className="form-label" htmlFor="count-input">Kaç Tercih Önerilsin?</label>
                    <input
                      id="count-input"
                      type="number"
                      min="6"
                      max={profile.maxPrefs || 24}
                      value={answers.count}
                      onChange={(e) => update("count", e.target.value)}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <label className="form-label" htmlFor="notes-input">Özel Not</label>
                    <input
                      id="notes-input"
                      value={answers.notes}
                      onChange={(e) => update("notes", e.target.value)}
                      placeholder="Örn. Hazırlık okumak istemiyorum"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <footer
            style={{
              marginTop: "1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: "1.25rem",
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            <button
              type="button"
              className="btn-secondary"
              disabled={step === 0}
              onClick={() => setStep(step - 1)}
            >
              ← Geri
            </button>

            {step < steps.length - 1 ? (
              <button
                type="button"
                className="btn-primary"
                disabled={!canContinue}
                onClick={() => setStep(step + 1)}
              >
                Devam Et →
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                disabled={loading}
                onClick={generate}
              >
                {loading ? "AI Değerlendiriyor…" : "✦ Tercih Listemi Hazırla"}
              </button>
            )}
          </footer>
        </section>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--danger-border)",
            background: "var(--danger-bg)",
            padding: "0.875rem 1rem",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "var(--danger-text)",
          }}
        >
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Loading shimmer */}
      {loading && (
        <section
          style={{
            maxWidth: "48rem",
            margin: "0 auto",
            overflow: "hidden",
            borderRadius: "var(--radius-2xl)",
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-surface)",
            padding: "2.5rem",
            textAlign: "center",
          }}
        >
          <div className="loading-dots" style={{ justifyContent: "center", marginBottom: "1rem" }}>
            <span /><span /><span />
          </div>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            YÖK verileri başarı sıranıza göre analiz ediliyor ve AI modelleri tarafından optimal listeniz hazırlanıyor…
          </p>
        </section>
      )}

      {/* Result */}
      {result && (
        <section
          style={{
            overflow: "hidden",
            borderRadius: "var(--radius-2xl)",
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-surface)",
            padding: "1.75rem 2rem",
          }}
        >
          {/* Result header */}
          <header
            style={{
              marginBottom: "1.5rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "1.25rem",
              paddingBottom: "1.25rem",
              borderBottom: "1px solid var(--border-subtle)",
            }}
            className="lg:flex-row lg:items-start"
          >
            <div style={{ minWidth: 0 }}>
              <span className="badge">
                {result.model} · {result.candidateCount} Program İncelendi
              </span>
              <h2
                style={{
                  marginTop: "0.75rem",
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  lineHeight: 1.4,
                  letterSpacing: "-0.02em",
                  maxWidth: "48rem",
                }}
              >
                {result.summary}
              </h2>
              <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", lineHeight: 1.7, color: "var(--text-muted)", maxWidth: "48rem" }}>
                {result.strategy}
              </p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", flexShrink: 0 }}>
              <button type="button" className="btn-secondary" onClick={() => setResult(null)}>
                Soruları Değiştir
              </button>
              <button type="button" className="btn-primary" onClick={addRecommendations}>
                + Tercihlerime Ekle
              </button>
            </div>
          </header>

          {/* Recommendation list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {result.recommendations.map((item) => {
              const key = item.category === "İddialı" ? "reach" : item.category === "Güvenli" ? "safe" : "target";
              const st = toneStyle[key] || toneStyle.unknown;
              return (
                <article
                  key={codeOf(item.program)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--border-subtle)",
                    background: "var(--bg-elevated)",
                    padding: "1.125rem 1.25rem",
                  }}
                  className="sm:flex-row sm:items-start sm:justify-between"
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", minWidth: 0 }}>
                    {/* Order badge */}
                    <span
                      style={{
                        flexShrink: 0,
                        width: "2.25rem",
                        height: "2.25rem",
                        display: "grid",
                        placeItems: "center",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--info-border)",
                        background: "var(--info-bg)",
                        fontSize: "0.8125rem",
                        fontWeight: 700,
                        color: "var(--info-text)",
                      }}
                    >
                      {item.order}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      {/* Category tags */}
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem" }}>
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
                          {item.category}
                        </span>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid var(--info-border)",
                            background: "var(--info-bg)",
                            padding: "0.125rem 0.5rem",
                            fontSize: "0.625rem",
                            fontWeight: 700,
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                            color: "var(--info-text)",
                          }}
                        >
                          {scoreTypeOf(item.program)}
                        </span>
                      </div>
                      <h3 style={{ marginTop: "0.5rem", fontSize: "0.9375rem", fontWeight: 600, color: "var(--text-primary)" }}>
                        {programOf(item.program)}
                      </h3>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {uniOf(item.program)} · {cityOf(item.program)}
                      </p>
                      <blockquote
                        style={{
                          marginTop: "0.625rem",
                          paddingLeft: "0.875rem",
                          borderLeft: "2px solid var(--info-border)",
                          fontSize: "0.8125rem",
                          lineHeight: 1.7,
                          color: "var(--text-secondary)",
                          fontStyle: "italic",
                        }}
                      >
                        &ldquo;{item.reason}&rdquo;
                      </blockquote>
                    </div>
                  </div>

                  {/* Rank */}
                  <div
                    style={{
                      display: "flex",
                      flexShrink: 0,
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      paddingTop: "0.75rem",
                      borderTop: "1px solid var(--border-subtle)",
                    }}
                    className="sm:flex-col sm:items-end sm:justify-start sm:border-t-0 sm:pt-0"
                  >
                    <span style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                      {placementYearOf(item.program)} Sırası
                    </span>
                    <strong style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--primary-300)", letterSpacing: "-0.02em" }} className="sm:mt-1">
                      {fmtInt(rankAt(item.program))}
                    </strong>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Warnings */}
          {result.warnings?.length > 0 && (
            <div
              style={{
                marginTop: "1.5rem",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--warning-border)",
                background: "var(--warning-bg)",
                padding: "1.125rem 1.25rem",
              }}
            >
              <h3 style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--warning-text)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                ⚠️ Dikkat Edilmesi Gereken Hususlar
              </h3>
              <ul style={{ marginTop: "0.75rem", paddingLeft: "1.25rem", listStyle: "disc", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {result.warnings.map((warning, index) => (
                  <li key={index} style={{ fontSize: "0.8125rem", color: "var(--warning-text)", lineHeight: 1.7, opacity: 0.9 }}>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Disclaimer */}
      <p
        style={{
          marginTop: "1.5rem",
          textAlign: "center",
          fontSize: "0.6875rem",
          lineHeight: 1.7,
          color: "var(--text-muted)",
        }}
      >
        AI önerileri karar desteği amacıyla sunulmuştur; kesin yerleşme garantisi vermez. Tercihlerinizi ÖSYM kılavuzundan kontrol edin.
      </p>
    </main>
  );
}
