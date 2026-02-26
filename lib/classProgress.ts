import type { ClassGroup } from "@/lib/types";

export interface ClassProgressRow {
  level: number;
  percent: number;
  solvedTotal: number;
  total: number;
  solvedEssential: number;
  essentialTotal: number;
  grade: string;
  fullyCleared: boolean;
}

export function buildClassRows(groups: ClassGroup[], solvedIds: Set<number>): ClassProgressRow[] {
  return groups.map((group) => {
    const solvedTotal = group.problems.filter((problem) => solvedIds.has(problem.id)).length;
    const essential = group.problems.filter((problem) => problem.essential);
    const solvedEssential = essential.filter((problem) => solvedIds.has(problem.id)).length;

    // Stricter grades: base CLASS N requires baseRequired (75%), + all essential, ++ all problems
    let grade = "";
    if (solvedTotal >= group.baseRequired) grade = `${group.level}`;
    if (solvedEssential >= essential.length && essential.length > 0) grade = `${group.level}+`;
    if (solvedTotal >= group.problems.length && group.problems.length > 0) grade = `${group.level}++`;

    return {
      level: group.level,
      percent: group.problems.length === 0 ? 0 : Math.round((solvedTotal / group.problems.length) * 100),
      solvedTotal,
      total: group.problems.length,
      solvedEssential,
      essentialTotal: essential.length,
      grade,
      fullyCleared: solvedTotal >= group.problems.length,
    };
  });
}

export function getRecommendedClass(rows: ClassProgressRow[]): number {
  let next = 1;
  for (const row of rows) {
    if (row.fullyCleared) next = row.level + 1;
    else break;
  }
  return Math.min(next, rows.length);
}
