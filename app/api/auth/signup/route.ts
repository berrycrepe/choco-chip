import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { ensureUserProfileColumns } from "@/lib/queries";

export async function POST(request: Request) {
  try {
    await ensureUserProfileColumns();

    const body = await request.json();
    const id = (body.id as string | undefined)?.trim();
    const email = (body.email as string | undefined)?.trim();
    const nickname = (body.nickname as string | undefined)?.trim();
    const password = body.password as string | undefined;

    if (!id || !email || !nickname || !password) {
      return NextResponse.json(
        { ok: false, message: "아이디, 이메일, 닉네임, 비밀번호를 모두 입력해 주세요." },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_-]{3,24}$/.test(id)) {
      return NextResponse.json(
        { ok: false, message: "아이디는 3~24자의 영문/숫자/_/- 만 사용할 수 있습니다." },
        { status: 400 }
      );
    }

    const duplicate = await sql`
      SELECT id, email, name
      FROM "User"
      WHERE LOWER(id) = LOWER(${id})
         OR LOWER(email) = LOWER(${email})
         OR LOWER(name) = LOWER(${nickname})
      LIMIT 1
    `;

    if (duplicate.length > 0) {
      const row = duplicate[0];
      if (String(row.id).toLowerCase() === id.toLowerCase()) {
        return NextResponse.json({ ok: false, message: "이미 사용 중인 아이디입니다." }, { status: 409 });
      }
      if (String(row.email).toLowerCase() === email.toLowerCase()) {
        return NextResponse.json({ ok: false, message: "이미 사용 중인 이메일입니다." }, { status: 409 });
      }
      return NextResponse.json({ ok: false, message: "이미 사용 중인 닉네임입니다." }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);

    await sql`
      INSERT INTO "User" (
        id, email, name, password, role, division, rating, "solvedCount", wins, losses, draws,
        bio, "avatarDataUrl", "bannerType", "customBannerDataUrl", handle
      )
      VALUES (
        ${id}, ${email}, ${nickname}, ${hashed}, 'STUDENT', 'Bronze', 1200, 0, 0, 0, 0,
        '', '', 'free-grid', '', ${nickname}
      )
    `;

    return NextResponse.json({
      ok: true,
      message: "회원가입이 완료되었습니다.",
      user: {
        id,
        email,
        nickname,
        handle: nickname,
        division: "Bronze",
        rating: 1200,
        solvedCount: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        solvedProblemIds: [],
        bio: "",
        avatarDataUrl: "",
        bannerType: "free-grid",
        customBannerDataUrl: "",
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ ok: false, message: "회원가입 중 서버 오류가 발생했습니다." }, { status: 500 });
  }
}
