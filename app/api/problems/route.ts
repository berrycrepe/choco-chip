import { NextResponse } from "next/server";
import { getProblems } from "@/lib/queries";

export async function GET() {
  try {
    const problems = await getProblems();
    return NextResponse.json(problems);
  } catch (err) {
    console.error("GET /api/problems error:", err);
    return NextResponse.json({ error: "Failed to fetch problems" }, { status: 500 });
  }
}
