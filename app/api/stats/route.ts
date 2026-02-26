import { NextResponse } from "next/server";
import { getSiteStats } from "@/lib/queries";

export async function GET() {
  try {
    const stats = await getSiteStats();
    return NextResponse.json(stats);
  } catch (err) {
    console.error("GET /api/stats error:", err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
