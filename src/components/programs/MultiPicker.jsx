export default function MultiPicker({ label, placeholder, value, onChange, onAdd, selected, onRemove, options }) {
  const fieldId = `field-${label.replace(/\s/g, "-")}`;
  const listId = `list-${label.replace(/\s/g, "-")}`;
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label className="px-0.5 text-[10px] font-semibold text-slate-400" htmlFor={fieldId}>{label}</label>
      <div className="relative">
        <input id={fieldId} list={listId} value={value} onChange={(event) => onChange(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); onAdd(); } }} placeholder={placeholder} className="h-9 rounded-md border-slate-700/80 bg-[#2d2d30] px-2.5 py-1.5 pr-9 text-xs text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
        <button type="button" className="absolute right-1 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-slate-500 transition hover:bg-blue-500/10 hover:text-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/20" onClick={onAdd} aria-label={`${label} ekle`}><span className="text-base leading-none">+</span></button>
      </div>
      <datalist id={listId}>{options.map((option) => <option key={option.id} value={option.name} />)}</datalist>
      {selected.length > 0 && <div className="flex flex-wrap gap-1.5">{selected.map((item) => <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/25 bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-300" key={item.id}>{item.name}<button className="text-base leading-none text-blue-400 hover:text-rose-400" onClick={() => onRemove(item.id)} aria-label={`${item.name} kaldır`}>×</button></span>)}</div>}
    </div>
  );
}
