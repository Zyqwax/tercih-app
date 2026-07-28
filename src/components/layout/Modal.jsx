"use client";

import { useEffect } from "react";

export default function Modal({ open, title, subtitle, onClose, children, wide = false }) {
  useEffect(() => {
    if (!open) return;
    const close = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open, onClose]);
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/85 p-0 backdrop-blur-md sm:items-center sm:p-5" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className={`flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/60 sm:rounded-3xl ${wide ? "max-w-6xl" : ""}`} role="dialog" aria-modal="true" aria-label={title}><header className="flex shrink-0 items-start justify-between gap-5 border-b border-white/10 bg-slate-950/45 px-5 py-4 sm:px-6 sm:py-5 [&_h2]:text-lg [&_h2]:font-black [&_h2]:leading-6 [&_h2]:text-white sm:[&_h2]:text-xl [&_p]:mt-1 [&_p]:text-sm [&_p]:text-slate-500"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button className="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-700/80 bg-slate-900 text-xl text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white" onClick={onClose} aria-label="Kapat">×</button></header><div className="overflow-y-auto p-5 sm:p-6">{children}</div></section></div>;
}
