"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function StreakCard() {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [solvedToday, setSolvedToday] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.dbUserId) {
      setStreak(0);
      setSolvedToday(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/users/streak?userId=${encodeURIComponent(user.dbUserId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data?.ok) return;
        setStreak(typeof data.streak === "number" ? data.streak : 0);
        setSolvedToday(Boolean(data.solvedToday));
      })
      .finally(() => setLoading(false))
      .catch(() => setLoading(false));
  }, [user?.dbUserId]);

  return (
    <article className="home-kpi-card streak">
      <div className="home-kpi-head">스트릭</div>
      <div className="home-kpi-main">{loading ? "-" : `${streak}일`}</div>
      <div className="home-kpi-sub">
        {loading ? "스트릭 계산 중..." : solvedToday ? "오늘도 해결 완료" : "오늘 문제를 풀면 스트릭이 올라갑니다"}
      </div>
    </article>
  );
}
