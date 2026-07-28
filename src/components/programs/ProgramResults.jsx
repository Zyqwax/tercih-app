import {
  cityOf,
  codeOf,
  fmtInt,
  fmtScore,
  guideYearOf,
  historicalQuotaAt,
  placementYearOf,
  placedAt,
  programOf,
  quotaAt,
  rankAt,
  riskOf,
  scoreAt,
  scoreTypeOf,
  trendOf,
  uniOf,
  uniTypeOf,
} from "../../lib/program-utils";

/* ── Semantic tone maps ─────────────────────────────────────────────────── */
const riskStyle = {
  safe:    { borderColor: "var(--success-border)", background: "var(--success-bg)", color: "var(--success-text)" },
  target:  { borderColor: "var(--info-border)",    background: "var(--info-bg)",    color: "var(--info-text)" },
  reach:   { borderColor: "var(--warning-border)", background: "var(--warning-bg)", color: "var(--warning-text)" },
  unknown: { borderColor: "var(--border-soft)",    background: "var(--bg-elevated)", color: "var(--text-muted)" },
};

const trendStyle = {
  rising:  { borderColor: "var(--success-border)", background: "var(--success-bg)", color: "var(--success-text)" },
  falling: { borderColor: "var(--danger-border)",  background: "var(--danger-bg)",  color: "var(--danger-text)" },
  stable:  { borderColor: "var(--info-border)",    background: "var(--info-bg)",    color: "var(--info-text)" },
  unknown: { borderColor: "var(--border-soft)",    background: "var(--bg-elevated)", color: "var(--text-muted)" },
};

function Dot({ style }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: "0.375rem",
        height: "0.375rem",
        borderRadius: "9999px",
        flexShrink: 0,
        backgroundColor: style.color,
        opacity: 0.8,
      }}
    />
  );
}

function RiskStatus({ program, profile }) {
  const risk = riskOf(program, profile);
  const st = riskStyle[risk.key] || riskStyle.unknown;
  return (
    <span
      style={{
        display: "inline-flex",
        width: "100%",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "0.375rem",
        borderRadius: "var(--radius-sm)",
        border: "1px solid",
        padding: "0.25rem 0.5rem",
        fontSize: "0.625rem",
        fontWeight: 600,
        letterSpacing: "0.04em",
        ...st,
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", textTransform: "uppercase", opacity: 0.75 }}>
        <Dot style={st} />
        Uygunluk
      </span>
      <strong style={{ fontWeight: 700, fontSize: "0.6875rem" }}>{risk.label}</strong>
    </span>
  );
}

function TrendStatus({ program }) {
  const trend = trendOf(program);
  const match = trend.label.match(/^(.*?)\s+(%[\d.,]+)$/);
  const title = match?.[1] || trend.label;
  const detail = match?.[2] || (trend.key === "unknown" ? "Karşılaştırma yok" : "Son iki yıl");
  const st = trendStyle[trend.key] || trendStyle.unknown;
  return (
    <span
      style={{
        display: "inline-flex",
        width: "100%",
        flexDirection: "column",
        alignItems: "flex-start",
        borderRadius: "var(--radius-sm)",
        border: "1px solid",
        padding: "0.25rem 0.5rem",
        fontSize: "0.625rem",
        fontWeight: 600,
        textAlign: "left",
        ...st,
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontWeight: 700, fontSize: "0.6875rem" }}>
        <Dot style={st} />
        {title}
      </span>
      <span style={{ paddingLeft: "0.6rem", opacity: 0.6, fontSize: "0.625rem", fontWeight: 500, lineHeight: 1.4 }}>{detail}</span>
    </span>
  );
}

export default function ProgramResults({
  programs,
  loading,
  preferences,
  profile,
  onTogglePreference,
  onDetails,
  page,
  pageData,
  onPage,
}) {
  const totalPages = pageData.totalPages ?? pageData.total_pages ?? 1;
  const totalElements = pageData.totalElements ?? pageData.total_elements ?? programs.length;
  const yearOffsets = [0, 1, 2, 3];
  const guideYear = programs[0] ? guideYearOf(programs[0]) : new Date().getFullYear();

  return (
    <>
      {/* Count header */}
      {!loading && programs.length > 0 && (
        <div
          style={{
            marginBottom: "0.625rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 0.25rem",
          }}
        >
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Toplam{" "}
            <strong style={{ color: "var(--primary-300)", fontWeight: 700 }}>
              {fmtInt(totalElements)}
            </strong>{" "}
            program
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Sayfa{" "}
            <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>{page + 1}</strong>{" "}
            / {totalPages}
          </span>
        </div>
      )}

      {/* Table panel */}
      <section
        style={{
          minHeight: "16rem",
          overflow: "hidden",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-subtle)",
          background: "var(--bg-surface)",
        }}
      >
        {loading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              minHeight: "16rem",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
            }}
          >
            <div className="loading-dots">
              <span /><span /><span />
            </div>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
              Programlar yükleniyor…
            </span>
          </div>
        ) : programs.length === 0 ? (
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
              🔍
            </div>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)" }}>Sonuç bulunamadı</h3>
            <p style={{ maxWidth: "28rem", fontSize: "0.8125rem", lineHeight: 1.6, color: "var(--text-muted)" }}>
              Arama kriterlerinize uygun üniversite programı bulunamadı. Lütfen filtrelerinizi gevşetip yeniden deneyin.
            </p>
          </div>
        ) : (
          <div style={{ width: "100%", overflowX: "auto" }}>
            <table className="data-table" style={{ minWidth: "1020px", tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "300px" }} />
                <col style={{ width: "110px" }} />
                <col style={{ width: "90px" }} />
                <col style={{ width: "68px" }} />
                <col style={{ width: "76px" }} />
                <col style={{ width: "88px" }} />
                <col style={{ width: "88px" }} />
                <col style={{ width: "160px" }} />
                <col style={{ width: "104px" }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Program &amp; Üniversite</th>
                  <th>Şehir</th>
                  <th>Puan Türü</th>
                  <th>Yıl</th>
                  <th>Kont.</th>
                  <th>Başarı Sırası</th>
                  <th>{guideYear} Kontenjan</th>
                  <th>Durum / Trend</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {programs.map((program) => {
                  const preferred = preferences.some((item) => codeOf(item) === codeOf(program));
                  return (
                    <tr
                      key={codeOf(program)}
                      onClick={() => onDetails(program)}
                    >
                      {/* Program & Uni */}
                      <td style={{ textAlign: "left", minWidth: 0 }}>
                        <strong
                          style={{
                            display: "block",
                            fontSize: "0.8125rem",
                            fontWeight: 600,
                            color: "var(--text-primary)",
                            lineHeight: 1.4,
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {programOf(program)}
                        </strong>
                        <span
                          style={{
                            display: "block",
                            marginTop: "0.25rem",
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          {uniOf(program)}
                        </span>
                      </td>

                      {/* City */}
                      <td style={{ textAlign: "center", whiteSpace: "nowrap", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                        {cityOf(program)}
                      </td>

                      {/* Score type & Uni type */}
                      <td style={{ textAlign: "center" }}>
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
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            color: "var(--info-text)",
                          }}
                        >
                          {scoreTypeOf(program)}
                        </span>
                        <span
                          style={{
                            display: "block",
                            marginTop: "0.25rem",
                            fontSize: "0.625rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          {uniTypeOf(program)}
                        </span>
                      </td>

                      {/* Historical years */}
                      <td style={{ padding: "0.5rem 0.5rem", textAlign: "center" }}>
                        {yearOffsets.map((offset) => (
                          <div
                            key={offset}
                            style={{
                              height: "1.25rem",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.6875rem",
                              color: "var(--text-muted)",
                            }}
                          >
                            {placementYearOf(program, offset) || "—"}
                          </div>
                        ))}
                      </td>

                      {/* Historical quota */}
                      <td style={{ padding: "0.5rem 0.5rem", textAlign: "center" }}>
                        {yearOffsets.map((offset) => (
                          <div
                            key={offset}
                            style={{
                              height: "1.25rem",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.6875rem",
                              color: "var(--text-secondary)",
                            }}
                          >
                            {fmtInt(historicalQuotaAt(program, offset)) || "—"}
                          </div>
                        ))}
                      </td>

                      {/* Historical rank */}
                      <td style={{ padding: "0.5rem 0.5rem", textAlign: "center" }}>
                        {yearOffsets.map((offset) => (
                          <div
                            key={offset}
                            style={{
                              height: "1.25rem",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.6875rem",
                              fontWeight: 600,
                              color: "var(--primary-300)",
                            }}
                          >
                            {fmtInt(rankAt(program, offset)) || "—"}
                          </div>
                        ))}
                      </td>

                      {/* Guide year quota */}
                      <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                        <span style={{ display: "block", fontSize: "0.875rem", fontWeight: 700, color: "var(--text-primary)" }}>
                          {fmtInt(quotaAt(program))}
                        </span>
                        <span style={{ fontSize: "0.625rem", color: "var(--text-muted)" }}>Kılavuz</span>
                      </td>

                      {/* Status / Trend */}
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                          <RiskStatus program={program} profile={profile} />
                          <TrendStatus program={program} />
                        </div>
                      </td>

                      {/* Action button */}
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTogglePreference(program);
                          }}
                          style={{
                            display: "inline-flex",
                            width: "100%",
                            minHeight: "2.125rem",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid",
                            padding: "0.3rem 0.625rem",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            transition: "all 0.15s ease",
                            cursor: "pointer",
                            ...(preferred
                              ? {
                                  borderColor: "var(--danger-border)",
                                  background: "var(--danger-bg)",
                                  color: "var(--danger-text)",
                                }
                              : {
                                  borderColor: "var(--info-border)",
                                  background: "var(--info-bg)",
                                  color: "var(--info-text)",
                                }),
                          }}
                        >
                          {preferred ? "Çıkar" : "+ Tercih"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            marginTop: "0.875rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-surface)",
            padding: "0.75rem 1rem",
          }}
        >
          <button
            type="button"
            className="btn-secondary"
            disabled={page === 0}
            onClick={() => onPage(page - 1)}
          >
            ← Önceki
          </button>
          <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            Sayfa{" "}
            <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>{page + 1}</strong>
            {" "}/ {totalPages}
          </span>
          <button
            type="button"
            className="btn-secondary"
            disabled={page >= totalPages - 1}
            onClick={() => onPage(page + 1)}
          >
            Sonraki →
          </button>
        </div>
      )}
    </>
  );
}
