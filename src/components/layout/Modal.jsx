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

  return (
    <div
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        background: "rgba(7, 9, 15, 0.85)",
        backdropFilter: "blur(12px)",
        padding: "0",
      }}
      className="sm:items-center sm:p-6"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          display: "flex",
          flexDirection: "column",
          maxHeight: "92dvh",
          width: "100%",
          maxWidth: wide ? "56rem" : "40rem",
          overflow: "hidden",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-soft)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.8)",
          borderTopLeftRadius: "var(--radius-2xl)",
          borderTopRightRadius: "var(--radius-2xl)",
        }}
        className="sm:rounded-2xl"
      >
        {/* Header */}
        <header
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            borderBottom: "1px solid var(--border-subtle)",
            background: "var(--bg-elevated)",
            padding: "1.125rem 1.5rem",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <h2
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
                lineHeight: 1.3,
              }}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                style={{
                  marginTop: "0.25rem",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "var(--text-accent)",
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            style={{
              flexShrink: 0,
              width: "2rem",
              height: "2rem",
              display: "grid",
              placeItems: "center",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-soft)",
              background: "var(--bg-overlay)",
              color: "var(--text-muted)",
              fontSize: "1.125rem",
              lineHeight: 1,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            ×
          </button>
        </header>

        {/* Body */}
        <div style={{ overflowY: "auto", padding: "1.5rem" }}>
          {children}
        </div>
      </section>
    </div>
  );
}
