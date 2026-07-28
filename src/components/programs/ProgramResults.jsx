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

const riskTone = {
  safe: "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300 [&_i]:bg-emerald-400",
  target: "border-sky-400/20 bg-sky-400/[0.08] text-sky-300 [&_i]:bg-sky-400",
  reach: "border-amber-400/20 bg-amber-400/[0.08] text-amber-300 [&_i]:bg-amber-400",
  unknown: "border-slate-600/60 bg-slate-800/60 text-slate-400 [&_i]:bg-slate-500",
};

const trendTone = {
  rising: "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300 [&_i]:bg-emerald-400",
  falling: "border-rose-400/20 bg-rose-400/[0.08] text-rose-300 [&_i]:bg-rose-400",
  stable: "border-sky-400/20 bg-sky-400/[0.08] text-sky-300 [&_i]:bg-sky-400",
  unknown: "border-slate-600/60 bg-slate-800/60 text-slate-400 [&_i]:bg-slate-500",
};

function RiskStatus({ program, profile }) {
  const risk = riskOf(program, profile);

  return (
    <span className={"inline-flex min-w-28 items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 " + (riskTone[risk.key] || riskTone.unknown)}>
      <span className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wide opacity-70">
        <i className="size-1.5 shrink-0 rounded-full" />
        Uygunluk
      </span>
      <strong className="text-[10px] font-bold">{risk.label}</strong>
    </span>
  );
}

function TrendStatus({ program }) {
  const trend = trendOf(program);
  const match = trend.label.match(/^(.*?)\s+(%[\d.,]+)$/);
  const title = match?.[1] || trend.label;
  const detail = match?.[2] || (trend.key === "unknown" ? "Karşılaştırma yok" : "Son iki yıl");

  return (
    <span className={"inline-flex min-w-28 flex-col items-start rounded-lg border px-2.5 py-1.5 text-left " + (trendTone[trend.key] || trendTone.unknown)}>
      <span className="flex items-center gap-1.5 text-[10px] font-bold leading-none">
        <i className="size-1.5 shrink-0 rounded-full shadow-[0_0_8px_currentColor]" />
        {title}
      </span>
      <span className="mt-1 pl-3 text-[9px] font-medium leading-none opacity-70">{detail}</span>
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
  const yearOffsets = [0, 1, 2, 3];
  const guideYear = programs[0] ? guideYearOf(programs[0]) : new Date().getFullYear();
  return (
    <>
      <section className="min-h-64 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/55 shadow-xl shadow-black/15">
        {loading ? (
          <div className="flex min-h-52 items-center justify-center gap-2 [&>i]:size-2.5 [&>i]:animate-pulse [&>i]:rounded-full [&>i]:bg-cyan-300">
            <i />
            <i />
            <i />
          </div>
        ) : programs.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-2 p-8 text-center [&>b]:text-lg [&>b]:font-black [&>b]:text-white [&>span]:max-w-md [&>span]:text-sm [&>span]:leading-6 [&>span]:text-slate-500">
            <b>Sonuç bulunamadı</b>
            <span>Filtrelerini değiştirip yeniden deneyebilirsin.</span>
          </div>
        ) : (
          <div className="w-full overflow-x-auto [&>table]:w-full [&>table]:min-w-[1080px] [&>table]:table-fixed [&>table]:border-collapse [&_thead]:bg-slate-950/70 [&_th]:border-b [&_th]:border-white/10 [&_th]:px-3 [&_th]:py-2.5 [&_th]:text-center [&_th]:text-[10px] [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-[0.12em] [&_th]:text-slate-500 [&_td]:border-b [&_td]:border-white/[0.06] [&_td]:px-3 [&_td]:py-2.5 [&_td]:text-center [&_td]:align-middle [&_td]:text-sm [&_td]:text-slate-300">
            <table>
              <colgroup>
                <col className="w-[320px]" />
                <col className="w-[100px]" />
                <col className="w-[96px]" />
                <col className="w-[64px]" />
                <col className="w-[64px]" />
                <col className="w-[72px]" />
                <col className="w-[104px]" />
                <col className="w-[160px]" />
                <col className="w-[100px]" />
              </colgroup>
              <thead>
                <tr>
                  <th>Program</th>
                  <th>Şehir</th>
                  <th>Tür</th>
                  <th>Yıl</th>
                  <th>Kont.</th>
                  <th>Sıra</th>
                  <th>{guideYear} Kılavuz</th>
                  <th>Durum / Trend</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {programs.map((program) => {
                  const preferred = preferences.some((item) => codeOf(item) === codeOf(program));
                  return (
                    <tr
                      className="cursor-pointer transition-colors odd:bg-white/[0.012] hover:bg-cyan-400/[0.045] focus-visible:bg-cyan-400/[0.05] [&_strong]:block [&_strong]:text-sm [&_strong]:font-extrabold [&_strong]:text-white [&_small]:mt-1 [&_small]:block [&_small]:text-xs [&_small]:leading-5 [&_small]:text-slate-500"
                      key={codeOf(program)}
                      onClick={() => onDetails(program)}
                    >
                      <td className="min-w-0">
                        <strong className="line-clamp-2 leading-5">{programOf(program)}</strong>
                        <small>{uniOf(program)}</small>
                      </td>
                      <td className="whitespace-nowrap text-xs font-medium text-slate-400">{cityOf(program)}</td>
                      <td>
                        <span className="inline-flex min-h-6 items-center rounded-full border border-sky-400/20 bg-sky-400/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-sky-300">
                          {scoreTypeOf(program)}
                        </span>
                        <small>{uniTypeOf(program)}</small>
                      </td>
                      <td className="w-16 px-1! py-2!">
                        <div className="flex h-6 items-center justify-center border-b border-white/[0.06] text-[11px] font-medium text-slate-400 last:border-b-0">2022</div>
                        <div className="flex h-6 items-center justify-center border-b border-white/[0.06] text-[11px] font-medium text-slate-400 last:border-b-0">2023</div>
                        <div className="flex h-6 items-center justify-center border-b border-white/[0.06] text-[11px] font-medium text-slate-400 last:border-b-0">2024</div>
                        <div className="flex h-6 items-center justify-center border-b border-white/[0.06] text-[11px] font-medium text-slate-400 last:border-b-0">2025</div>
                      </td>
                      <td className="w-16 px-1! py-2!">
                        <div className="flex h-6 items-center justify-center border-b border-white/[0.06] text-[11px] font-medium text-slate-400 last:border-b-0">120</div>
                        <div className="flex h-6 items-center justify-center border-b border-white/[0.06] text-[11px] font-medium text-slate-400 last:border-b-0">120</div>
                        <div className="flex h-6 items-center justify-center border-b border-white/[0.06] text-[11px] font-medium text-slate-400 last:border-b-0">120</div>
                        <div className="flex h-6 items-center justify-center border-b border-white/[0.06] text-[11px] font-medium text-slate-400 last:border-b-0">120</div>
                      </td>
                      <td className="w-16 px-1! py-2!">
                        <div className="flex h-6 items-center justify-center border-b border-white/[0.06] text-[11px] font-medium text-slate-400 last:border-b-0">120</div>
                        <div className="flex h-6 items-center justify-center border-b border-white/[0.06] text-[11px] font-medium text-slate-400 last:border-b-0">120</div>
                        <div className="flex h-6 items-center justify-center border-b border-white/[0.06] text-[11px] font-medium text-slate-400 last:border-b-0">120</div>
                        <div className="flex h-6 items-center justify-center border-b border-white/[0.06] text-[11px] font-medium text-slate-400 last:border-b-0">120</div>
                      </td>
                      <td className="whitespace-nowrap">
                        <span className="block text-sm font-semibold text-slate-200">{fmtInt(quotaAt(program))}</span>
                        <small>kontenjan</small>
                      </td>
                      <td><div className="inline-flex flex-col gap-1"><RiskStatus program={program} profile={profile} /><TrendStatus program={program} /></div></td>
                      <td className="text-center">
                        <button
                          className={
                            "inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition duration-200 focus-visible:ring-4 focus-visible:ring-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-50 " +
                            (preferred
                              ? "border-rose-400/20 bg-rose-500/10 text-rose-300 hover:border-rose-400/40 hover:bg-rose-500/20"
                              : "border-cyan-300/20 bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 shadow-lg shadow-cyan-950/25 hover:-translate-y-0.5 hover:from-cyan-300 hover:to-sky-400")
                          }
                          onClick={(event) => {
                            event.stopPropagation();
                            onTogglePreference(program);
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
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-2 text-sm text-slate-400 [&>button]:rounded-xl [&>button]:px-4 [&>button]:py-2 [&>button]:font-bold [&>button]:text-cyan-300 [&>button]:transition hover:[&>button]:bg-cyan-400/10 disabled:[&>button]:text-slate-700">
          <button disabled={page === 0} onClick={() => onPage(page - 1)}>
            ← Önceki
          </button>
          <span>
            Sayfa {page + 1} / {totalPages}
          </span>
          <button disabled={page >= totalPages - 1} onClick={() => onPage(page + 1)}>
            Sonraki →
          </button>
        </div>
      )}
    </>
  );
}
