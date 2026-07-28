"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "../../context/AppContext";

export default function AppHeader() {
  const pathname = usePathname();
  const { preferences } = useApp();
  const refresh = () => window.dispatchEvent(new Event("yok:refresh"));
  const active = (path) =>
    pathname === path
      ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-100 shadow-lg shadow-cyan-950/20 ring-1 ring-cyan-400/20"
      : "";
  return (
    <header className="sticky top-0 z-40 mx-auto flex min-h-20 w-full items-center justify-between gap-4 border-b border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur-2xl sm:px-6 lg:px-8 max-sm:items-start [&>nav]:flex [&>nav]:items-center [&>nav]:justify-end [&>nav]:gap-2 [&>nav]:overflow-x-auto max-sm:[&>nav]:w-[calc(100vw-5rem)] max-sm:[&>nav]:justify-start">
      <Link
        href="/programlar"
        className="flex shrink-0 items-center gap-3 text-slate-50 transition hover:text-white [&_h1]:text-sm [&_h1]:font-black [&_h1]:tracking-tight max-sm:[&_h1]:hidden sm:[&_h1]:text-base"
      >
        <span className="grid size-10 place-items-center rounded-2xl border border-cyan-300/25 bg-gradient-to-br from-cyan-400/25 to-indigo-500/25 text-xl text-cyan-200 shadow-lg shadow-cyan-950/40">
          ◇
        </span>
        <div>
          <h1>YÖK Tercih Asistanı</h1>
        </div>
      </Link>
      <nav>
        {pathname === "/programlar" && (
          <button
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-bold transition duration-200 focus-visible:ring-4 focus-visible:ring-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-50 border-cyan-300/20 bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 shadow-lg shadow-cyan-950/25 hover:-translate-y-0.5 hover:from-cyan-300 hover:to-sky-400"
            onClick={refresh}
          >
            ↻ Verileri yenile
          </button>
        )}
        <Link
          className={`inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-bold transition duration-200 focus-visible:ring-4 focus-visible:ring-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-50 border-slate-700/80 bg-slate-900/70 text-slate-300 hover:border-slate-600 hover:bg-slate-800 hover:text-white ${active("/profil")}`}
          href="/profil"
        >
          Aday profilim
        </Link>
        <Link
          className={`inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-bold transition duration-200 focus-visible:ring-4 focus-visible:ring-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-50 border-slate-700/80 bg-slate-900/70 text-slate-300 hover:border-slate-600 hover:bg-slate-800 hover:text-white ${active("/programlar")}`}
          href="/programlar"
        >
          Programlar
        </Link>
        <Link
          className={`inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-bold transition duration-200 focus-visible:ring-4 focus-visible:ring-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-50 border-slate-700/80 bg-slate-900/70 text-slate-300 hover:border-slate-600 hover:bg-slate-800 hover:text-white ${active("/ai-danisman")}`}
          href="/ai-danisman"
        >
          ✦ AI Danışman
        </Link>
        <Link
          className={`inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-bold transition duration-200 focus-visible:ring-4 focus-visible:ring-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-50 border-slate-700/80 bg-slate-900/70 text-slate-300 hover:border-slate-600 hover:bg-slate-800 hover:text-white ${active("/tercihler")}`}
          href="/tercihler"
        >
          ☷ Tercihler <b>{preferences.length}</b>
        </Link>
      </nav>
    </header>
  );
}
