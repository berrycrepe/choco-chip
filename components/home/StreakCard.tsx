"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import type { HeatmapDay } from "@/lib/queries";

interface HeatmapCell {
  date: string;
  count: number;
  inFuture: boolean;
}

function heatmapColor(count: number): string {
  if (count === 0) return "var(--hm-0)";
  if (count <= 2)  return "var(--hm-1)";
  if (count <= 6)  return "var(--hm-2)";
  if (count <= 12) return "var(--hm-3)";
  return "var(--hm-4)";
}

function fmtDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildGrid(data: HeatmapDay[]): HeatmapCell[][] {
  const countMap = new Map(data.map((d) => [d.date, d.count]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(today);
  start.setDate(start.getDate() - 51 * 7);
  start.setDate(start.getDate() - start.getDay());

  const weeks: HeatmapCell[][] = [];
  const cur = new Date(start);
  while (weeks.length < 52) {
    const week: HeatmapCell[] = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = fmtDate(cur);
      const inFuture = cur > today;
      week.push({ date: dateStr, count: countMap.get(dateStr) ?? 0, inFuture });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

export default function StreakCard() {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [solvedToday, setSolvedToday] = useState(false);
  const [heatmap, setHeatmap] = useState<HeatmapDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.dbUserId) {
      setStreak(0);
      setSolvedToday(false);
      setHeatmap([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/users/profile?userId=${encodeURIComponent(user.dbUserId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data?.ok) return;
        const s = typeof data.currentStreak === "number" ? data.currentStreak : 0;
        setStreak(s);
        setLongestStreak(typeof data.longestStreak === "number" ? data.longestStreak : 0);
        setSolvedToday(s > 0 && Boolean(data.heatmap?.find((h: HeatmapDay) => h.date === fmtDate(new Date()) && h.count > 0)));
        setHeatmap(Array.isArray(data.heatmap) ? data.heatmap : []);
      })
      .finally(() => setLoading(false))
      .catch(() => setLoading(false));
  }, [user?.dbUserId]);

  const weeks = useMemo(() => buildGrid(heatmap), [heatmap]);

  return (
    <article className="home-streak-card">
      <div className="home-streak-header">
        <span className="home-streak-title">🔥 스트릭</span>
        <span className="home-streak-count">
          {loading ? "—" : `${streak}일`}
          {!loading && solvedToday && <span className="home-streak-today"> · 오늘 완료</span>}
        </span>
      </div>

      <div className="home-heatmap-wrap">
        {weeks.map((week, wi) => (
          <div key={wi} className="home-heatmap-col">
            {week.map((cell, di) => (
              <div
                key={di}
                className={`home-heatmap-cell${cell.inFuture ? " hm-future" : ""}`}
                style={{ background: cell.inFuture ? "transparent" : heatmapColor(cell.count) }}
                title={`${cell.date}: ${cell.count}문제`}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="home-streak-footer">
        <span>최장 <strong>{longestStreak}일</strong> 연속</span>
        <div className="home-heatmap-legend">
          <span>적음</span>
          {[0, 1, 4, 8, 15].map((v) => (
            <div key={v} className="home-heatmap-legend-cell" style={{ background: heatmapColor(v) }} />
          ))}
          <span>많음</span>
        </div>
      </div>
    </article>
  );
}
