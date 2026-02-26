"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SubNav from "@/components/SubNav";
import type { DbRanking } from "@/lib/queries";

type Tab = "전체" | "레이팅" | "아레나" | "클래스" | "대회";

const TABS: Tab[] = ["전체", "레이팅", "아레나", "클래스", "대회"];

interface RankingRow extends DbRanking {
  classLevel: number;
  classGrade: string;
  classPercent: number;
  divisionRank: number;
}

export default function RankingPage() {
  const [rankings, setRankings] = useState<RankingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("전체");

  useEffect(() => {
    fetch("/api/rankings")
      .then((r) => r.json())
      .then((data: RankingRow[]) => {
        setRankings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const sorted = useMemo(() => {
    if (tab === "전체" || tab === "레이팅") {
      return [...rankings].sort((a, b) => b.rating - a.rating || b.solvedCount - a.solvedCount);
    }
    if (tab === "아레나") {
      return [...rankings].sort((a, b) => (b.wins - b.losses) - (a.wins - a.losses) || b.wins - a.wins);
    }
    if (tab === "클래스") {
      return [...rankings].sort((a, b) =>
        b.classLevel - a.classLevel ||
        b.classPercent - a.classPercent ||
        b.rating - a.rating ||
        b.solvedCount - a.solvedCount
      );
    }
    if (tab === "대회") {
      return [...rankings].sort((a, b) =>
        a.divisionRank - b.divisionRank ||
        b.rating - a.rating ||
        b.solvedCount - a.solvedCount
      );
    }
    return rankings;
  }, [rankings, tab]);

  const showRating = tab === "전체" || tab === "레이팅";
  const showArena = tab === "아레나";
  const showClass = tab === "클래스";

  return (
    <>
      <SiteHeader />
      <SubNav />
      <main className="page">
        <section className="section">
          <div className="section-eyebrow">Leaderboard</div>
          <h2>랭킹</h2>

          <div className="rank-tabs">
            {TABS.map((t) => (
              <button key={t} className={`chip ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                {t}
              </button>
            ))}
          </div>

          <table className="table rank-table" style={{ marginTop: 16 }}>
              <thead>
                <tr>
                  <th style={{ width: 70 }}>순위</th>
                  <th>플레이어</th>
                  <th style={{ width: 110 }}>디비전</th>
                  {showRating && <th style={{ width: 110 }}>레이팅</th>}
                  {showClass && <th style={{ width: 140 }}>클래스</th>}
                  {showClass && <th style={{ width: 110 }}>진행률</th>}
                  {tab === "대회" && <th style={{ width: 130 }}>디비전 순위</th>}
                  {showArena && <th style={{ width: 170 }}>전적 (승/패/무)</th>}
                  {!showArena && !showClass && <th style={{ width: 110 }}>푼 문제</th>}
                  {(tab === "전체" || tab === "레이팅") && <th style={{ width: 170 }}>전적 (승/패/무)</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} style={{ color: "var(--text-dim)", textAlign: "center", padding: "32px 0" }}>
                      불러오는 중...
                    </td>
                  </tr>
                ) : sorted.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ color: "var(--text-dim)", textAlign: "center", padding: "32px 0" }}>
                      랭킹 데이터가 없습니다.
                    </td>
                  </tr>
                ) : (
                  sorted.map((r, i) => (
                    <tr key={r.id}>
                      <td style={{ color: i < 3 ? "var(--brand-light)" : undefined, fontWeight: i < 3 ? 700 : undefined }}>
                        {i + 1}
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        <Link href={`/profile/${encodeURIComponent(r.id)}`} className="rank-user-link">
                          {r.name}
                        </Link>
                      </td>
                      <td style={{ color: "var(--text-muted)" }}>{r.division}</td>
                      {showRating && <td style={{ color: "var(--brand-light)", fontWeight: 700 }}>{r.rating.toLocaleString()}</td>}
                      {showClass && <td style={{ color: "var(--brand-light)", fontWeight: 700 }}>{r.classGrade}</td>}
                      {showClass && <td style={{ color: "var(--text-muted)" }}>{r.classPercent}%</td>}
                      {tab === "대회" && <td style={{ color: "var(--brand-light)", fontWeight: 700 }}>{r.divisionRank}위</td>}
                      {showArena && <td style={{ color: "var(--text-muted)" }}>{r.wins} / {r.losses} / {r.draws}</td>}
                      {!showArena && !showClass && <td>{r.solvedCount.toLocaleString()}</td>}
                      {(tab === "전체" || tab === "레이팅") && <td style={{ color: "var(--text-muted)" }}>{r.wins} / {r.losses} / {r.draws}</td>}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
        </section>
      </main>
    </>
  );
}

