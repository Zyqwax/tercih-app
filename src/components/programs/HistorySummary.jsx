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
      className={"ml-1.5 inline-block font-black " + (improved ? "text-emerald-400" : "text-rose-400")}
      title={improved ? "Önceki yıla göre iyileşti" : "Önceki yıla göre geriledi"}
      aria-label={improved ? "İyileşti" : "Geriledi"}
    >
      {improved ? "↑" : "↓"}
    </span>
  );
}

export default function HistorySummary({ program }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-950/30 shadow-inner shadow-black/10">
      <table className="w-full min-w-[540px] border-collapse text-right">
        <thead>
          <tr className="border-b border-slate-700/70 bg-slate-900/70">
            <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Yıl</th>
            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Taban Puan</th>
            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Başarı Sırası</th>
            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Kontenjan</th>
          </tr>
        </thead>
        <tbody>
          {[0, 1, 2, 3].map((offset) => {
            const score = scoreAt(program, offset);
            const previousScore = offset < 3 ? scoreAt(program, offset + 1) : null;
            const rank = rankAt(program, offset);
            const previousRank = offset < 3 ? rankAt(program, offset + 1) : null;
            const quota = historicalQuotaAt(program, offset);
            const previousQuota = offset < 3 ? historicalQuotaAt(program, offset + 1) : null;
            return (
              <tr key={offset} className="border-b border-white/[0.05] transition last:border-b-0 hover:bg-white/[0.025]">
                <td className="px-4 py-3.5 text-center text-xs font-bold text-slate-400">{placementYearOf(program, offset)}</td>
                <td className="whitespace-nowrap px-4 py-3.5 text-sm font-medium text-slate-300">
                  {fmtScore(score)}
                  <ChangeArrow current={score} previous={previousScore} />
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-sm font-medium text-slate-300">
                  {fmtInt(rank)}
                  <ChangeArrow current={rank} previous={previousRank} lowerIsBetter />
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-sm font-medium text-slate-300">
                  {fmtInt(quota)}
                  <ChangeArrow current={quota} previous={previousQuota} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
