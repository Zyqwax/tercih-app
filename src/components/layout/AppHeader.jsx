"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "../../context/AppContext";

const navigation = [
  { href: "/programlar", label: "Programlar", icon: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="size-4" aria-hidden="true">
      <circle cx="9" cy="9" r="5.5" strokeLinecap="round" />
      <path strokeLinecap="round" d="m15.5 15.5 2.5 2.5" />
    </svg>
  )},
  { href: "/ai-danisman", label: "AI Danışman", icon: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="size-4" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 3.5a6 6 0 1 1 0 12 6 6 0 0 1 0-12ZM9.5 7v3l2 1.5" />
    </svg>
  )},
];

export default function AppHeader() {
  const pathname = usePathname();
  const { preferences } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const refresh = () => window.dispatchEvent(new Event("yok:refresh"));
  const closeMobile = () => setMobileOpen(false);

  const isActive = (path) => pathname === path;

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        backgroundColor: "rgba(7, 9, 15, 0.85)",
        backdropFilter: "blur(24px) saturate(1.6)",
        WebkitBackdropFilter: "blur(24px) saturate(1.6)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div style={{ maxWidth: "1600px", margin: "0 auto", padding: "0 1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "3.75rem", gap: "1rem" }}>

          {/* Mobile menu button */}
          <button
            type="button"
            className="sm:hidden"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "2.25rem",
              height: "2.25rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-soft)",
              background: "var(--bg-elevated)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              transition: "color 0.15s ease",
            }}
            aria-controls="mobile-menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((c) => !c)}
          >
            <span className="sr-only">Ana menüyü aç</span>
            {mobileOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5" aria-hidden="true">
                <path d="M6 18 18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5" aria-hidden="true">
                <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          {/* Logo */}
          <Link
            href="/programlar"
            onClick={closeMobile}
            style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none", flexShrink: 0 }}
          >
            <div
              style={{
                width: "2rem",
                height: "2rem",
                borderRadius: "var(--radius-md)",
                background: "linear-gradient(135deg, hsl(200 75% 52%) 0%, hsl(252 68% 58%) 100%)",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
                boxShadow: "0 2px 8px rgba(56,189,248,0.3)",
              }}
            >
              <svg viewBox="0 0 16 16" fill="white" className="size-3.5" aria-hidden="true">
                <path d="M8 1 L14 4.5 L14 11.5 L8 15 L2 11.5 L2 4.5 Z" fillOpacity="0.9" />
              </svg>
            </div>
            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                }}
              >
                YÖK Tercih
              </span>
              <span
                className="hidden sm:block"
                style={{
                  fontSize: "0.625rem",
                  fontWeight: 500,
                  color: "var(--text-muted)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Asistanı
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div
            className="hidden sm:flex"
            style={{
              alignItems: "center",
              gap: "0.25rem",
              padding: "0.25rem",
              borderRadius: "var(--radius-lg)",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              marginLeft: "1rem",
              marginRight: "auto",
            }}
          >
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.4rem 0.875rem",
                  borderRadius: "calc(var(--radius-lg) - 0.25rem)",
                  fontSize: "0.8125rem",
                  fontWeight: isActive(item.href) ? 600 : 500,
                  color: isActive(item.href) ? "var(--text-primary)" : "var(--text-secondary)",
                  background: isActive(item.href) ? "var(--bg-overlay)" : "transparent",
                  border: isActive(item.href) ? "1px solid var(--border-soft)" : "1px solid transparent",
                  textDecoration: "none",
                  transition: "all 0.15s ease",
                  letterSpacing: "-0.01em",
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginLeft: "auto" }}>

            {/* Refresh button */}
            {pathname === "/programlar" && (
              <button
                type="button"
                onClick={refresh}
                title="Verileri yenile"
                style={{
                  width: "2.25rem",
                  height: "2.25rem",
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-soft)",
                  background: "var(--bg-elevated)",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  transition: "color 0.15s ease, border-color 0.15s ease",
                  flexShrink: 0,
                }}
              >
                <span className="sr-only">Verileri yenile</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4" aria-hidden="true">
                  <path d="M20 7v5h-5M4 17v-5h5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6.1 9A7 7 0 0 1 18.5 6.5L20 8M4 16l1.5 1.5A7 7 0 0 0 17.9 15" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}

            {/* Preferences button */}
            <Link
              href="/tercihler"
              aria-label={`Tercih listesi, ${preferences.length} program`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.4rem 0.75rem",
                borderRadius: "var(--radius-md)",
                border: isActive("/tercihler") ? "1px solid var(--info-border)" : "1px solid var(--border-soft)",
                background: isActive("/tercihler") ? "var(--info-bg)" : "var(--bg-elevated)",
                color: isActive("/tercihler") ? "var(--info-text)" : "var(--text-secondary)",
                fontSize: "0.8125rem",
                fontWeight: 500,
                textDecoration: "none",
                transition: "all 0.15s ease",
                flexShrink: 0,
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="size-4" style={{ color: "var(--primary-300)" }} aria-hidden="true">
                <path d="M17.5 4.75H6.5v15l5.5-3.25 5.5 3.25v-15Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="hidden sm:inline">Tercihlerim</span>
              <span
                style={{
                  display: "grid",
                  placeItems: "center",
                  minWidth: "1.25rem",
                  height: "1.25rem",
                  borderRadius: "9999px",
                  background: "var(--primary-400)",
                  padding: "0 0.3rem",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  color: "white",
                }}
              >
                {preferences.length}
              </span>
            </Link>

            {/* Profile button */}
            <Link
              href="/profil"
              aria-label="Aday profilim"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.25rem 0.625rem 0.25rem 0.25rem",
                borderRadius: "var(--radius-md)",
                border: isActive("/profil") ? "1px solid var(--info-border)" : "1px solid var(--border-soft)",
                background: isActive("/profil") ? "var(--info-bg)" : "var(--bg-elevated)",
                textDecoration: "none",
                transition: "all 0.15s ease",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: "1.75rem",
                  height: "1.75rem",
                  borderRadius: "calc(var(--radius-md) - 0.125rem)",
                  background: "linear-gradient(135deg, hsl(200 75% 52%) 0%, hsl(252 68% 58%) 100%)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "white",
                }}
              >
                A
              </div>
              <span
                className="hidden md:inline"
                style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--text-secondary)" }}
              >
                Profilim
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          style={{
            borderTop: "1px solid var(--border-subtle)",
            background: "rgba(7, 9, 15, 0.97)",
            backdropFilter: "blur(24px)",
            padding: "0.75rem 1.25rem 1rem",
          }}
          className="sm:hidden"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {[...navigation, { href: "/tercihler", label: `Tercihlerim (${preferences.length})`, icon: null }, { href: "/profil", label: "Aday Profilim", icon: null }].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem 1rem",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.875rem",
                  fontWeight: isActive(item.href) ? 600 : 500,
                  color: isActive(item.href) ? "var(--text-primary)" : "var(--text-secondary)",
                  background: isActive(item.href) ? "var(--bg-elevated)" : "transparent",
                  textDecoration: "none",
                  transition: "all 0.15s ease",
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
