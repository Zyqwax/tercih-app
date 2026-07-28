import { getLookups } from "@/lib/yok-api-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const forceRefresh = new URL(request.url).searchParams.get("refresh") === "1";
    return Response.json(await getLookups(forceRefresh), { headers: { "Cache-Control": "private, max-age=0, must-revalidate" } });
  } catch (error) {
    return Response.json({ message: "YÖK referans verileri alınamadı.", error: error.message }, { status: 502 });
  }
}
