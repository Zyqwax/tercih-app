"use client";

import { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext";
import { cacheGet, cacheSet, fetchJson } from "../../lib/client-data";
import {
  cityOf,
  codeOf,
  facultyOf,
  fmtInt,
  fmtScore,
  guideYearOf,
  historicalQuotaAt,
  languageOf,
  num,
  pick,
  placedAt,
  placementYearOf,
  programOf,
  quotaAt,
  rankAt,
  riskOf,
  scholarshipOf,
  scoreAt,
  scoreTypeOf,
  trendOf,
  uniOf,
  uniTypeOf,
} from "../../lib/program-utils";
import Modal from "../layout/Modal";

/* ── Tone helpers ─────────────────────────────────────────────────────── */
const toneStyle = {
  reach:   { borderColor: "var(--warning-border)", background: "var(--warning-bg)", color: "var(--warning-text)" },
  down:    { borderColor: "var(--danger-border)",  background: "var(--danger-bg)",  color: "var(--danger-text)" },
  target:  { borderColor: "var(--info-border)",    background: "var(--info-bg)",    color: "var(--info-text)" },
  flat:    { borderColor: "var(--info-border)",    background: "var(--info-bg)",    color: "var(--info-text)" },
  unknown: { borderColor: "var(--border-soft)",    background: "var(--bg-elevated)", color: "var(--text-muted)" },
  safe:    { borderColor: "var(--success-border)", background: "var(--success-bg)", color: "var(--success-text)" },
  up:      { borderColor: "var(--success-border)", background: "var(--success-bg)", color: "var(--success-text)" },
};

function Badge({ label }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--info-border)",
        background: "var(--info-bg)",
        padding: "0.2rem 0.625rem",
        fontSize: "0.6875rem",
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: "var(--info-text)",
      }}
    >
      {label}
    </span>
  );
}

export default function ProgramDetailModal({ program, onClose, onMessage }) {
  const { profile, preferences, togglePreference } = useApp();
  const [netRows, setNetRows] = useState([]);
  const [netLoading, setNetLoading] = useState(false);

  useEffect(() => setNetRows([]), [program]);
  if (!program) return null;

  const preferred = preferences.some((item) => codeOf(item) === codeOf(program));
  const toggle = () => {
    const result = togglePreference(program);
    if (!result.ok) onMessage({ type: "warn", text: result.message });
  };

  const loadNetRows = async () => {
    setNetLoading(true);
    try {
      const body = {
        filters: {
          kilavuzKodu: codeOf(program),
          puanTuru: scoreTypeOf(program),
          universiteId: Number(pick(program, "universiteId", "universite_id")) || null,
          birimGrupId: Number(pick(program, "birimGrupId", "birim_grup_id")) || null,
          birimTuruId: Number(pick(program, "birimTuruId", "birim_turu_id")) || null,
        },
        page: 0,
        size: 20,
      };
      const key = `netler:${JSON.stringify(body)}`;
      const cached = netRows.length ? null : await cacheGet(key);
      const data = cached?.data || (await fetchJson("/api/data/netler", { method: "POST", body: JSON.stringify(body) }));
      if (!cached?.data) await cacheSet(key, data);
      setNetRows(Array.isArray(data.content) ? data.content : []);
    } catch (error) {
      onMessage({ type: "error", text: `Net verileri alınamadı: ${error.message}` });
    } finally {
      setNetLoading(false);
    }
  };

  const risk = riskOf(program, profile);
  const trend = trendOf(program);

  return (
    <Modal open onClose={onClose} title={programOf(program)} subtitle={`${uniOf(program)} · ${cityOf(program)}`} wide>

      {/* Top banner */}
      <div
        style={{
          marginBottom: "1.5rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: "1rem",
        }}
        className="sm:flex-row sm:items-center"
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          <Badge label={scoreTypeOf(program)} />
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              borderRadius: "var(--radius-sm)",
              border: "1px solid",
              padding: "0.2rem 0.625rem",
              fontSize: "0.6875rem",
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              ...(toneStyle[risk.key] || toneStyle.unknown),
            }}
          >
            {risk.label}
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              borderRadius: "var(--radius-sm)",
              border: "1px solid",
              padding: "0.2rem 0.625rem",
              fontSize: "0.6875rem",
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              ...(toneStyle[trend.key] || toneStyle.unknown),
            }}
          >
            {trend.label}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexShrink: 0 }}>
          <button
            type="button"
            onClick={toggle}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.375rem",
              padding: "0.5rem 1rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
              ...(preferred
                ? { borderColor: "var(--danger-border)", background: "var(--danger-bg)", color: "var(--danger-text)" }
                : { borderColor: "var(--info-border)", background: "var(--info-bg)", color: "var(--info-text)" }),
            }}
          >
            {preferred ? "Listeden Çıkar" : "+ Tercihlerime Ekle"}
          </button>
          <a
            href={`https://yokatlas.yok.gov.tr/${String(pick(program, "birimTuruAdi", "birim_turu_adi") || "").includes("ONL") ? "onlisans" : "lisans"}.php?y=${encodeURIComponent(codeOf(program))}`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
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
            YÖK Atlas ↗
          </a>
        </div>
      </div>

      {/* Metric cards */}
      <div
        style={{ marginBottom: "1.75rem", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.875rem" }}
        className="sm:grid-cols-4"
      >
        {[
          { label: `${placementYearOf(program)} Sırası`, value: fmtInt(rankAt(program)), color: "var(--primary-300)" },
          { label: `${placementYearOf(program)} Taban Puan`, value: fmtScore(scoreAt(program)), color: "var(--text-primary)" },
          { label: `${guideYearOf(program)} Kontenjanı`, value: fmtInt(quotaAt(program)), color: "var(--text-primary)" },
          { label: "Sıralama Barajı", value: fmtInt(num(pick(program, "minBasariSirasi", "min_basari_sirasi"))), color: "var(--text-secondary)" },
        ].map(({ label, value, color }) => (
          <div className="metric-card" key={label}>
            <span className="metric-label">{label}</span>
            <strong className="metric-value" style={{ color }}>{value}</strong>
          </div>
        ))}
      </div>

      {/* Details grid */}
      <div style={{ display: "grid", gap: "1.5rem" }} className="lg:grid-cols-2">
        {/* Placements table */}
        <section>
          <h3
            style={{
              marginBottom: "0.625rem",
              fontSize: "0.6875rem",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
            }}
          >
            Tamamlanmış Yerleştirmeler
          </h3>
          <div
            style={{
              overflow: "auto",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-subtle)",
              background: "var(--bg-elevated)",
            }}
          >
            <table className="data-table" style={{ textAlign: "center" }}>
              <thead>
                <tr>
                  <th>Yıl</th>
                  <th>Başarı Sırası</th>
                  <th>Taban Puan</th>
                  <th>Kontenjan</th>
                  <th>Yerleşen</th>
                </tr>
              </thead>
              <tbody>
                {[0, 1, 2, 3].map((offset) => (
                  <tr key={offset}>
                    <td style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{placementYearOf(program, offset)}</td>
                    <td style={{ color: "var(--primary-300)", fontWeight: 600 }}>{fmtInt(rankAt(program, offset))}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{fmtScore(scoreAt(program, offset))}</td>
                    <td style={{ color: "var(--text-muted)" }}>{fmtInt(historicalQuotaAt(program, offset))}</td>
                    <td style={{ color: "var(--text-muted)" }}>{fmtInt(placedAt(program, offset))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Program details */}
        <section>
          <h3
            style={{
              marginBottom: "0.625rem",
              fontSize: "0.6875rem",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
            }}
          >
            Program Detayları
          </h3>
          <div
            style={{
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-subtle)",
              background: "var(--bg-elevated)",
              overflow: "hidden",
            }}
          >
            {[
              ["ÖSYM Kodu", codeOf(program)],
              ["Fakülte / Birim", facultyOf(program)],
              ["Üniversite Türü", uniTypeOf(program)],
              ["Şehir / İlçe", `${cityOf(program)} / ${pick(program, "ilceAdi", "ilce_adi") || "—"}`],
              ["Öğrenim Dili", languageOf(program)],
              ["Öğretim Türü", pick(program, "ogrenimTuruAdi", "ogrenim_turu_adi") || "—"],
              ["Burs / Ücret", scholarshipOf(program)],
              ["Süre", pick(program, "ogrenimSuresi", "ogrenim_suresi") ? `${pick(program, "ogrenimSuresi", "ogrenim_suresi")} yıl` : "—"],
              ["Akreditasyon", pick(program, "akreditasyonAck", "akreditasyon") || "—"],
              ["Prof. / Doç. / Dr.", `${pick(program, "prof") ?? "—"} / ${pick(program, "doc") ?? "—"} / ${pick(program, "dou") ?? "—"}`],
            ].map(([label, value], index) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.625rem 1rem",
                  borderTop: index > 0 ? "1px solid var(--border-subtle)" : "none",
                }}
              >
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>{label}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600, textAlign: "right" }}>{value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Conditions */}
      {Array.isArray(program.kosulList) && program.kosulList.length > 0 && (
        <section
          style={{
            marginTop: "1.5rem",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-elevated)",
            padding: "1.125rem 1.25rem",
          }}
        >
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
            Özel Koşullar ve Açıklamalar
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {program.kosulList.map((condition, index) => (
              <details
                key={`${Object.keys(condition)[0]}-${index}`}
                style={{
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                  background: "var(--bg-overlay)",
                  padding: "0.75rem 1rem",
                  fontSize: "0.8125rem",
                }}
              >
                <summary
                  style={{ fontWeight: 600, color: "var(--text-accent)", cursor: "pointer" }}
                >
                  Koşul {Object.keys(condition)[0]}
                </summary>
                <p
                  style={{
                    marginTop: "0.625rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.7,
                    paddingLeft: "0.75rem",
                    borderLeft: "2px solid var(--info-border)",
                  }}
                >
                  {Object.values(condition)[0]}
                </p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Netler section */}
      <section
        style={{
          marginTop: "1.5rem",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-subtle)",
          background: "var(--bg-elevated)",
          padding: "1.125rem 1.25rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <h3
              style={{
                fontSize: "0.6875rem",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
              }}
            >
              Son Yerleşen Adayın Net Ortalamaları
            </h3>
            <p style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: "0.125rem" }}>YÖK Atlas canlı verileri</p>
          </div>
          <button
            type="button"
            className="btn-secondary"
            disabled={netLoading}
            onClick={loadNetRows}
            style={{ flexShrink: 0 }}
          >
            {netLoading ? "Yükleniyor…" : netRows.length ? "Yenile" : "Netleri Göster"}
          </button>
        </div>

        {netRows.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {netRows.map((row, index) => (
              <article
                key={`${pick(row, "yil")}-${index}`}
                style={{
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                  background: "var(--bg-overlay)",
                  padding: "0.875rem 1rem",
                }}
              >
                <header
                  style={{
                    marginBottom: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: "0.625rem",
                    borderBottom: "1px solid var(--border-subtle)",
                  }}
                >
                  <strong style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--primary-300)" }}>
                    {pick(row, "yil") || "—"} Yılı Netleri
                  </strong>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Taban: <strong style={{ color: "var(--text-secondary)" }}>{fmtScore(num(pick(row, "tabanPuan", "taban_puan")))}</strong>
                    {" · "}OBP: <strong style={{ color: "var(--text-secondary)" }}>{fmtScore(num(pick(row, "obp")))}</strong>
                  </span>
                </header>
                <div
                  style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem" }}
                  className="sm:grid-cols-4"
                >
                  {[
                    ["TYT Türkçe", "tytTrkNet", "tyt_trk_net"],
                    ["TYT Sosyal", "tytSosNet", "tyt_sos_net"],
                    ["TYT Mat", "tytMatNet", "tyt_mat_net"],
                    ["TYT Fen", "tytFenNet", "tyt_fen_net"],
                    ["AYT Mat", "aytMatNet", "ayt_mat_net"],
                    ["AYT Fizik", "aytFizNet", "ayt_fiz_net"],
                    ["AYT Kimya", "aytKimNet", "ayt_kim_net"],
                    ["AYT Biyoloji", "aytBioNet", "ayt_bio_net"],
                    ["AYT Edebiyat", "aytTdeNet", "ayt_tde_net"],
                    ["YDT Yabancı Dil", "ydtYdilNet", "ydt_ydil_net"],
                  ].map(([label, k1, k2]) => {
                    const value = num(pick(row, k1, k2));
                    if (value == null) return null;
                    return (
                      <div
                        key={label}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "0.5rem 0.625rem",
                          borderRadius: "var(--radius-sm)",
                          background: "var(--bg-elevated)",
                        }}
                      >
                        <span style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                          {label}
                        </span>
                        <strong style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--primary-300)" }}>
                          {value.toFixed(2)}
                        </strong>
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <p
        style={{
          marginTop: "1.25rem",
          textAlign: "center",
          fontSize: "0.6875rem",
          lineHeight: 1.6,
          color: "var(--text-muted)",
        }}
      >
        Uygunluk etiketleri adayın kendi sıralaması ile son yıl taban sırasının karşılaştırılmasıyla hesaplanır.
      </p>
    </Modal>
  );
}
