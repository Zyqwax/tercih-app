export default function MultiPicker({ label, placeholder, value, onChange, onAdd, selected, onRemove, options }) {
  const fieldId = `field-${label.replace(/\s/g, "-")}`;
  const listId = `list-${label.replace(/\s/g, "-")}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", minWidth: 0 }}>
      <label className="form-label" htmlFor={fieldId}>
        {label}
      </label>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <input
          id={fieldId}
          list={listId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd();
            }
          }}
          placeholder={placeholder}
          style={{ paddingRight: "2.5rem" }}
        />
        <button
          type="button"
          onClick={onAdd}
          aria-label={`${label} ekle`}
          title="Seçilen değeri listeye ekle"
          style={{
            position: "absolute",
            right: "0.375rem",
            width: "1.75rem",
            height: "1.75rem",
            display: "grid",
            placeItems: "center",
            borderRadius: "calc(var(--radius-md) - 0.25rem)",
            border: "none",
            background: "rgba(56,189,248,0.1)",
            color: "var(--primary-300)",
            cursor: "pointer",
            transition: "all 0.15s ease",
            fontSize: "1rem",
            fontWeight: 600,
            lineHeight: 1,
          }}
        >
          +
        </button>
      </div>
      <datalist id={listId}>
        {options.map((opt) => (
          <option key={opt.id} value={opt.name} />
        ))}
      </datalist>

      {selected.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", marginTop: "0.25rem" }}>
          {selected.map((item) => (
            <span
              key={item.id}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                padding: "0.25rem 0.625rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--info-border)",
                background: "var(--info-bg)",
                fontSize: "0.75rem",
                fontWeight: 500,
                color: "var(--info-text)",
              }}
            >
              {item.name}
              <button
                onClick={() => onRemove(item.id)}
                aria-label={`${item.name} kaldır`}
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: "1rem",
                  height: "1rem",
                  border: "none",
                  background: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  lineHeight: 1,
                  padding: 0,
                  transition: "color 0.15s ease",
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
