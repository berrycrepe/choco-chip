"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { DbProblem } from "@/lib/queries";

interface MarathonSlot {
  label: string;
  problemId: number;
  bonus: number;
  tier: number;
  title: string;
}

function tierBg(tier: number): string {
  if (tier >= 21) return "linear-gradient(145deg, #c4b5fd, #7c3aed)";
  if (tier >= 16) return "linear-gradient(145deg, #38bdf8, #0284c7)";
  if (tier >= 11) return "linear-gradient(145deg, #fbbf24, #b45309)";
  if (tier >= 6) return "linear-gradient(145deg, #94a3b8, #64748b)";
  return "linear-gradient(145deg, #c2926c, #92633d)";
}

function buildSlots(problems: DbProblem[]): MarathonSlot[] {
  const labels = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const bonuses = [20, 20, 30, 30, 50, 50, 50, 50];
  if (problems.length === 0) return [];

  const ranked = [...problems].sort((a, b) => b.solvedCount - a.solvedCount || b.tier - a.tier);
  const daySeed = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const step = Math.max(1, Math.floor(ranked.length / labels.length));

  return labels.map((label, index) => {
    const cursor = (daySeed + index * step) % ranked.length;
    const problem = ranked[cursor];
    return {
      label,
      problemId: problem.id,
      bonus: bonuses[index],
      tier: problem.tier,
      title: problem.title,
    };
  });
}

export default function RandomMarathonCard() {
  const router = useRouter();
  const [problems, setProblems] = useState<DbProblem[]>([]);

  useEffect(() => {
    fetch("/api/problems")
      .then((r) => r.json())
      .then((data: DbProblem[]) => setProblems(data))
      .catch(() => setProblems([]));
  }, []);

  const slots = useMemo(() => {
    const sortedByProblemId = [...buildSlots(problems)].sort((a, b) => a.problemId - b.problemId);
    return sortedByProblemId.map((slot, index) => ({
      ...slot,
      label: String.fromCharCode(65 + index),
    }));
  }, [problems]);

  return (
    <article className="home-marathon-card">
      <div className="home-marathon-head">
        <div>
          <h4>랜덤 마라톤 90</h4>
          <p>실제 DB 문제로 자동 생성됩니다</p>
        </div>
        <button className="btn ghost" onClick={() => router.push("/problems")}>문제 풀러 가기 →</button>
      </div>

      <div className="home-marathon-table-wrap">
        <table className="table home-marathon-table">
          <thead>
            <tr>
              {slots.map((slot) => (
                <th key={slot.label}>{slot.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {slots.map((slot) => (
                <td key={slot.label}>
                  <button className="home-marathon-problem" onClick={() => router.push(`/problems/${slot.problemId}`)}>
                    <span className="tier" style={{ background: tierBg(slot.tier) }}>{slot.tier}</span>
                    <strong>{slot.problemId}</strong>
                    <small>{slot.title}</small>
                    <small>+{slot.bonus}</small>
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="home-marathon-foot">
        <span>문제 수 {slots.length}</span>
        <span>평균 티어 {slots.length ? (slots.reduce((acc, cur) => acc + cur.tier, 0) / slots.length).toFixed(2) : "-"}</span>
      </div>
    </article>
  );
}

