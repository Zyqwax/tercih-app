export default function MultiPicker({ label, placeholder, value, onChange, onAdd, selected, onRemove, options }) {
  const fieldId = `field-${label.replace(/\s/g, "-")}`;
  const listId = `list-${label.replace(/\s/g, "-")}`;
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label className="sr-only" htmlFor={fieldId}>{label}</label>
      <div className="relative">
        <input id={fieldId} list={listId} value={value} onChange={(event) => onChange(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); onAdd(); } }} placeholder={placeholder} className="min-h-12 pr-11" />
        <button type="button" className="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-md text-slate-400 transition hover:bg-slate-800 hover:text-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-500/20" onClick={onAdd} aria-label={`${label} ekle`}><span className="text-xl leading-none">+</span></button>
      </div>
      <datalist id={listId}>{options.map((option) => <option key={option.id} value={option.name} />)}</datalist>
      {selected.length > 0 && <div className="flex flex-wrap gap-1.5">{selected.map((item) => <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-300" key={item.id}>{item.name}<button className="text-base leading-none text-emerald-500 hover:text-rose-500" onClick={() => onRemove(item.id)} aria-label={`${item.name} kaldır`}>×</button></span>)}</div>}
    </div>
  );
}
