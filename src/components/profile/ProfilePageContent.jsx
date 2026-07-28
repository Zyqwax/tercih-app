"use client";

import { useApp } from "../../context/AppContext";

export default function ProfilePageContent() {
  const { profile, saveProfile } = useApp();

  const Section = ({ children }) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border-subtle)",
        background: "var(--bg-elevated)",
        padding: "1.125rem 1.25rem",
      }}
    >
      {children}
    </div>
  );

  return (
    <main
      style={{ maxWidth: "72rem", margin: "0 auto", padding: "1.5rem 1.25rem" }}
      className="sm:px-6 lg:px-8 lg:py-8"
    >
      {/* Header */}
      <header className="page-header sm:flex-row sm:items-center" style={{ marginBottom: "1.5rem" }}>
        <div>
          <span className="badge">Aday Bilgileri</span>
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
            Aday Profilim
          </h1>
          <p
            style={{
              marginTop: "0.5rem",
              fontSize: "0.875rem",
              lineHeight: 1.7,
              color: "var(--text-muted)",
            }}
          >
            YKS başarı sıranız ve puanınız, üniversite programlarının uygunluk risk etiketlerini hesaplamada kullanılır.
          </p>
        </div>
        <span
          style={{
            display: "inline-flex",
            width: "fit-content",
            alignItems: "center",
            gap: "0.5rem",
            borderRadius: "9999px",
            border: "1px solid var(--success-border)",
            background: "var(--success-bg)",
            padding: "0.375rem 0.875rem",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "var(--success-text)",
          }}
        >
          <span
            style={{
              width: "0.5rem",
              height: "0.5rem",
              borderRadius: "9999px",
              background: "var(--success-text)",
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
          Otomatik Kaydediliyor
        </span>
      </header>

      {/* Form */}
      <section className="panel">
        <div
          style={{ padding: "1.5rem" }}
        >
          <div
            style={{ display: "grid", gap: "0.875rem" }}
            className="sm:grid-cols-2 lg:grid-cols-4"
          >
            {/* Puan Türü */}
            <Section>
              <label className="form-label" htmlFor="score-type">Puan Türü</label>
              <select
                id="score-type"
                value={profile.scoreType}
                onChange={(e) => saveProfile({ ...profile, scoreType: e.target.value })}
              >
                <option>SAY</option>
                <option>EA</option>
                <option>SÖZ</option>
                <option>DİL</option>
                <option>TYT</option>
              </select>
            </Section>

            {/* Başarı Sırası */}
            <Section>
              <label className="form-label" htmlFor="user-rank">Başarı Sıralamam</label>
              <input
                id="user-rank"
                type="number"
                className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                value={profile.rank}
                onChange={(e) => saveProfile({ ...profile, rank: e.target.value })}
                placeholder="Örn: 35054"
                style={{ fontWeight: 600, color: "var(--primary-300)" }}
              />
            </Section>

            {/* Puan */}
            <Section>
              <label className="form-label" htmlFor="user-score">Yerleştirme Puanım</label>
              <input
                id="user-score"
                type="number"
                className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                value={profile.score}
                onChange={(e) => saveProfile({ ...profile, score: e.target.value })}
                placeholder="Örn: 480.99"
                style={{ fontWeight: 600 }}
              />
            </Section>

            {/* Max tercih */}
            <Section>
              <label className="form-label" htmlFor="max-prefs">Maksimum Tercih</label>
              <input
                id="max-prefs"
                type="number"
                className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                min="1"
                max="24"
                value={profile.maxPrefs}
                onChange={(e) =>
                  saveProfile({
                    ...profile,
                    maxPrefs: Math.min(24, Math.max(1, Number(e.target.value) || 24)),
                  })
                }
                style={{ fontWeight: 600 }}
              />
            </Section>
          </div>

          {/* Info callout */}
          <div
            style={{
              marginTop: "1.25rem",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--info-border)",
              background: "var(--info-bg)",
              padding: "1.125rem 1.25rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "var(--info-text)",
                fontWeight: 600,
                fontSize: "0.9375rem",
                marginBottom: "0.5rem",
              }}
            >
              <span>💡</span>
              <h2>Bu bilgiler nasıl kullanılıyor?</h2>
            </div>
            <p
              style={{
                maxWidth: "52rem",
                fontSize: "0.8125rem",
                lineHeight: 1.75,
                color: "var(--text-secondary)",
              }}
            >
              Girdiğiniz YKS başarı sırası, tercih etmek istediğiniz üniversite programlarının geçen yılki taban başarı sırasıyla otomatik olarak karşılaştırılır.
              Böylece tercihleriniz <strong style={{ color: "var(--text-primary)" }}>İddialı</strong>,{" "}
              <strong style={{ color: "var(--text-primary)" }}>Dengeli</strong> veya{" "}
              <strong style={{ color: "var(--text-primary)" }}>Güvenli</strong> kategorilerine ayrılarak liste dengenizi optimize etmenize yardımcı olur.
              Tüm bilgileriniz tamamen gizlidir ve sadece kendi tarayıcınızda (Local Storage) tutulur.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
