"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { useAuth } from "@/context/AuthContext";
import { buildClassRows } from "@/lib/classProgress";
import type { BannerType, ClassGroup } from "@/lib/types";
import type { HeatmapDay } from "@/lib/queries";

// ─── Constants ───────────────────────────────────────────────────────────────

const CLASS_BADGE_COLORS = [
  { a: "#46b7ff", b: "#2489d0" },
  { a: "#2dc6eb", b: "#0d7da0" },
  { a: "#35d58a", b: "#0f8a50" },
  { a: "#62d63a", b: "#3a9021" },
  { a: "#d0d643", b: "#8f9720" },
  { a: "#e9b84d", b: "#a47322" },
  { a: "#ea9244", b: "#ad5f1b" },
  { a: "#db7643", b: "#883d1b" },
  { a: "#d651ad", b: "#6c2452" },
  { a: "#bb57ff", b: "#842ad6" },
];

const CLASS_BONUS = [0, 25, 50, 100, 150, 200, 210, 220, 230, 240, 250];

const AC_TIERS: { label: string; min: number; color: string }[] = [
  { label: "Master",      min: 3000, color: "#a855f7" },
  { label: "Ruby I",      min: 2950, color: "#ef4444" },
  { label: "Ruby II",     min: 2900, color: "#ef4444" },
  { label: "Ruby III",    min: 2850, color: "#ef4444" },
  { label: "Ruby IV",     min: 2800, color: "#ef4444" },
  { label: "Ruby V",      min: 2700, color: "#ef4444" },
  { label: "Diamond I",   min: 2600, color: "#38bdf8" },
  { label: "Diamond II",  min: 2500, color: "#38bdf8" },
  { label: "Diamond III", min: 2400, color: "#38bdf8" },
  { label: "Diamond IV",  min: 2300, color: "#38bdf8" },
  { label: "Diamond V",   min: 2200, color: "#38bdf8" },
  { label: "Platinum I",  min: 2100, color: "#5bc0de" },
  { label: "Platinum II", min: 2000, color: "#5bc0de" },
  { label: "Platinum III",min: 1900, color: "#5bc0de" },
  { label: "Platinum IV", min: 1750, color: "#5bc0de" },
  { label: "Platinum V",  min: 1600, color: "#5bc0de" },
  { label: "Gold I",      min: 1400, color: "#f59e0b" },
  { label: "Gold II",     min: 1250, color: "#f59e0b" },
  { label: "Gold III",    min: 1100, color: "#f59e0b" },
  { label: "Gold IV",     min:  950, color: "#f59e0b" },
  { label: "Gold V",      min:  800, color: "#f59e0b" },
  { label: "Silver I",    min:  650, color: "#a0a0b0" },
  { label: "Silver II",   min:  500, color: "#a0a0b0" },
  { label: "Silver III",  min:  400, color: "#a0a0b0" },
  { label: "Silver IV",   min:  300, color: "#a0a0b0" },
  { label: "Silver V",    min:  200, color: "#a0a0b0" },
  { label: "Bronze I",    min:  150, color: "#c0704a" },
  { label: "Bronze II",   min:  120, color: "#c0704a" },
  { label: "Bronze III",  min:   90, color: "#c0704a" },
  { label: "Bronze IV",   min:   60, color: "#c0704a" },
  { label: "Bronze V",    min:   30, color: "#c0704a" },
  { label: "Unrated",     min:    0, color: "#5a5a78" },
];

const FREE_BANNER_OPTIONS: Array<{ value: BannerType; label: string; className: string }> = [
  { value: "free-grid",     label: "Free Grid",     className: "profile-banner-free" },
  { value: "free-nebula",   label: "Free Nebula",   className: "profile-banner-nebula" },
  { value: "free-midnight", label: "Free Midnight", className: "profile-banner-midnight" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function freeBannerClass(type: BannerType): string {
  if (type === "free-nebula") return "profile-banner-nebula";
  if (type === "free-midnight") return "profile-banner-midnight";
  return "profile-banner-free";
}

function getAcTier(rating: number): { label: string; color: string } {
  return AC_TIERS.find((t) => rating >= t.min) ?? AC_TIERS[AC_TIERS.length - 1];
}

function parseClassGrade(grade: string): { level: number; decoration: "none" | "silver" | "gold" } {
  if (!grade) return { level: 0, decoration: "none" };
  if (grade.endsWith("++")) return { level: parseInt(grade), decoration: "gold" };
  if (grade.endsWith("+"))  return { level: parseInt(grade), decoration: "silver" };
  return { level: parseInt(grade), decoration: "none" };
}

function getHighestClassInfo(
  groups: ClassGroup[],
  solvedIds: number[]
): { level: number; decoration: "none" | "silver" | "gold" } {
  const rows = buildClassRows(groups, new Set(solvedIds));
  let best = { level: 0, decoration: "none" as "none" | "silver" | "gold" };
  for (const row of rows) {
    if (!row.grade) continue;
    const info = parseClassGrade(row.grade);
    if (info.level > best.level || (info.level === best.level && info.decoration !== "none")) {
      best = info;
    }
  }
  return best;
}

function computeAcRating(topDiffSum: number, solvedCount: number, classLevel: number): number {
  const classBonus = CLASS_BONUS[classLevel] ?? 0;
  const solvedBonus = Math.floor(200 * (1 - Math.pow(0.997, solvedCount)));
  return topDiffSum + classBonus + solvedBonus;
}

// ─── Streak Heatmap ──────────────────────────────────────────────────────────

function heatmapColor(count: number): string {
  if (count === 0) return "var(--hm-0)";
  if (count <= 2)  return "var(--hm-1)";
  if (count <= 6)  return "var(--hm-2)";
  if (count <= 11) return "var(--hm-3)";
  return "var(--hm-4)";
}

interface HeatmapCell {
  date: string;
  count: number;
  inFuture: boolean;
}

function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildHeatmapGrid(data: HeatmapDay[]): { weeks: HeatmapCell[][]; monthLabels: { label: string; col: number }[] } {
  const countMap = new Map(data.map((d) => [d.date, d.count]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = localDateStr(today);

  // Start from the Sunday that was ~52 weeks ago
  const start = new Date(today);
  start.setDate(today.getDate() - 363);
  start.setDate(start.getDate() - start.getDay()); // rewind to Sunday

  const weeks: HeatmapCell[][] = [];
  const monthLabels: { label: string; col: number }[] = [];
  const cursor = new Date(start);
  let weekIdx = 0;
  let lastMonth = -1;

  while (cursor <= today) {
    const week: HeatmapCell[] = [];
    const weekStart = new Date(cursor);
    for (let d = 0; d < 7; d++) {
      const dateStr = localDateStr(cursor);
      const inFuture = dateStr > todayStr;
      week.push({ date: dateStr, count: inFuture ? 0 : (countMap.get(dateStr) ?? 0), inFuture });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);

    // Month label at start of week if month changed
    const monthOfWeek = weekStart.getMonth();
    if (monthOfWeek !== lastMonth) {
      const names = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
      monthLabels.push({ label: names[monthOfWeek], col: weekIdx });
      lastMonth = monthOfWeek;
    }
    weekIdx++;
  }

  return { weeks, monthLabels };
}

function StreakHeatmap({ data, currentStreak, longestStreak }: {
  data: HeatmapDay[];
  currentStreak: number;
  longestStreak: number;
}) {
  const { weeks, monthLabels } = useMemo(() => buildHeatmapGrid(data), [data]);
  const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <section className="metric-card streak-card" style={{ marginTop: 16 }}>
      <div className="streak-card-header">
        <div className="streak-title-row">
          <span className="streak-icon">⚡</span>
          <span className="streak-label">스트릭</span>
        </div>
        <div className="streak-current">현재 <strong>{currentStreak}일</strong></div>
      </div>

      <div className="heatmap-wrap">
        <div className="heatmap-day-labels">
          {DAY_LABELS.map((d, i) => (
            <span key={i} className="heatmap-day-lbl">{d}</span>
          ))}
        </div>
        <div className="heatmap-grid-area">
          <div className="heatmap-month-row" style={{ gridTemplateColumns: `repeat(${weeks.length}, 13px)` }}>
            {monthLabels.map((m) => (
              <span key={m.col} className="heatmap-month-lbl" style={{ gridColumn: m.col + 1 }}>{m.label}</span>
            ))}
          </div>
          <div className="heatmap-grid" style={{ gridTemplateColumns: `repeat(${weeks.length}, 13px)` }}>
            {weeks.map((week, wi) =>
              week.map((cell, di) => (
                <div
                  key={`${wi}-${di}`}
                  className={`heatmap-cell${cell.inFuture ? " hm-future" : ""}`}
                  style={{ background: cell.inFuture ? "transparent" : heatmapColor(cell.count) }}
                  title={`${cell.date}: ${cell.count}문제`}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <div className="streak-footer">
        <span>최장 <strong>{longestStreak}일</strong> 연속 문제 해결</span>
        <div className="heatmap-legend">
          <span>적음</span>
          <div className="hm-legend-cell" style={{ background: "var(--hm-0)" }} />
          <div className="hm-legend-cell" style={{ background: "var(--hm-1)" }} />
          <div className="hm-legend-cell" style={{ background: "var(--hm-2)" }} />
          <div className="hm-legend-cell" style={{ background: "var(--hm-3)" }} />
          <div className="hm-legend-cell" style={{ background: "var(--hm-4)" }} />
          <span>많음</span>
        </div>
      </div>
    </section>
  );
}

// ─── CLASS Badge ─────────────────────────────────────────────────────────────

function ClassBadge({
  level,
  decoration,
  size = "md",
}: {
  level: number;
  decoration: "none" | "silver" | "gold";
  size?: "sm" | "md" | "lg";
}) {
  if (level === 0) return <span className="class-badge-unranked">Unranked</span>;
  const colors = CLASS_BADGE_COLORS[(level - 1) % CLASS_BADGE_COLORS.length];
  const sizeClass = `class-badge-${size}`;

  return (
    <span className={`class-badge ${sizeClass} deco-${decoration}`}>
      <span
        className="class-badge-diamond"
        style={{ background: `linear-gradient(135deg, ${colors.a}, ${colors.b})` }}
      >
        <span className="class-badge-num">{level}</span>
      </span>
      {decoration !== "none" && (
        <span className={`class-badge-ring ring-${decoration}`} />
      )}
    </span>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────

interface ProfileData {
  id: string;
  handle: string;
  name: string;
  email: string;
  division: string;
  rating: number;       // arena rating (ELO)
  solvedCount: number;
  wins: number;
  losses: number;
  draws: number;
  solvedProblemIds: number[];
  heatmap: HeatmapDay[];
  longestStreak: number;
  topDifficultySum: number;
  bio: string;
  avatarDataUrl: string;
  bannerType: BannerType;
  customBannerDataUrl: string;
}

export default function ProfileByHandlePage() {
  const params = useParams<{ handle: string }>();
  const router = useRouter();
  const { user, loading, updateProfile } = useAuth();

  const profileHandle = decodeURIComponent(params?.handle ?? "").trim();

  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [avatarDataUrl, setAvatarDataUrl] = useState("");
  const [customBannerDataUrl, setCustomBannerDataUrl] = useState("");
  const [bannerType, setBannerType] = useState<BannerType>("free-grid");
  const [status, setStatus] = useState("");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!profileHandle) { setPageLoading(false); return; }

    Promise.all([
      fetch(`/api/users/profile?handle=${encodeURIComponent(profileHandle)}`).then((r) => r.json()),
      fetch("/api/class-problems").then((r) => r.json()),
    ])
      .then(([profileData, classData]) => {
        if (!profileData?.ok) { setProfile(null); return; }

        const nextProfile: ProfileData = {
          id: profileData.user.id,
          handle: profileData.user.handle || profileData.user.name,
          name: profileData.user.name,
          email: profileData.user.email,
          division: profileData.user.division,
          rating: profileData.user.rating,
          solvedCount: profileData.user.solvedCount,
          wins: profileData.user.wins,
          losses: profileData.user.losses,
          draws: profileData.user.draws,
          solvedProblemIds: profileData.solvedProblemIds ?? [],
          heatmap: profileData.heatmap ?? [],
          longestStreak: profileData.longestStreak ?? 0,
          topDifficultySum: profileData.topDifficultySum ?? 0,
          bio: profileData.user.bio ?? "",
          avatarDataUrl: profileData.user.avatarDataUrl ?? "",
          bannerType: (profileData.user.bannerType as BannerType) ?? "free-grid",
          customBannerDataUrl: profileData.user.customBannerDataUrl ?? "",
        };

        setProfile(nextProfile);
        setNickname(nextProfile.name);
        setBio((nextProfile.bio ?? "").replace(/\\n/g, "\n"));
        setAvatarDataUrl(nextProfile.avatarDataUrl ?? "");
        setBannerType(nextProfile.bannerType ?? "free-grid");
        setCustomBannerDataUrl(nextProfile.customBannerDataUrl ?? "");
        setClassGroups(classData as ClassGroup[]);
        setCurrentStreak(profileData.currentStreak ?? 0);
      })
      .catch(() => setProfile(null))
      .finally(() => setPageLoading(false));
  }, [profileHandle]);

  const isOwner = useMemo(() => {
    if (!user || !profile) return false;
    if (user.dbUserId && profile.id) return user.dbUserId === profile.id;
    return user.nickname.toLowerCase() === profile.name.toLowerCase();
  }, [profile, user]);

  // Redirect UUID/old-handle URLs to the canonical handle URL
  useEffect(() => {
    if (profile?.handle && profileHandle !== profile.handle) {
      router.replace(`/profile/${encodeURIComponent(profile.handle)}`);
    }
  }, [profile?.handle, profileHandle, router]);

  const solvedIds = useMemo(() => profile?.solvedProblemIds ?? [], [profile?.solvedProblemIds]);

  const classInfo = useMemo(
    () => getHighestClassInfo(classGroups, solvedIds),
    [classGroups, solvedIds]
  );

  const acRating = useMemo(
    () => profile ? computeAcRating(profile.topDifficultySum, profile.solvedCount, classInfo.level) : 0,
    [profile, classInfo.level]
  );

  const acTier = useMemo(() => getAcTier(acRating), [acRating]);

  const canUseCustomBanner = isOwner && classInfo.level >= 5;

  const onPickAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarDataUrl(typeof reader.result === "string" ? reader.result : "");
      setStatus("프로필 이미지를 불러왔습니다.");
    };
    reader.readAsDataURL(file);
  };

  const onPickBanner = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCustomBannerDataUrl(typeof reader.result === "string" ? reader.result : "");
      setBannerType("custom-upload");
      setStatus("커스텀 배너를 불러왔습니다.");
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isOwner || !user) { setStatus("본인 프로필만 수정할 수 있습니다."); return; }
    if (!nickname.trim()) { setStatus("닉네임을 입력해 주세요."); return; }
    if (bannerType === "custom-upload" && !canUseCustomBanner) {
      setStatus("CLASS 5 이상부터 커스텀 배너를 사용할 수 있습니다.");
      return;
    }

    const result = await updateProfile({ nickname: nickname.trim(), bio: bio.trim(), avatarDataUrl, bannerType, customBannerDataUrl });
    setStatus(result.message);

    if (result.ok && profile) {
      setProfile({ ...profile, name: nickname.trim(), bio: bio.trim(), avatarDataUrl, bannerType, customBannerDataUrl });
      setEditing(false);
    }
  };

  if (!profileHandle) {
    return (
      <>
        <SiteHeader />
        <main className="page"><section className="section"><p>잘못된 프로필 주소입니다.</p></section></main>
      </>
    );
  }

  if (loading || pageLoading) {
    return (
      <>
        <SiteHeader />
        <main className="page" style={{ padding: "40px 0" }}>불러오는 중...</main>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <SiteHeader />
        <main className="page"><section className="section"><p>사용자를 찾을 수 없습니다.</p></section></main>
      </>
    );
  }

  const activeBannerType  = editing && isOwner ? bannerType : profile.bannerType;
  const activeCustomBanner = editing && isOwner ? customBannerDataUrl : profile.customBannerDataUrl;
  const activeAvatar      = editing && isOwner ? avatarDataUrl : profile.avatarDataUrl;
  const activeBio         = editing && isOwner ? bio : profile.bio;

  const isCustomBannerActive = activeBannerType === "custom-upload" && activeCustomBanner;
  const heroClassName = isCustomBannerActive
    ? "profile-hero"
    : `profile-hero ${freeBannerClass(activeBannerType as BannerType)}`;

  return (
    <>
      <SiteHeader />

      <section
        className={heroClassName}
        style={
          isCustomBannerActive
            ? {
                backgroundImage: `linear-gradient(rgba(8,8,14,0.25), rgba(8,8,14,0.45)), url(${activeCustomBanner})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        <div className="profile-hero-overlay" />
      </section>

      <main className="page profile-main-new">
        {/* ── Head ── */}
        <section className="profile-head-new">
          <div className="profile-avatar-wrap">
            {activeAvatar ? (
              <Image className="profile-avatar-img" src={activeAvatar} alt="avatar" width={124} height={124} unoptimized />
            ) : (
              <div className="profile-avatar-fallback">{profile.name[0]?.toUpperCase() ?? "?"}</div>
            )}
          </div>

          <div className="profile-head-info">
            <div className="profile-name-row">
              <h1>{profile.name}</h1>
              {classInfo.level > 0 && (
                <ClassBadge level={classInfo.level} decoration={classInfo.decoration} size="md" />
              )}
            </div>
            <p className="profile-handle-line">
              @{profile.handle}
              {profile.name !== profile.handle && (
                <span style={{ color: "var(--text-dim)", marginLeft: 8, fontSize: 13 }}>· 닉네임 변경됨</span>
              )}
            </p>
            <p style={{ marginTop: 4, color: "var(--text-muted)", fontSize: 14 }}>
              <span style={{ color: acTier.color, fontWeight: 700 }}>{acTier.label}</span>
              {" · "}아레나 {profile.division}
            </p>
          </div>

          <div className="profile-head-actions">
            {isOwner && (
              <button className="btn" onClick={() => setEditing((v) => !v)}>
                {editing ? "편집 닫기" : "프로필 편집"}
              </button>
            )}
            <button className="btn ghost" onClick={() => router.push("/problems")}>문제로 이동</button>
          </div>
        </section>

        {/* ── Stats row ── */}
        <div className="profile-stats-row">
          {/* AC Rating card */}
          <section className="metric-card profile-stat-card">
            <div className="psc-label">AC 레이팅</div>
            <div className="psc-value" style={{ color: acTier.color }}>{acRating.toLocaleString()}</div>
            <div className="psc-sub">{acTier.label}</div>
            <div className="psc-formula-note">
              문제 {profile.topDifficultySum} + 클래스 {CLASS_BONUS[classInfo.level] ?? 0} + 보너스 {Math.floor(200 * (1 - Math.pow(0.997, profile.solvedCount)))}
            </div>
          </section>

          {/* Arena card */}
          <section className="metric-card profile-stat-card">
            <div className="psc-label">아레나 레이팅</div>
            <div className="psc-value">{Number.isFinite(profile.rating) ? profile.rating.toLocaleString() : "—"}</div>
            <div className="psc-sub">{profile.division}</div>
            <div className="arena-record">
              <span className="arena-w">{profile.wins}승</span>
              <span className="arena-l">{profile.losses}패</span>
              <span className="arena-d">{profile.draws}무</span>
            </div>
          </section>

          {/* Solved + CLASS card */}
          <section className="metric-card profile-stat-card">
            <div className="psc-label">푼 문제</div>
            <div className="psc-value">{(profile.solvedCount || solvedIds.length).toLocaleString()}</div>
            <div className="psc-sub">문제</div>
            {classInfo.level > 0 ? (
              <div className="profile-class-block">
                <ClassBadge level={classInfo.level} decoration={classInfo.decoration} size="lg" />
                <span className="profile-class-deco-label">
                  {classInfo.decoration === "gold" ? "금장" : classInfo.decoration === "silver" ? "은장" : ""}
                </span>
              </div>
            ) : (
              <div className="psc-sub" style={{ marginTop: 8 }}>CLASS Unranked</div>
            )}
          </section>
        </div>

        {/* ── Streak Heatmap ── */}
        <StreakHeatmap
          data={profile.heatmap}
          currentStreak={currentStreak}
          longestStreak={profile.longestStreak}
        />

        {/* ── Edit form or Content ── */}
        {isOwner && editing ? (
          <form onSubmit={onSubmit} className="metric-card profile-edit-card">
            <h3 style={{ marginTop: 0 }}>프로필 편집</h3>

            <div className="profile-edit-top">
              <div>
                <div className="label">닉네임</div>
                <input className="control" value={nickname} onChange={(e) => setNickname(e.target.value)} />
                <div className="label">프로필 ID (고정)
                  <span style={{ color: "var(--text-dim)", marginLeft: 8, fontSize: 12 }}>URL: /profile/{profile.handle}</span>
                </div>
                <input className="control" value={profile.handle} readOnly />

                <div className="label">계정 이미지 업로드</div>
                <input className="control" type="file" accept="image/*" onChange={onPickAvatar} />
                <p style={{ margin: "8px 0 0", color: "#9bb3c8", fontSize: 12 }}>PNG, JPG, WEBP 업로드 가능</p>

                <div className="label" style={{ marginTop: 14 }}>배너 이미지 업로드</div>
                <input className="control" type="file" accept="image/*" onChange={onPickBanner} disabled={!canUseCustomBanner} />
                <p style={{ margin: "8px 0 0", color: canUseCustomBanner ? "#9bb3c8" : "#f59e0b", fontSize: 12 }}>
                  {canUseCustomBanner ? "CLASS 5 이상: 커스텀 배너 사용 가능" : "CLASS 5 이상부터 커스텀 배너를 사용할 수 있습니다."}
                </p>
              </div>
              <div className="profile-avatar-upload-preview">
                {avatarDataUrl ? (
                  <Image className="profile-avatar-img" src={avatarDataUrl} alt="avatar preview" width={92} height={92} unoptimized />
                ) : (
                  <div className="profile-avatar-fallback" style={{ fontSize: 42 }}>{profile.name[0]?.toUpperCase() ?? "?"}</div>
                )}
              </div>
            </div>

            <div className="label">설명</div>
            <textarea className="control" style={{ height: 120, paddingTop: 10 }} value={bio} onChange={(e) => setBio(e.target.value)} />

            <div className="label">배너</div>
            <div className="banner-picker-grid">
              {FREE_BANNER_OPTIONS.map((option) => (
                <label key={option.value} className={`banner-picker ${bannerType === option.value ? "active" : ""}`}>
                  <input type="radio" name="bannerType" value={option.value} checked={bannerType === option.value} onChange={() => setBannerType(option.value)} />
                  <span className={`banner-thumb ${option.className}`} />
                  <strong>{option.label}</strong>
                </label>
              ))}
              <label className={`banner-picker ${bannerType === "custom-upload" ? "active" : ""}`}>
                <input type="radio" name="bannerType" value="custom-upload" checked={bannerType === "custom-upload"} onChange={() => setBannerType("custom-upload")} disabled={!canUseCustomBanner || !customBannerDataUrl} />
                <span
                  className="banner-thumb"
                  style={customBannerDataUrl ? { backgroundImage: `url(${customBannerDataUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
                />
                <strong>{canUseCustomBanner ? "Custom Upload" : "Custom Upload (CLASS 5+)"}</strong>
              </label>
            </div>

            <div className="row" style={{ marginTop: 14 }}>
              <button type="submit" className="btn success">저장</button>
            </div>
          </form>
        ) : (
          <>
            <section className="metric-card" style={{ marginTop: 16 }}>
              <h3 style={{ marginTop: 0 }}>소개</h3>
              <p style={{ whiteSpace: "pre-wrap" }}>{(activeBio || "소개가 없습니다.").replace(/\\n/g, "\n")}</p>
            </section>
            <section className="metric-card" style={{ marginTop: 16 }}>
              <h3 style={{ marginTop: 0 }}>해결한 문제</h3>
              {solvedIds.length === 0 ? (
                <p style={{ color: "var(--text-dim)", margin: 0 }}>해결한 문제가 없습니다.</p>
              ) : (
                <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.9, margin: 0 }}>{solvedIds.join(", ")}</p>
              )}
            </section>
          </>
        )}

        <div className="status">{status}</div>
      </main>
    </>
  );
}
