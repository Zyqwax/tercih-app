"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "../../context/AppContext";

const navigation = [
  { href: "/programlar", label: "Programlar" },
  { href: "/ai-danisman", label: "AI Danışman" },
];

export default function AppHeader() {
  const pathname = usePathname();
  const { preferences } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const refresh = () => window.dispatchEvent(new Event("yok:refresh"));
  const closeMobile = () => setMobileOpen(false);
  const navClass = (path, mobile = false) => {
    const base = mobile
      ? "block rounded-md px-3 py-2 text-base font-medium transition"
      : "rounded-md px-3 py-2 text-sm font-medium transition";
    return pathname === path
      ? base + " bg-slate-950/60 text-white shadow-sm"
      : base + " text-slate-300 hover:bg-white/5 hover:text-white";
  };

  return (
    <nav className="sticky top-0 z-40 bg-slate-800/85 shadow-lg shadow-black/10 backdrop-blur-xl after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-white/10">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button
              type="button"
              className="relative inline-flex items-center justify-center rounded-md p-2 text-slate-400 transition hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
              aria-controls="mobile-menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((current) => !current)}
            >
              <span className="sr-only">Ana menüyü aç</span>
              {!mobileOpen ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-6" aria-hidden="true"><path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-6" aria-hidden="true"><path d="M6 18 18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
              )}
            </button>
          </div>

          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <Link href="/programlar" className="flex shrink-0 items-center gap-2.5" onClick={closeMobile}>
              <span className="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-500 text-lg font-black text-slate-950 shadow-lg shadow-cyan-950/30">◇</span>
              <span className="hidden text-sm font-black tracking-tight text-white lg:block">YÖK Tercih Asistanı</span>
            </Link>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex h-full items-center space-x-2">
                {navigation.map((item) => (
                  <Link key={item.href} href={item.href} className={navClass(item.href)} aria-current={pathname === item.href ? "page" : undefined}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {pathname === "/programlar" && (
              <button
                type="button"
                className="relative rounded-full p-2 text-slate-400 transition hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
                onClick={refresh}
                title="Verileri yenile"
              >
                <span className="sr-only">Verileri yenile</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="size-5" aria-hidden="true"><path d="M20 7v5h-5M4 17v-5h5" strokeLinecap="round" strokeLinejoin="round" /><path d="M6.1 9A7 7 0 0 1 18.5 6.5L20 8M4 16l1.5 1.5A7 7 0 0 0 17.9 15" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            )}

            <Link
              href="/tercihler"
              className={"relative rounded-full p-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 " + (pathname === "/tercihler" ? "bg-slate-950/60 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white")}
              aria-label={"Tercih listesi, " + preferences.length + " program"}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-5" aria-hidden="true"><path d="M6.75 4.75h10.5v15L12 16.5l-5.25 3.25v-15Z" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-cyan-400 px-1 text-[10px] font-black leading-5 text-slate-950 ring-2 ring-slate-800">{preferences.length}</span>
            </Link>

            <Link
              href="/profil"
              className="relative ml-2 flex rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
              aria-label="Aday profilim"
            >
              <span className={"grid size-9 place-items-center rounded-full bg-gradient-to-br from-slate-600 to-slate-800 text-sm font-black text-slate-100 outline -outline-offset-1 transition hover:from-cyan-500 hover:to-indigo-600 " + (pathname === "/profil" ? "outline-2 outline-cyan-400" : "outline-white/15")}>A</span>
            </Link>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div id="mobile-menu" className="border-t border-white/10 bg-slate-900/95 px-2 pb-3 pt-2 sm:hidden">
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className={navClass(item.href, true)} aria-current={pathname === item.href ? "page" : undefined} onClick={closeMobile}>
                {item.label}
              </Link>
            ))}
            <Link href="/tercihler" className={navClass("/tercihler", true)} onClick={closeMobile}>Tercihlerim <span className="ml-1 text-cyan-300">({preferences.length})</span></Link>
            <Link href="/profil" className={navClass("/profil", true)} onClick={closeMobile}>Aday profilim</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
