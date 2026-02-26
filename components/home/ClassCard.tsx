"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { buildClassRows, getRecommendedClass } from "@/lib/classProgress";
import type { ClassGroup } from "@/lib/types";

const CLASS_BONUS = [0, 25, 50, 100, 150, 200, 210, 220, 230, 240, 250];

export default function ClassCard() {
  const { user } = useAuth();
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
  const [solvedIds, setSolvedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/class-problems")
      .then((r) => r.json())
      .then((data: ClassGroup[]) => setClassGroups(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user) { setSolvedIds([]); return; }
    setSolvedIds(user.solvedProblemIds ?? []);
    if (user.dbUserId) {
      fetch(`/api/users/profile?userId=${encodeURIComponent(user.dbUserId)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.ok && Array.isArray(data.solvedProblemIds)) {
            setSolvedIds(data.solvedProblemIds);
          }
        })
        .catch(() => {});
    }
  }, [user?.dbUserId]);

  const { percent, bonus, classLevel } = useMemo(() => {
    if (!classGroups.length) return { percent: 0, bonus: 0, classLevel: 0 };
    const solvedSet = new Set(solvedIds);
    const rows = buildClassRows(classGroups, solvedSet);
    const recommended = getRecommendedClass(rows);
    const row = rows.find((r) => r.level === recommended);
    return {
      percent: row?.percent ?? 0,
      bonus: CLASS_BONUS[recommended] ?? 0,
      classLevel: recommended,
    };
  }, [classGroups, solvedIds]);

  const deg = Math.round((percent / 100) * 360);

  return (
    <article className="home-kpi-card class">
      <div className="home-kpi-head">⬡ CLASS {classLevel > 0 ? classLevel : ""}</div>
      <div
        className="home-class-ring"
        style={{ background: `conic-gradient(rgba(129,140,248,0.85) ${deg}deg, rgba(20,18,60,0.6) ${deg}deg)` }}
      >
        <span>{loading ? "—" : `${percent}%`}</span>
      </div>
      <div className="home-kpi-sub">달성 시 RATING +{bonus}</div>
    </article>
  );
}
