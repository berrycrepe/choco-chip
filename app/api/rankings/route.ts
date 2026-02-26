import { NextResponse } from "next/server";
import { buildClassRows } from "@/lib/classProgress";
import { getProblems, getRankings } from "@/lib/queries";
import { sql } from "@/lib/db";
import type { ClassGroup } from "@/lib/types";
import type { DbProblem, DbRanking } from "@/lib/queries";

export const revalidate = 60;

const TIER_RANGES: Array<{ level: number; min: number; max: number }> = [
  { level: 1, min: 1, max: 3 },
  { level: 2, min: 4, max: 5 },
  { level: 3, min: 6, max: 8 },
  { level: 4, min: 9, max: 10 },
  { level: 5, min: 11, max: 12 },
  { level: 6, min: 13, max: 14 },
  { level: 7, min: 15, max: 16 },
  { level: 8, min: 17, max: 18 },
  { level: 9, min: 19, max: 20 },
  { level: 10, min: 21, max: 25 },
];

const MAX_PER_CLASS = 8;
const MIN_PER_CLASS = 4;

function pickFallbackProblems(pool: DbProblem[], usedIds: Set<number>, level: number, need: number): DbProblem[] {
  const sorted = [...pool].sort((a, b) => {
    const tierDistance = Math.abs(a.tier - (level * 2 + 1)) - Math.abs(b.tier - (level * 2 + 1));
    if (tierDistance !== 0) return tierDistance;
    return b.solvedCount - a.solvedCount;
  });

  const picked: DbProblem[] = [];
  for (const p of sorted) {
    if (usedIds.has(p.id)) continue;
    picked.push(p);
    usedIds.add(p.id);
    if (picked.length >= need) break;
  }
  return picked;
}

function buildClassGroups(problems: DbProblem[]): ClassGroup[] {
  const usedIds = new Set<number>();

  return TIER_RANGES.map(({ level, min, max }) => {
    const inRange = problems
      .filter((p) => p.tier >= min && p.tier <= max)
      .sort((a, b) => b.solvedCount - a.solvedCount)
      .slice(0, MAX_PER_CLASS);

    const selected = [...inRange];
    selected.forEach((p) => usedIds.add(p.id));

    if (selected.length < MIN_PER_CLASS) {
      const fallback = pickFallbackProblems(problems, usedIds, level, MIN_PER_CLASS - selected.length);
      selected.push(...fallback);
    }

    const unique = selected
      .filter((p, idx, arr) => arr.findIndex((x) => x.id === p.id) === idx)
      .slice(0, MAX_PER_CLASS);

    const essentialCount = Math.ceil(unique.length / 3);
    const baseRequired = Math.max(1, Math.ceil(unique.length * 0.75));

    return {
      level,
      title: `CLASS ${level}`,
      problems: unique.map((p, i) => ({
        id: p.id,
        title: p.title,
        tier: p.tier,
        classLevel: level,
        essential: i < essentialCount,
      })),
      baseRequired,
    };
  });
}

interface RankingWithClass extends DbRanking {
  classLevel: number;
  classGrade: string;
  classPercent: number;
  divisionRank: number;
}

export async function GET() {
  const [rankings, problems, solvedRows] = await Promise.all([
    getRankings(),
    getProblems(),
    sql`
      SELECT DISTINCT s."userId", p.number
      FROM "Submission" s
      JOIN "Problem" p ON p.id = s."problemId"
      WHERE s.status = 'ACCEPTED'
    `,
  ]);

  const classGroups = buildClassGroups(problems);

  const solvedByUser = new Map<string, Set<number>>();
  for (const row of solvedRows) {
    const userId = row.userId as string;
    const number = row.number as number;
    if (!solvedByUser.has(userId)) solvedByUser.set(userId, new Set<number>());
    solvedByUser.get(userId)?.add(number);
  }

  const withClass: RankingWithClass[] = rankings.map((r) => {
    const solvedSet = solvedByUser.get(r.id) ?? new Set<number>();
    const rows = buildClassRows(classGroups, solvedSet);

    let classLevel = 0;
    let classGrade = "Unranked";
    let classPercent = 0;
    for (const row of rows) {
      if (row.grade) {
        classLevel = row.level;
        classGrade = `CLASS ${row.grade}`;
        classPercent = row.percent;
      }
    }

    return {
      ...r,
      classLevel,
      classGrade,
      classPercent,
      divisionRank: 0,
    };
  });

  const divisionBuckets = new Map<string, RankingWithClass[]>();
  for (const row of withClass) {
    const key = row.division || "Unranked";
    if (!divisionBuckets.has(key)) divisionBuckets.set(key, []);
    divisionBuckets.get(key)?.push(row);
  }

  for (const [, list] of divisionBuckets) {
    list
      .sort((a, b) => b.rating - a.rating || b.solvedCount - a.solvedCount || a.name.localeCompare(b.name))
      .forEach((entry, idx) => {
        entry.divisionRank = idx + 1;
      });
  }

  return NextResponse.json(withClass);
}
