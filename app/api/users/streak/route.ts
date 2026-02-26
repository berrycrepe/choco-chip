import { NextResponse } from "next/server";
import { getCurrentStreakByUserId } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId")?.trim();

    if (!userId) {
      return NextResponse.json({ ok: false, message: "userId가 필요합니다." }, { status: 400 });
    }

    const result = await getCurrentStreakByUserId(userId);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("GET /api/users/streak error:", err);
    return NextResponse.json({ ok: false, message: "스트릭 정보를 불러오지 못했습니다." }, { status: 500 });
  }
}
