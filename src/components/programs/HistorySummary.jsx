import {
  fmtInt,
  fmtScore,
  historicalQuotaAt,
  placementYearOf,
  rankAt,
  scoreAt,
} from "../../lib/program-utils";

function ChangeArrow({ current, previous, lowerIsBetter = false }) {
  if (current == null || previous == null || current === previous) return null;
  const improved = lowerIsBetter ? current < previous : current > previous;
  return (
    <span
      style={{
        marginLeft: "0.375rem",
        display: "inline-flex",
        alignItems: "center",
        fontSize: "0.75rem",
        fontWeight: 700,
        color: improved ? "var(--success-text)" : "var(--danger-text)",
      }}
      title={improved ? "Önceki yıla göre iyileşti" : "Önceki yıla göre geriledi"}
      aria-label={improved ? "İyileşti" : "Geriledi"}
    >
      {improved ? "↑" : "↓"}
    </span>
  );
}

export default function HistorySummary({ program }) {
  return (
    <div
      style={{
        overflow: "hidden",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border-subtle)",
        background: "var(--bg-elevated)",
      }}
    >
      <table className="data-table" style={{ minWidth: "34rem" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "center" }}>Yıl</th>
            <th style={{ textAlign: "right" }}>Taban Puan</th>
            <th style={{ textAlign: "right" }}>Başarı Sırası</th>
            <th style={{ textAlign: "right" }}>Kontenjan</th>
          </tr>
        </thead>
        <tbody>
          {[0, 1, 2, 3].map((offset) => {
            const score = scoreAt(program, offset);
            const prevScore = offset < 3 ? scoreAt(program, offset + 1) : null;
            const rank = rankAt(program, offset);
            const prevRank = offset < 3 ? rankAt(program, offset + 1) : null;
            const quota = historicalQuotaAt(program, offset);
            const prevQuota = offset < 3 ? historicalQuotaAt(program, offset + 1) : null;
            return (
              <tr key={offset}>
                <td style={{ textAlign: "center", color: "var(--text-secondary)", fontWeight: 500 }}>
                  {placementYearOf(program, offset)}
                </td>
                <td style={{ textAlign: "right", whiteSpace: "nowrap", color: "var(--text-secondary)" }}>
                  {fmtScore(score)}
                  <ChangeArrow current={score} previous={prevScore} />
                </td>
                <td style={{ textAlign: "right", whiteSpace: "nowrap", color: "var(--primary-300)", fontWeight: 600 }}>
                  {fmtInt(rank)}
                  <ChangeArrow current={rank} previous={prevRank} lowerIsBetter />
                </td>
                <td style={{ textAlign: "right", whiteSpace: "nowrap", color: "var(--text-secondary)" }}>
                  {fmtInt(quota)}
                  <ChangeArrow current={quota} previous={prevQuota} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
