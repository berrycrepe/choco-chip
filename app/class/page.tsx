"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SubNav from "@/components/SubNav";
import { useAuth } from "@/context/AuthContext";
import { buildClassRows, getRecommendedClass } from "@/lib/classProgress";
import type { ClassGroup } from "@/lib/types";
import { getTierLabel } from "@/lib/tier";

const classColors = [
  { cell: "#2f8fc8", board: "#2f8fc8", ring: "#39b4ff", badgeA: "#46b7ff", badgeB: "#2489d0" },
  { cell: "#0f586f", board: "#1285a2", ring: "#4dd7ff", badgeA: "#2dc6eb", badgeB: "#0d7da0" },
  { cell: "#0f6b42", board: "#20965e", ring: "#43f29f", badgeA: "#35d58a", badgeB: "#0f8a50" },
  { cell: "#3d7420", board: "#4f9d2b", ring: "#7cff5c", badgeA: "#62d63a", badgeB: "#3a9021" },
  { cell: "#7b7f1f", board: "#a39f27", ring: "#d8ef51", badgeA: "#d0d643", badgeB: "#8f9720" },
  { cell: "#85711f", board: "#b8872a", ring: "#ffd062", badgeA: "#e9b84d", badgeB: "#a47322" },
  { cell: "#895719", board: "#bf7326", ring: "#ffb05f", badgeA: "#ea9244", badgeB: "#ad5f1b" },
  { cell: "#6b3818", board: "#9b4f24", ring: "#ff9560", badgeA: "#db7643", badgeB: "#883d1b" },
  { cell: "#5a1f40", board: "#7d2d5a", ring: "#ff72c8", badgeA: "#d651ad", badgeB: "#6c2452" },
  { cell: "#553a70", board: "#8a2ad0", ring: "#d08eff", badgeA: "#bb57ff", badgeB: "#842ad6" },
] as const;

export default function ClassPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
  const [freshSolvedIds, setFreshSolvedIds] = useState<number[] | null>(null);
  const [solvedLoading, setSolvedLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/class-problems")
      .then((r) => r.json())
      .then((data: ClassGroup[]) => {
        setClassGroups(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user) {
      setFreshSolvedIds(null);
      setSolvedLoading(false);
      return;
    }

    const profileUrl = user.dbUserId
      ? `/api/users/profile?userId=${encodeURIComponent(user.dbUserId)}`
      : `/api/users/profile?handle=${encodeURIComponent(user.nickname)}`;

    setSolvedLoading(true);
    fetch(profileUrl)
      .then((r) => r.json())
      .then((data) => {
        if (!data?.ok) return;
        setFreshSolvedIds(Array.isArray(data.solvedProblemIds) ? data.solvedProblemIds : []);
      })
      .catch(() => setFreshSolvedIds(null))
      .finally(() => setSolvedLoading(false));
  }, [user?.dbUserId, user?.nickname, user]);

  const solvedIds = useMemo(() => {
    if (user?.dbUserId) return freshSolvedIds ?? [];
    return freshSolvedIds ?? user?.solvedProblemIds ?? [];
  }, [freshSolvedIds, user?.dbUserId, user?.solvedProblemIds]);

  const solvedSet = useMemo(() => new Set(solvedIds), [solvedIds]);
  const rows = useMemo(() => buildClassRows(classGroups, solvedSet), [classGroups, solvedSet]);
  const recommendedLevel = useMemo(() => getRecommendedClass(rows), [rows]);

  const currentGroup = classGroups.find((g) => g.level === selectedLevel) ?? classGroups[0];
  const currentRow = rows.find((r) => r.level === selectedLevel) ?? rows[0];
  const theme = classColors[selectedLevel - 1] ?? classColors[0];

  if (loading) {
    return (
      <>
        <SiteHeader />
        <SubNav />
        <main className="page">
          <section className="section">
            <h2>CLASS</h2>
            <div className="status">문제 목록을 불러오는 중...</div>
          </section>
        </main>
      </>
    );
  }

  if (user?.dbUserId && solvedLoading) {
    return (
      <>
        <SiteHeader />
        <SubNav />
        <main className="page">
          <section className="section">
            <h2>CLASS</h2>
            <div className="status">DB 제출 기록을 동기화하는 중...</div>
          </section>
        </main>
      </>
    );
  }

  if (!currentGroup || !currentRow) {
    return (
      <>
        <SiteHeader />
        <SubNav />
        <main className="page">
          <section className="section">
            <h2>CLASS</h2>
            <div className="status">CLASS 데이터를 불러오지 못했습니다.</div>
          </section>
        </main>
      </>
    );
  }

  const essentialRequired = currentGroup.problems.filter((p) => p.essential).length;
  const fullRequired = currentGroup.problems.length;

  const classBaseSolved = Math.min(currentRow.solvedTotal, currentGroup.baseRequired);
  const classBaseUnsolved = Math.max(currentGroup.baseRequired - classBaseSolved, 0);
  const classPlusSolved = Math.min(currentRow.solvedEssential, essentialRequired);
  const classPlusUnsolved = Math.max(essentialRequired - classPlusSolved, 0);
  const classPPSolved = currentRow.solvedTotal;
  const classPPUnsolved = Math.max(fullRequired - classPPSolved, 0);

  function parseDecoration(grade: string | undefined): "none" | "silver" | "gold" {
    if (!grade) return "none";
    if (grade.includes("++")) return "gold";
    if (grade.includes("+")) return "silver";
    return "none";
  }

  const currentDecoration = parseDecoration(currentRow.grade);
  const currentGradeLabel = currentRow.grade || `${selectedLevel}`;

  return (
    <>
      <SiteHeader />
      <SubNav />
      <main className="page">
        <section className="section">
          <h2>CLASS</h2>
          <p>
            CLASS {selectedLevel} 취득: {currentGroup.baseRequired}문제 이상 (75%) · CLASS {selectedLevel}+:
            에센셜 {essentialRequired}문제 전부 · CLASS {selectedLevel}++: 전체 {fullRequired}문제
          </p>
          <div className="status">권장 진입 CLASS {recommendedLevel} · 현재 등급: CLASS {currentGradeLabel}</div>

          <div className="class-calm-strip">
            {rows.map((row) => {
              const c = classColors[row.level - 1] ?? classColors[0];
              return (
                <button
                  key={row.level}
                  className={`class-calm-cell ${row.level === selectedLevel ? "active" : ""}`}
                  onClick={() => setSelectedLevel(row.level)}
                  style={{ background: c.cell }}
                >
                  <div
                    className="class-calm-ring"
                    style={{
                      background: `conic-gradient(${c.ring} ${row.percent * 3.6}deg, rgba(28, 43, 57, 0.85) 0deg)`,
                    }}
                  >
                    <div className="class-calm-ring-inner">
                      {row.percent}%
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="class-calm-board" style={{ background: theme.board }}>
            <div className="class-calm-badge-wrap">
              <div className="class-calm-badge-container">
                <div className="class-calm-badge" style={{ background: `linear-gradient(145deg, ${theme.badgeA}, ${theme.badgeB})` }}>
                  <span>{selectedLevel}</span>
                </div>
                {currentDecoration !== "none" && (
                  <div className={`class-calm-badge-deco deco-${currentDecoration}`} />
                )}
              </div>
              <div className="class-calm-caption">
                총 {fullRequired}문제 · 에센셜 {essentialRequired}문제 · 취득 기준 {currentGroup.baseRequired}문제
              </div>
            </div>

            <div className="class-calm-table-wrap">
              <table className="table class-calm-table">
                <thead>
                  <tr>
                    <th>단계</th>
                    <th>미해결</th>
                    <th>해결</th>
                    <th>취득 조건</th>
                    <th>진행률</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>CLASS {selectedLevel}</td>
                    <td>{classBaseUnsolved}</td>
                    <td>{classBaseSolved}</td>
                    <td>{currentGroup.baseRequired}문제 이상 (75%)</td>
                    <td><div className="class-calm-progress"><span style={{ width: `${(classBaseSolved / Math.max(currentGroup.baseRequired, 1)) * 100}%` }} /></div></td>
                  </tr>
                  <tr>
                    <td>CLASS {selectedLevel}+</td>
                    <td>{classPlusUnsolved}</td>
                    <td>{classPlusSolved}</td>
                    <td>에센셜 {essentialRequired}문제 전부</td>
                    <td><div className="class-calm-progress"><span style={{ width: `${(classPlusSolved / Math.max(essentialRequired, 1)) * 100}%` }} /></div></td>
                  </tr>
                  <tr>
                    <td>CLASS {selectedLevel}++</td>
                    <td>{classPPUnsolved}</td>
                    <td>{classPPSolved}</td>
                    <td>전체 {fullRequired}문제</td>
                    <td><div className="class-calm-progress"><span style={{ width: `${(classPPSolved / Math.max(fullRequired, 1)) * 100}%` }} /></div></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="metric-card" style={{ marginTop: 18 }}>
            <h3 style={{ marginTop: 0 }}>CLASS {selectedLevel} 문제 목록</h3>
            {!user ? <p style={{ color: "#9fb5cb" }}>로그인하면 실제 제출 기록 기준으로 해결 여부가 표시됩니다.</p> : null}
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 80 }}>ID</th>
                  <th>제목</th>
                  <th style={{ width: 100 }}>티어</th>
                  <th style={{ width: 80 }}>에센셜</th>
                  <th style={{ width: 100 }}>상태</th>
                </tr>
              </thead>
              <tbody>
                {currentGroup.problems.map((problem) => {
                  const solved = solvedSet.has(problem.id);
                  return (
                    <tr key={problem.id} className="clickable" onClick={() => router.push(`/problems/${problem.id}`)}>
                      <td style={{ color: "var(--text-muted)" }}>{problem.id}</td>
                      <td style={{ fontWeight: 600 }}>{problem.title}</td>
                      <td>{getTierLabel(problem.tier)}</td>
                      <td>{problem.essential ? "●" : "-"}</td>
                      <td style={{ color: solved ? "var(--success)" : "var(--text-dim)", fontWeight: 700 }}>
                        {solved ? "해결됨" : "미해결"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}

