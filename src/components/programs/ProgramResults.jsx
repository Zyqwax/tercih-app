import {
  cityOf,
  codeOf,
  facultyOf,
  fmtInt,
  guideYearOf,
  languageOf,
  programOf,
  quotaAt,
  riskOf,
  scholarshipOf,
  scoreTypeOf,
  trendOf,
  uniOf,
  uniTypeOf,
} from "../../lib/program-utils";
import HistorySummary from "./HistorySummary";
const tone = {
  reach: "border-rose-400/20 bg-rose-400/10 text-rose-300",
  down: "border-rose-400/20 bg-rose-400/10 text-rose-300",
  target: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  flat: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  unknown: "border-slate-500/30 bg-slate-500/10 text-slate-300",
  safe: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  up: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
};

export default function ProgramResults({
  programs,
  loading,
  view,
  onView,
  profile,
  preferences,
  onTogglePreference,
  onDetails,
  page,
  pageData,
  onPage,
}) {
  const totalPages = pageData.totalPages ?? pageData.total_pages ?? 1;
  return (
    <>
      <section className="min-h-64 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 shadow-2xl shadow-black/20 backdrop-blur-xl">
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
        ) : view === "table" ? (
          <div className="w-full overflow-x-auto [&>table]:w-full [&>table]:min-w-[980px] [&>table]:border-collapse [&>table]:text-left [&_thead]:bg-slate-950/60 [&_th]:border-b [&_th]:border-white/10 [&_th]:px-4 [&_th]:py-3 [&_th]:text-[11px] [&_th]:font-black [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-slate-500 [&_td]:border-b [&_td]:border-white/[0.06] [&_td]:px-4 [&_td]:py-4 [&_td]:align-top [&_td]:text-sm [&_td]:text-slate-300">
            <table>
              <thead>
                <tr>
                  <th>Program</th>
                  <th>Şehir</th>
                  <th>Tür</th>
                  <th>Son 4 yıl · sıra / puan / kont. / yer.</th>
                  <th>Kılavuz kont.</th>
                  <th>Trend</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {programs.map((program) => {
                  const preferred = preferences.some(
                    (item) => codeOf(item) === codeOf(program),
                  );
                  const trend = trendOf(program);
                  return (
                    <tr
                      className="cursor-pointer transition hover:bg-cyan-400/[0.04] focus-visible:bg-cyan-400/[0.05] [&_strong]:block [&_strong]:text-sm [&_strong]:font-extrabold [&_strong]:text-white [&_small]:mt-1 [&_small]:block [&_small]:text-xs [&_small]:leading-5 [&_small]:text-slate-500"
                      key={codeOf(program)}
                      tabIndex="0"
                      onClick={() => onDetails(program)}
                      onKeyDown={(event) =>
                        event.key === "Enter" && onDetails(program)
                      }
                    >
                      <td>
                        <strong>{programOf(program)}</strong>
                        <small>{uniOf(program)} · Detayları görüntüle</small>
                      </td>
                      <td>{cityOf(program)}</td>
                      <td>
                        <span className="inline-flex min-h-6 items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide border-sky-400/20 bg-sky-400/10 text-sky-300">
                          {scoreTypeOf(program)}
                        </span>{" "}
                        {uniTypeOf(program)}
                      </td>
                      <td>
                        <HistorySummary program={program} />
                      </td>
                      <td>
                        {fmtInt(quotaAt(program))}
                        <small>{guideYearOf(program)} kılavuzu</small>
                      </td>
                      <td>
                        <span
                          className={`inline-flex min-h-6 items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide ${tone[trend.key] || tone.unknown}`}
                        >
                          {trend.label}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-bold transition duration-200 focus-visible:ring-4 focus-visible:ring-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-50 ${preferred ? "border-rose-400/20 bg-rose-500/10 text-rose-300 hover:border-rose-400/40 hover:bg-rose-500/20" : "border-cyan-300/20 bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 shadow-lg shadow-cyan-950/25 hover:-translate-y-0.5 hover:from-cyan-300 hover:to-sky-400"}`}
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
        ) : (
          <div className="grid gap-4 p-4 sm:p-5 xl:grid-cols-2">
            {programs.map((program) => {
              const preferred = preferences.some(
                (item) => codeOf(item) === codeOf(program),
              );
              const risk = riskOf(program, profile),
                trend = trendOf(program);
              return (
                <article
                  className="cursor-pointer rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.055] to-transparent p-5 transition duration-200 hover:-translate-y-0.5 hover:border-cyan-400/25 hover:shadow-xl hover:shadow-cyan-950/20 focus-visible:border-cyan-400/40"
                  key={codeOf(program)}
                  tabIndex="0"
                  onClick={() => onDetails(program)}
                  onKeyDown={(event) =>
                    event.key === "Enter" && onDetails(program)
                  }
                >
                  <div className="flex items-start justify-between gap-4 max-sm:flex-col [&_h3]:mt-3 [&_h3]:text-base [&_h3]:font-black [&_h3]:leading-6 [&_h3]:text-white [&_p]:mt-1 [&_p]:text-sm [&_p]:text-slate-400">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex min-h-6 items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide border-sky-400/20 bg-sky-400/10 text-sky-300">
                          {scoreTypeOf(program)}
                        </span>
                        <span
                          className={`inline-flex min-h-6 items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide ${tone[risk.key] || tone.unknown}`}
                        >
                          {risk.label}
                        </span>
                        <span
                          className={`inline-flex min-h-6 items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide ${tone[trend.key] || tone.unknown}`}
                        >
                          {trend.label}
                        </span>
                      </div>
                      <h3>{programOf(program)}</h3>
                      <p>
                        {uniOf(program)} · {cityOf(program)}
                      </p>
                    </div>
                    <button
                      className={`inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-bold transition duration-200 focus-visible:ring-4 focus-visible:ring-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-50 ${preferred ? "border-rose-400/20 bg-rose-500/10 text-rose-300 hover:border-rose-400/40 hover:bg-rose-500/20" : "border-cyan-300/20 bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 shadow-lg shadow-cyan-950/25 hover:-translate-y-0.5 hover:from-cyan-300 hover:to-sky-400"}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onTogglePreference(program);
                      }}
                    >
                      {preferred ? "Çıkar" : "+ Tercih"}
                    </button>
                  </div>
                  <div className="my-4 rounded-2xl border border-white/[0.07] bg-slate-950/40 p-3 [&>header]:mb-3 [&>header]:flex [&>header]:items-center [&>header]:justify-between [&>header]:gap-3 [&>header]:text-[11px] [&>header]:font-bold [&>header]:uppercase [&>header]:tracking-wide [&>header]:text-slate-500">
                    <header>
                      <span>Son 4 yerleştirme</span>
                      <span>
                        {guideYearOf(program)} kontenjanı:{" "}
                        <b>{fmtInt(quotaAt(program))}</b>
                      </span>
                    </header>
                    <HistorySummary program={program} />
                  </div>
                  <footer>
                    <span>
                      {facultyOf(program)} · {languageOf(program)} ·{" "}
                      {scholarshipOf(program)}
                    </span>
                  </footer>
                </article>
              );
            })}
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
          <button
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
