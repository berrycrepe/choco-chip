import { NextResponse } from "next/server";
import {
  getSolvedProblemNumbersByUserId,
  getCurrentStreakByUserId,
  getStreakHeatmapByUserId,
  getLongestStreakByUserId,
  getTopSolvedDifficultySum,
  getUserProfileByHandle,
  getUserProfileById,
  updateUserProfileById,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId")?.trim() ?? "";
    const handle = searchParams.get("handle")?.trim() ?? "";

    const profile = userId
      ? await getUserProfileById(userId)
      : handle
        ? await getUserProfileByHandle(handle)
        : null;

    if (!profile) {
      return NextResponse.json({ ok: false, message: "사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    const [solvedProblemIds, heatmap, longestStreak, topDifficultySum, streakData] = await Promise.all([
      getSolvedProblemNumbersByUserId(profile.id),
      getStreakHeatmapByUserId(profile.id),
      getLongestStreakByUserId(profile.id),
      getTopSolvedDifficultySum(profile.id),
      getCurrentStreakByUserId(profile.id),
    ]);

    return NextResponse.json({
      ok: true,
      user: profile,
      solvedProblemIds,
      heatmap,
      currentStreak: streakData.streak,
      longestStreak,
      topDifficultySum,
    });
  } catch (err) {
    console.error("GET /api/users/profile error:", err);
    return NextResponse.json({ ok: false, message: "프로필을 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const userId = (body.userId as string | undefined)?.trim();
    const nickname = (body.nickname as string | undefined)?.trim();

    if (!userId) {
      return NextResponse.json({ ok: false, message: "userId가 필요합니다." }, { status: 400 });
    }
    if (!nickname) {
      return NextResponse.json({ ok: false, message: "nickname이 필요합니다." }, { status: 400 });
    }

    const duplicate = await getUserProfileByHandle(nickname);
    if (duplicate && duplicate.id !== userId) {
      return NextResponse.json({ ok: false, message: "이미 사용 중인 닉네임입니다." }, { status: 409 });
    }

    await updateUserProfileById(userId, {
      nickname,
      bio: (body.bio as string | undefined) ?? "",
      avatarDataUrl: (body.avatarDataUrl as string | undefined) ?? "",
      bannerType: (body.bannerType as string | undefined) ?? "free-grid",
      customBannerDataUrl: (body.customBannerDataUrl as string | undefined) ?? "",
    });

    const profile = await getUserProfileById(userId);
    if (!profile) {
      return NextResponse.json({ ok: false, message: "사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    const solvedProblemIds = await getSolvedProblemNumbersByUserId(profile.id);

    return NextResponse.json({ ok: true, user: profile, solvedProblemIds });
  } catch (err) {
    console.error("PATCH /api/users/profile error:", err);
    return NextResponse.json({ ok: false, message: "프로필 저장에 실패했습니다." }, { status: 500 });
  }
}
