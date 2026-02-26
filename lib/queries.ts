import { sql } from "./db";

// ─── Tier helpers ─────────────────────────────────────────────────────────────

const DIFFICULTY_MAP: Record<string, number> = {
  UNRATED: 0,
  BRONZE_5: 1, BRONZE_4: 2, BRONZE_3: 3, BRONZE_2: 4, BRONZE_1: 5,
  SILVER_5: 6, SILVER_4: 7, SILVER_3: 8, SILVER_2: 9, SILVER_1: 10,
  GOLD_5: 11, GOLD_4: 12, GOLD_3: 13, GOLD_2: 14, GOLD_1: 15,
  PLATINUM_5: 16, PLATINUM_4: 17, PLATINUM_3: 18, PLATINUM_2: 19, PLATINUM_1: 20,
  DIAMOND_5: 21, DIAMOND_4: 22, DIAMOND_3: 23, DIAMOND_2: 24, DIAMOND_1: 25,
};

export function difficultyToTier(difficulty: string): number {
  const normalized = difficulty.trim().toUpperCase().replace(/[\s-]+/g, "_");
  return DIFFICULTY_MAP[normalized] ?? 0;
}

export function tierLabel(tier: number): string {
  const labels = [
    "Unrated",
    "Bronze V", "Bronze IV", "Bronze III", "Bronze II", "Bronze I",
    "Silver V", "Silver IV", "Silver III", "Silver II", "Silver I",
    "Gold V", "Gold IV", "Gold III", "Gold II", "Gold I",
    "Platinum V", "Platinum IV", "Platinum III", "Platinum II", "Platinum I",
    "Diamond V", "Diamond IV", "Diamond III", "Diamond II", "Diamond I",
  ];
  return labels[tier] ?? "Unrated";
}

export function tierClass(tier: number): string {
  if (tier === 0) return "tier-r";
  if (tier <= 5) return "tier-b";
  if (tier <= 10) return "tier-s";
  if (tier <= 15) return "tier-g";
  if (tier <= 20) return "tier-p";
  return "tier-d";
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DbProblem {
  id: number;
  dbId: string;
  title: string;
  tier: number;
  difficulty: string;
  tags: string[];
  solvedCount: number;
}

export interface DbProblemDetail extends DbProblem {
  description: string;
  inputDesc: string;
  outputDesc: string;
  timeLimit: number;
  memoryLimit: number;
}

export interface DbRanking {
  id: string;
  rank: number;
  name: string;
  division: string;
  rating: number;
  solvedCount: number;
  wins: number;
  losses: number;
  draws: number;
}

export interface DbUserProfile {
  id: string;
  handle: string;
  name: string;
  email: string;
  division: string;
  rating: number;
  solvedCount: number;
  wins: number;
  losses: number;
  draws: number;
  bio: string;
  avatarDataUrl: string;
  bannerType: string;
  customBannerDataUrl: string;
}

export interface HeatmapDay {
  date: string;
  count: number;
}

export interface DbContest {
  id: string;
  title: string;
  division: string;
  startTime: string;
  endTime: string;
  isPublished: boolean;
}

export interface SiteStats {
  problemCount: number;
  userCount: number;
  submissionCount: number;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getProblems(): Promise<DbProblem[]> {
  const rows = await sql`
    SELECT p.id, p.number, p.title, p.difficulty, p.tags,
           COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'ACCEPTED') as solved_count
    FROM "Problem" p
    LEFT JOIN "Submission" s ON s."problemId" = p.id
    GROUP BY p.id, p.number, p.title, p.difficulty, p.tags
    ORDER BY p.number
  `;
  return rows.map((r) => ({
    id: r.number as number,
    dbId: r.id as string,
    title: r.title as string,
    tier: difficultyToTier(r.difficulty as string),
    difficulty: r.difficulty as string,
    tags: (r.tags as string)?.split(",").filter(Boolean) ?? [],
    solvedCount: parseInt(r.solved_count as string) || 0,
  }));
}

export async function getProblemById(number: number): Promise<DbProblemDetail | null> {
  const rows = await sql`
    SELECT p.*, COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'ACCEPTED') as solved_count
    FROM "Problem" p
    LEFT JOIN "Submission" s ON s."problemId" = p.id
    WHERE p.number = ${number}
    GROUP BY p.id
  `;
  if (!rows.length) return null;
  const r = rows[0];
  return {
    id: r.number as number,
    dbId: r.id as string,
    title: r.title as string,
    tier: difficultyToTier(r.difficulty as string),
    difficulty: r.difficulty as string,
    tags: (r.tags as string)?.split(",").filter(Boolean) ?? [],
    solvedCount: parseInt(r.solved_count as string) || 0,
    description: r.description as string,
    inputDesc: r.inputDesc as string,
    outputDesc: r.outputDesc as string,
    timeLimit: r.timeLimit as number,
    memoryLimit: r.memoryLimit as number,
  };
}

export async function getRankings(): Promise<DbRanking[]> {
  const rows = await sql`
    SELECT id, COALESCE(NULLIF(TRIM(name), ''), id) AS name, division, rating, "solvedCount", wins, losses, draws
    FROM "User"
    ORDER BY rating DESC, "solvedCount" DESC
  `;
  return rows.map((r, i) => ({
    id: r.id as string,
    rank: i + 1,
    name: r.name as string,
    division: r.division as string,
    rating: r.rating as number,
    solvedCount: r.solvedCount as number,
    wins: r.wins as number,
    losses: r.losses as number,
    draws: r.draws as number,
  }));
}

export async function getSiteStats(): Promise<SiteStats> {
  const [p, u, s] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM "Problem"`,
    sql`SELECT COUNT(*) as count FROM "User"`,
    sql`SELECT COUNT(*) as count FROM "Submission"`,
  ]);
  return {
    problemCount: parseInt(p[0].count as string),
    userCount: parseInt(u[0].count as string),
    submissionCount: parseInt(s[0].count as string),
  };
}

export async function getSolvedProblemNumbersByUserId(userId: string): Promise<number[]> {
  const rows = await sql`
    SELECT DISTINCT p.number
    FROM "Submission" s
    JOIN "Problem" p ON p.id = s."problemId"
    WHERE s."userId" = ${userId}
      AND s.status = 'ACCEPTED'
    ORDER BY p.number
  `;
  return rows.map((r) => r.number as number);
}

export async function getCurrentStreakByUserId(userId: string): Promise<{ streak: number; solvedToday: boolean }> {
  const rows = await sql`
    SELECT DISTINCT DATE("createdAt") AS solved_date
    FROM "Submission"
    WHERE "userId" = ${userId}
      AND status = 'ACCEPTED'
    ORDER BY solved_date DESC
  `;

  const solvedDays = new Set(
    rows.map((r) => String(r.solved_date).slice(0, 10))
  );

  const now = new Date();
  const cursor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const todayKey = cursor.toISOString().slice(0, 10);
  const solvedToday = solvedDays.has(todayKey);

  // If haven't solved today, still count streak from yesterday so it doesn't reset overnight
  if (!solvedToday) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  let streak = 0;
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (!solvedDays.has(key)) break;
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return { streak, solvedToday };
}

export async function ensureUserProfileColumns(): Promise<void> {
  await sql`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS bio text DEFAULT ''`;
  await sql`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarDataUrl" text DEFAULT ''`;
  await sql`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bannerType" text DEFAULT 'free-grid'`;
  await sql`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "customBannerDataUrl" text DEFAULT ''`;
  await sql`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS handle varchar(100) DEFAULT ''`;
  // Backfill handle for existing users who don't have one yet
  await sql`UPDATE "User" SET handle = name WHERE handle = '' OR handle IS NULL`;
}

function mapUserRow(user: Record<string, unknown>): DbUserProfile {
  return {
    id: user.id as string,
    handle: (user.handle as string) || (user.name as string),
    name: user.name as string,
    email: user.email as string,
    division: user.division as string,
    rating: user.rating as number,
    solvedCount: user.solvedCount as number,
    wins: user.wins as number,
    losses: user.losses as number,
    draws: user.draws as number,
    bio: (user.bio as string) ?? "",
    avatarDataUrl: (user.avatarDataUrl as string) ?? "",
    bannerType: (user.bannerType as string) ?? "free-grid",
    customBannerDataUrl: (user.customBannerDataUrl as string) ?? "",
  };
}

export async function getUserProfileByHandle(handle: string): Promise<DbUserProfile | null> {
  await ensureUserProfileColumns();
  // Search by handle column first, fall back to id (for backward-compat links)
  const rows = await sql`
    SELECT id, handle, name, email, division, rating, "solvedCount", wins, losses, draws, bio,
           "avatarDataUrl", "bannerType", "customBannerDataUrl"
    FROM "User"
    WHERE LOWER(handle) = LOWER(${handle})
       OR LOWER(id) = LOWER(${handle})
    ORDER BY CASE WHEN LOWER(handle) = LOWER(${handle}) THEN 0 ELSE 1 END
    LIMIT 1
  `;
  if (rows.length === 0) return null;
  return mapUserRow(rows[0] as Record<string, unknown>);
}

export async function getUserProfileById(userId: string): Promise<DbUserProfile | null> {
  await ensureUserProfileColumns();
  const rows = await sql`
    SELECT id, handle, name, email, division, rating, "solvedCount", wins, losses, draws, bio,
           "avatarDataUrl", "bannerType", "customBannerDataUrl"
    FROM "User"
    WHERE id = ${userId}
    LIMIT 1
  `;
  if (rows.length === 0) return null;
  return mapUserRow(rows[0] as Record<string, unknown>);
}

export async function updateUserProfileById(
  userId: string,
  payload: {
    nickname: string;
    bio: string;
    avatarDataUrl: string;
    bannerType: string;
    customBannerDataUrl: string;
  }
): Promise<void> {
  await ensureUserProfileColumns();
  // handle is intentionally NOT updated — it is the permanent profile URL identifier
  await sql`
    UPDATE "User"
    SET name = ${payload.nickname},
        bio = ${payload.bio},
        "avatarDataUrl" = ${payload.avatarDataUrl},
        "bannerType" = ${payload.bannerType},
        "customBannerDataUrl" = ${payload.customBannerDataUrl}
    WHERE id = ${userId}
  `;
}

// ─── AC Rating helpers ────────────────────────────────────────────────────────

export async function getTopSolvedDifficultySum(userId: string): Promise<number> {
  const rows = await sql`
    SELECT DISTINCT p.difficulty
    FROM "Submission" s
    JOIN "Problem" p ON p.id = s."problemId"
    WHERE s."userId" = ${userId}
      AND s.status = 'ACCEPTED'
  `;
  const tiers = rows.map((r) => difficultyToTier(r.difficulty as string));
  tiers.sort((a, b) => b - a);
  return tiers.slice(0, 100).reduce((sum, t) => sum + t, 0);
}

// ─── Streak + Heatmap ─────────────────────────────────────────────────────────

export async function getStreakHeatmapByUserId(userId: string): Promise<HeatmapDay[]> {
  const rows = await sql`
    SELECT DATE("createdAt") AS solved_date,
           COUNT(DISTINCT "problemId") AS cnt
    FROM "Submission"
    WHERE "userId" = ${userId}
      AND status = 'ACCEPTED'
      AND "createdAt" >= CURRENT_TIMESTAMP - INTERVAL '370 days'
    GROUP BY DATE("createdAt")
    ORDER BY solved_date ASC
  `;
  return rows.map((r) => ({
    date: String(r.solved_date).slice(0, 10),
    count: parseInt(r.cnt as string) || 0,
  }));
}

export async function getLongestStreakByUserId(userId: string): Promise<number> {
  const rows = await sql`
    SELECT DISTINCT DATE("createdAt") AS solved_date
    FROM "Submission"
    WHERE "userId" = ${userId}
      AND status = 'ACCEPTED'
    ORDER BY solved_date ASC
  `;
  if (rows.length === 0) return 0;
  const dates = rows.map((r) => String(r.solved_date).slice(0, 10));
  let longest = 1, current = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = (new Date(dates[i]).getTime() - new Date(dates[i - 1]).getTime()) / 86400000;
    if (diff === 1) { current++; if (current > longest) longest = current; }
    else current = 1;
  }
  return longest;
}

export async function getContests(): Promise<DbContest[]> {
  const rows = await sql`
    SELECT id, title, division, "startTime", "endTime", "isPublished"
    FROM "Contest"
    WHERE "isPublished" = true
    ORDER BY "startTime" DESC
    LIMIT 5
  `;
  return rows.map((r) => ({
    id: r.id as string,
    title: r.title as string,
    division: r.division as string,
    startTime: (r.startTime as Date).toISOString(),
    endTime: (r.endTime as Date).toISOString(),
    isPublished: r.isPublished as boolean,
  }));
}
