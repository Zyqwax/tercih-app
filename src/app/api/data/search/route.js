import { searchPrograms } from "@/lib/yok-api-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    return Response.json(await searchPrograms(await request.json()), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ message: "YÖK program verileri alınamadı.", error: error.message }, { status: 502 });
  }
}
