"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import type { HeatmapDay } from "@/lib/queries";

// ─── Helpers (mirrors profile page) ──────────────────────────────────────────

function heatmapColor(count: number): string {
  if (count === 0) return "var(--hm-0)";
  if (count <= 2)  return "var(--hm-1)";
  if (count <= 6)  return "var(--hm-2)";
  if (count <= 11) return "var(--hm-3)";
  return "var(--hm-4)";
}

function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface HeatmapCell {
  date: string;
  count: number;
  inFuture: boolean;
}

interface HeatmapGridResult {
  weeks: HeatmapCell[][];
  monthLabels: { label: string; col: number }[];
  totalCount: number;
  activeDays: number;
}

function buildHeatmapGrid(data: HeatmapDay[], year: number): HeatmapGridResult {
  const countMap = new Map(data.map((d) => [d.date, d.count]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = localDateStr(today);

  const jan1 = new Date(year, 0, 1);
  const start = new Date(jan1);
  start.setDate(jan1.getDate() - jan1.getDay());
  const dec31 = new Date(year, 11, 31);

  const weeks: HeatmapCell[][] = [];
  const monthLabels: { label: string; col: number }[] = [];
  const cursor = new Date(start);
  let weekIdx = 0;
  let lastMonth = -1;
  let totalCount = 0;
  let activeDays = 0;

  const MONTH_NAMES = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

  while (cursor <= dec31) {
    const week: HeatmapCell[] = [];
    const weekStart = new Date(cursor);

    for (let d = 0; d < 7; d++) {
      const dateStr = localDateStr(cursor);
      const inCurrentYear = cursor.getFullYear() === year;
      const inFuture = !inCurrentYear || dateStr > todayStr;
      const count = inFuture ? 0 : (countMap.get(dateStr) ?? 0);

      week.push({ date: dateStr, count, inFuture });

      if (inCurrentYear && !inFuture) {
        totalCount += count;
        if (count > 0) activeDays++;
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    weeks.push(week);

    const monthOfWeek = weekStart.getMonth();
    if (monthOfWeek !== lastMonth && weekStart.getFullYear() === year) {
      monthLabels.push({ label: MONTH_NAMES[monthOfWeek], col: weekIdx });
      lastMonth = monthOfWeek;
    }
    weekIdx++;
  }

  return { weeks, monthLabels, totalCount, activeDays };
}

// ─── Component ────────────────────────────────────────────────────────────────

const DAY_LABELS = ["", "월", "", "수", "", "금", ""];

export default function StreakCard() {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [heatmap, setHeatmap] = useState<HeatmapDay[]>([]);

  useEffect(() => {
    if (!user?.dbUserId && !user?.handle) return;

    const url = user.dbUserId
      ? `/api/users/profile?userId=${encodeURIComponent(user.dbUserId)}`
      : `/api/users/profile?handle=${encodeURIComponent(user.handle!)}`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (!data?.ok) return;
        setStreak(typeof data.currentStreak === "number" ? data.currentStreak : 0);
        setLongestStreak(typeof data.longestStreak === "number" ? data.longestStreak : 0);
        setHeatmap(Array.isArray(data.heatmap) ? data.heatmap : []);
      })
      .catch(() => {});
  }, [user?.dbUserId, user?.handle]);

  const year = new Date().getFullYear();
  const { weeks, monthLabels, totalCount, activeDays } = useMemo(
    () => buildHeatmapGrid(heatmap, year),
    [heatmap, year]
  );

  return (
    <section className="metric-card streak-card home-streak-card" style={{ marginTop: 16 }}>
      <div className="streak-card-header">
        <div className="streak-title-row">
          <span className="material-symbols-rounded icon-sm icon-fill" style={{ color: "var(--brand-light)" }}>local_fire_department</span>
          <span className="streak-label">{year}년 정답 활동</span>
        </div>
        <div className="streak-current">
          정답 제출 <strong>{totalCount}</strong>회, 활동일 <strong>{activeDays}</strong>일
        </div>
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
                  style={{ background: heatmapColor(cell.count) }}
                  title={cell.inFuture ? "" : `${cell.date}: ${cell.count}문제`}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <div className="streak-footer">
        <span>현재 연속 <strong>{streak}일</strong> · 최장 <strong>{longestStreak}일</strong></span>
        <div className="heatmap-legend">
          <span>적음</span>
          {[0, 1, 4, 8, 15].map((v) => (
            <div key={v} className="hm-legend-cell" style={{ background: heatmapColor(v) }} />
          ))}
          <span>많음</span>
        </div>
      </div>
    </section>
  );
}
