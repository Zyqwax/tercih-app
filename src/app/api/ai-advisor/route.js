import { getAdvisorCandidates } from "@/lib/yok-api-data";
import { riskOf } from "@/lib/program-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "qwen/qwen3.6-27b";
const pick = (record, ...keys) => keys.map((key) => record?.[key]).find((value) => value !== undefined && value !== null);
const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || min));

function compactProgram(program, profile) {
  return {
    code: String(pick(program, "kilavuzKodu", "kilavuz_kodu")),
    program: pick(program, "birimAdi", "birim_adi"),
    university: pick(program, "universiteAdi", "universite_adi"),
    city: pick(program, "ilAdi", "il_adi", "uniIlAdi", "uni_il_adi"),
    universityType: pick(program, "universiteTuru", "universite_turu"),
    language: pick(program, "ogrenimDiliAdi", "ogrenim_dili_adi"),
    rank2025: pick(program, "basariSirasi", "basari_sirasi"),
    rank2024: pick(program, "basariSirasi1", "basari_sirasi1"),
    rank2023: pick(program, "basariSirasi2", "basari_sirasi2"),
    quota2026: pick(program, "kontenjan"),
    scholarship: pick(program, "bursOraniAdi", "burs_orani_adi"),
    category: riskOf(program, profile).label,
  };
}

function parseJson(content) {
  try { return JSON.parse(content); }
  catch {
    const start = content.indexOf("{"), end = content.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(content.slice(start, end + 1));
    throw new Error("Model geçerli JSON üretmedi.");
  }
}

export async function POST(request) {
  if (!process.env.GROQ_API_KEY) {
    return Response.json({ code: "GROQ_NOT_CONFIGURED", message: "Groq API anahtarı yapılandırılmamış.", setup: "Proje kökündeki .env.local dosyasına GROQ_API_KEY ekleyip sunucuyu yeniden başlat." }, { status: 503 });
  }
  try {
    const { profile = {}, answers = {} } = await request.json();
    if (!Number(profile.rank) || !profile.scoreType) return Response.json({ message: "Önce aday profilindeki puan türü ve sıralama bilgilerini doldur." }, { status: 400 });
    const requestedCount = clamp(answers.count, 6, Math.min(24, Number(profile.maxPrefs) || 24));
    const candidates = await getAdvisorCandidates(profile, answers, 36);
    if (!candidates.length) return Response.json({ message: "Yanıtlarına uyan aday program bulunamadı. Bölüm, şehir veya dil tercihlerini biraz genişlet." }, { status: 422 });
    const model = process.env.GROQ_MODEL || DEFAULT_MODEL;
    const system = `Sen Türkiye YKS tercihleri konusunda temkinli bir tercih danışmanısın. Yalnızca kullanıcıya verilen aday programlardan seçim yap. Program kodu uydurma. Sıralama sayılarını karşılaştırırken daha küçük sayının daha seçici olduğunu unutma. Her programdaki category sunucu tarafından hesaplanmıştır; değiştirme ve öneride aynı değeri kullan. Geçmiş sıralamalar yerleşme olasılığı değildir; “garanti”, “neredeyse garanti”, “kesin” veya “neredeyse imkânsız” gibi ifadeleri hiçbir yerde kullanma. Kullanıcının bölüm, şehir, dil, üniversite türü, kariyer önceliği ve risk yaklaşımını birlikte değerlendir. Tam olarak ${requestedCount} öneri seçmeye çalış ve iddialı, dengeli, güvenli seçenekleri kullanıcının risk yaklaşımına göre dağıt. Yanıtın yalnızca geçerli JSON olsun: {"summary":"...","strategy":"...","recommendations":[{"code":"...","reason":"...","category":"İddialı|Dengeli|Güvenli"}],"warnings":["..."]}.`;
    const user = JSON.stringify({ candidateProfile: { scoreType: profile.scoreType, rank: Number(profile.rank), score: Number(profile.score) || null }, answers, candidatePrograms: candidates.map((program) => compactProgram(program, profile)) });
    const groqBody = {
      model,
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      temperature: 0.25,
      max_completion_tokens: 2200,
      response_format: { type: "json_object" },
      ...(model.startsWith("qwen/") ? { reasoning_effort: "none" } : {}),
    };
    const response = await fetch(GROQ_URL, { method: "POST", headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify(groqBody), signal: AbortSignal.timeout(90_000) });
    const raw = await response.json();
    if (!response.ok) return Response.json({ message: raw.error?.message || `Groq HTTP ${response.status}`, code: "GROQ_ERROR" }, { status: response.status });
    const result = parseJson(raw.choices?.[0]?.message?.content || "");
    const byCode = new Map(candidates.map((program) => [String(pick(program, "kilavuzKodu", "kilavuz_kodu")), program]));
    const seen = new Set();
    const recommendations = (Array.isArray(result.recommendations) ? result.recommendations : []).filter((item) => byCode.has(String(item.code)) && !seen.has(String(item.code)) && seen.add(String(item.code))).slice(0, requestedCount).map((item, index) => { const program = byCode.get(String(item.code)); return { order: index + 1, reason: String(item.reason || "Aday profiline uygun seçenek."), category: riskOf(program, profile).label, program }; });
    if (!recommendations.length) throw new Error("Model aday listesinden geçerli bir program seçemedi.");
    return Response.json({ summary: String(result.summary || "Yanıtlarına göre kişiselleştirilmiş tercih önerisi hazırlandı."), strategy: String(result.strategy || "Tercihler risk ve uygunluk dengesine göre sıralandı."), warnings: Array.isArray(result.warnings) ? result.warnings.map(String).slice(0, 6) : [], recommendations, model, candidateCount: candidates.length });
  } catch (error) {
    const isTimeout = error?.name === "TimeoutError";
    return Response.json({ message: isTimeout ? "Groq yanıtı zaman aşımına uğradı. Tekrar deneyebilirsin." : error.message }, { status: isTimeout ? 504 : 500 });
  }
}
