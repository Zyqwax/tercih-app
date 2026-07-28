export const emptyProfile = { scoreType: "SAY", rank: "", score: "", maxPrefs: 24 };
export const emptyFilters = { program: "", city: "", university: "", scoreType: "SAY", degree: "", uniType: "", minRank: "", maxRank: "", minScore: "", maxScore: "", language: "", query: "" };

export const pick = (record, ...keys) => keys.map((key) => record?.[key]).find((value) => value !== undefined && value !== null);
export const num = (value) => { if (value === "" || value == null) return null; if (typeof value === "number") return Number.isFinite(value) ? value : null; let text = String(value).trim(); if (text.includes(",")) text = text.replace(/\./g, "").replace(",", "."); const result = Number(text); return Number.isFinite(result) ? result : null; };
const positiveNum = (value) => { const result = num(value); return result !== null && result > 0 ? result : null; };
export const codeOf = (program) => String(pick(program, "kilavuzKodu", "kilavuz_kodu") || "");
export const uniOf = (program) => pick(program, "universiteAdi", "universite_adi") || "Bilinmeyen üniversite";
export const programOf = (program) => pick(program, "birimAdi", "birim_adi", "birimGrupAdi", "birim_grup_adi") || "Bilinmeyen program";
export const cityOf = (program) => pick(program, "ilAdi", "il_adi", "uniIlAdi", "uni_il_adi") || "—";
export const scoreTypeOf = (program) => pick(program, "puanTuru", "puan_turu") || "—";
export const uniTypeOf = (program) => pick(program, "universiteTuru", "universite_turu") || "—";
export const facultyOf = (program) => pick(program, "fymkAdi", "fymk_adi") || "—";
export const languageOf = (program) => pick(program, "ogrenimDiliAdi", "ogrenim_dili_adi") || "—";
export const scholarshipOf = (program) => pick(program, "bursOraniAdi", "burs_orani_adi") || (uniTypeOf(program) === "DEVLET" ? "Ücretsiz" : "—");
export const rankAt = (program, offset = 0) => positiveNum(pick(program, offset ? `basariSirasi${offset}` : "basariSirasi", offset ? `basari_sirasi${offset}` : "basari_sirasi", offset ? `basari_sirasi_${offset}` : "basari_sirasi"));
export const scoreAt = (program, offset = 0) => positiveNum(pick(program, offset ? `minPuan${offset}` : "minPuan", offset ? `min_puan${offset}` : "min_puan", offset ? `min_puan_${offset}` : "min_puan"));
export const quotaAt = (program, offset = 0) => num(pick(program, offset ? `kontenjan${offset}` : "kontenjan", offset ? `kontenjan_${offset}` : "kontenjan"));
const sumAvailable = (...values) => { const available = values.map(num).filter((value) => value !== null); return available.length ? available.reduce((total, value) => total + value, 0) : null; };
export const historicalQuotaAt = (program, offset = 0) => {
  const suffix = offset + 1;
  return sumAvailable(pick(program, `gk${suffix}`), pick(program, `obk${suffix}`));
};
export const placedAt = (program, offset = 0) => {
  const suffix = offset + 1;
  return sumAvailable(pick(program, `gkY${suffix}`), pick(program, `obkY${suffix}`));
};
export const guideYearOf = (program) => Number(pick(program, "yil") || new Date().getFullYear());
export const placementYearOf = (program, offset = 0) => guideYearOf(program) - 1 - offset;
export const fmtInt = (value) => value == null ? "—" : new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(value);
export const fmtScore = (value) => value == null ? "—" : new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(value);
export const normalized = (value = "") => String(value ?? "").toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i");

export function riskOf(program, profile) {
  const userRank = num(profile.rank), programRank = rankAt(program);
  if (!userRank || !programRank || profile.scoreType !== scoreTypeOf(program)) return { key: "unknown", label: "Belirsiz" };
  const ratio = userRank / programRank;
  if (ratio > 1.14) return { key: "reach", label: "İddialı" };
  if (ratio >= 0.87) return { key: "target", label: "Dengeli" };
  return { key: "safe", label: "Güvenli" };
}

export function trendOf(program) {
  const current = rankAt(program), previous = rankAt(program, 1);
  if (!current || !previous) return { key: "unknown", label: "Veri yok" };
  const percent = ((previous - current) / previous) * 100;
  if (percent > 4) return { key: "rising", label: `İyileşiyor %${Math.abs(percent).toFixed(1)}` };
  if (percent < -4) return { key: "falling", label: `Geriliyor %${Math.abs(percent).toFixed(1)}` };
  return { key: "stable", label: "Dengeli" };
}
