import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() ?? "";

    if (!q || q.length < 1) {
      return NextResponse.json({ ok: true, users: [] });
    }

    const pattern = `%${q}%`;
    const rows = await sql`
      SELECT id, handle, name, division, rating, "solvedCount", "avatarDataUrl"
      FROM "User"
      WHERE LOWER(name) LIKE LOWER(${pattern})
         OR LOWER(handle) LIKE LOWER(${pattern})
      ORDER BY "solvedCount" DESC NULLS LAST
      LIMIT 8
    `;

    const users = rows.map((r) => ({
      id: r.id as string,
      handle: (r.handle as string) || (r.name as string),
      name: r.name as string,
      division: r.division as string,
      rating: r.rating as number,
      solvedCount: r.solvedCount as number,
      avatarDataUrl: r.avatarDataUrl as string,
    }));

    return NextResponse.json({ ok: true, users });
  } catch (err) {
    console.error("GET /api/users/search error:", err);
    return NextResponse.json({ ok: false, message: "유저 검색에 실패했습니다." }, { status: 500 });
  }
}
