import type { Problem } from "@/lib/types";
import { classGroups } from "@/data/classData";

export const landingStats = {
  problemCount: 0,
  bronzeUsers: 0,
  platinumContributors: 0,
  contributionCount: 0,
};

export const newsItems: string[] = [];

function hashFromId(id: number): number {
  const x = Math.sin(id * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export const problems: Problem[] = classGroups.flatMap((group) =>
  group.problems.map((problem, index) => {
    const noise = hashFromId(problem.id + index);
    const tier = Math.max(1, Math.min(25, Math.round(group.level * 2 + noise * 4)));
    const solvedCount = Math.round(180000 * (1 - tier / 28) + 800 + noise * 1500);
    const avgTries = Number((1.1 + tier * 0.14 + noise * 0.7).toFixed(2));
    const statusRoll = hashFromId(problem.id * 3);
    const status: Problem["status"] = statusRoll > 0.72 ? "attempted" : statusRoll > 0.46 ? "solved" : "unsolved";

    return {
      id: problem.id,
      title: problem.title,
      tier,
      solvedCount,
      avgTries,
      status,
      tags: [`class-${group.level}`, problem.essential ? "essential" : "standard"],
    };
  })
);

export const rankLabel = "Unranked";
export const classLabel = "Unranked";
export const accuracyLabel = "Unranked";
