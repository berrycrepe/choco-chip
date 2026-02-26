import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { ensureUserProfileColumns, getSolvedProblemNumbersByUserId } from "@/lib/queries";

export async function POST(request: Request) {
  try {
    await ensureUserProfileColumns();

    const { identifier, password } = await request.json();
    const loginId = (identifier as string | undefined)?.trim();
    if (!loginId || !password) {
      return NextResponse.json(
        { ok: false, message: "아이디와 비밀번호를 입력해 주세요." },
        { status: 400 }
      );
    }

    const rows = await sql`
      SELECT id, handle, name, email, password, division, rating, "solvedCount", wins, losses, draws,
             bio, "avatarDataUrl", "bannerType", "customBannerDataUrl"
      FROM "User"
      WHERE LOWER(id) = LOWER(${loginId})
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json({ ok: false, message: "계정을 찾을 수 없습니다." }, { status: 401 });
    }

    const user = rows[0];
    const stored = user.password as string;
    const isMatch = stored.startsWith("$2b$") || stored.startsWith("$2a$")
      ? await bcrypt.compare(password, stored)
      : stored === password;

    if (!isMatch) {
      return NextResponse.json({ ok: false, message: "비밀번호가 올바르지 않습니다." }, { status: 401 });
    }

    const solvedProblemIds = await getSolvedProblemNumbersByUserId(user.id as string);

    return NextResponse.json({
      ok: true,
      message: "로그인되었습니다.",
      user: {
        id: user.id as string,
        handle: ((user.handle as string) || (user.name as string)),
        email: user.email as string,
        nickname: user.name as string,
        division: user.division as string,
        rating: user.rating as number,
        solvedCount: user.solvedCount as number,
        wins: user.wins as number,
        losses: user.losses as number,
        draws: user.draws as number,
        solvedProblemIds,
        bio: (user.bio as string) ?? "",
        avatarDataUrl: (user.avatarDataUrl as string) ?? "",
        bannerType: (user.bannerType as string) ?? "free-grid",
        customBannerDataUrl: (user.customBannerDataUrl as string) ?? "",
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ ok: false, message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
