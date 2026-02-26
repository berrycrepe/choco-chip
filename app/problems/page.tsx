"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SubNav from "@/components/SubNav";
import { getTierLabel, tierLabels } from "@/lib/tier";
import type { DbProblem } from "@/lib/queries";

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export default function ProblemsPage() {
  const router = useRouter();
  const [problems, setProblems] = useState<DbProblem[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);
  const [tierMin, setTierMin] = useState(0);
  const [tierMax, setTierMax] = useState(25);
  const [tagMode, setTagMode] = useState<"OR" | "AND">("OR");
  const [tagQuery, setTagQuery] = useState("");
  const [minSolved, setMinSolved] = useState(0);
  const [maxSolved, setMaxSolved] = useState(200000);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch("/api/problems")
      .then((r) => r.json())
      .then((data) => { setProblems(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const minTier = Math.min(tierMin, tierMax);
  const maxTier = Math.max(tierMin, tierMax);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const tq = tagQuery.trim().toLowerCase();

    return problems.filter((p) => {
      const matchTier = p.tier >= minTier && p.tier <= maxTier;
      const matchSolved = p.solvedCount >= minSolved && p.solvedCount <= maxSolved;
      const matchSearch =
        !q ||
        String(p.id).includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.tags.some((tag) => tag.toLowerCase().includes(q));
      const tagTokens = tq.split(/\s+/).filter(Boolean);
      const matchTag =
        tagTokens.length === 0
          ? true
          : tagMode === "OR"
            ? tagTokens.some((token) => p.tags.some((tag) => tag.toLowerCase().includes(token)))
            : tagTokens.every((token) => p.tags.some((tag) => tag.toLowerCase().includes(token)));
      return matchTier && matchSolved && matchSearch && matchTag;
    });
  }, [problems, search, tagQuery, tagMode, minTier, maxTier, minSolved, maxSolved]);

  const resetAll = () => {
    setSearch("");
    setTierMin(0);
    setTierMax(25);
    setTagMode("OR");
    setTagQuery("");
    setMinSolved(0);
    setMaxSolved(200000);
    setStatus("필터를 초기화했습니다.");
  };

  const handleOverlayPick = (problemId: number) => {
    router.push(`/problems/${problemId}`);
    setSearchFocus(false);
  };

  return (
    <>
      <SiteHeader />
      <SubNav />
      <main className="split">
        <aside className="panel problem-filter-panel">
          <div className="filter-head">
            <strong>필터</strong>
            <button className="btn ghost" onClick={resetAll}>⟲ 초기화</button>
          </div>

          <div className="filter-block">
            <div className="label">난이도</div>
            <div className="range-wrapper">
              <div className="range-track" />
              <div className="range-fill" style={{ left: `${(minTier / 25) * 100}%`, right: `${100 - (maxTier / 25) * 100}%` }} />
              <input className="range-input" type="range" min={0} max={25} value={tierMin} onChange={(e) => setTierMin(clamp(Number(e.target.value), 0, 25))} />
              <input className="range-input" type="range" min={0} max={25} value={tierMax} onChange={(e) => setTierMax(clamp(Number(e.target.value), 0, 25))} />
            </div>
            <div className="row" style={{ marginTop: 8 }}>
              <div className="chip active" style={{ flex: 1 }}>{getTierLabel(minTier)}</div>
              <div className="chip active" style={{ flex: 1 }}>{getTierLabel(maxTier)}</div>
            </div>
          </div>

          <div className="filter-block">
            <div className="label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>태그</span>
              <span className="row" style={{ gap: 6 }}>
                <button className={`chip ${tagMode === "OR" ? "active" : ""}`} onClick={() => setTagMode("OR")}>OR</button>
                <button className={`chip ${tagMode === "AND" ? "active" : ""}`} onClick={() => setTagMode("AND")}>AND</button>
              </span>
            </div>
            <input className="control" placeholder="태그 검색 (공백으로 다중 입력)" value={tagQuery} onChange={(e) => setTagQuery(e.target.value)} />
          </div>

          <div className="filter-block">
            <div className="label">해결한 사람 수</div>
            <div className="range-wrapper">
              <div className="range-track" />
              <div className="range-fill" style={{ left: `${(minSolved / 200000) * 100}%`, right: `${100 - (maxSolved / 200000) * 100}%` }} />
              <input className="range-input" type="range" min={0} max={200000} step={100} value={minSolved} onChange={(e) => setMinSolved(Number(e.target.value))} />
              <input className="range-input" type="range" min={0} max={200000} step={100} value={maxSolved} onChange={(e) => setMaxSolved(Number(e.target.value))} />
            </div>
            <div className="row" style={{ marginTop: 8 }}>
              <input className="control" type="number" min={0} max={200000} value={minSolved} onChange={(e) => setMinSolved(clamp(Number(e.target.value || 0), 0, maxSolved))} />
              <input className="control" type="number" min={0} max={200000} value={maxSolved} onChange={(e) => setMaxSolved(clamp(Number(e.target.value || 0), minSolved, 200000))} />
            </div>
          </div>

          <div className="status">{status}</div>
        </aside>

        <section className="main">
          <div className="searchbox problem-searchbox">
            <span className="search-icon">⌕</span>
            <input
              className="control"
              style={{ height: 56, background: "transparent", border: 0, fontSize: 20 }}
              placeholder="문제 검색"
              value={search}
              onFocus={() => setSearchFocus(true)}
              onChange={(e) => { setSearch(e.target.value); setSearchFocus(true); }}
            />
            <button className="btn ghost" onClick={() => setSearchFocus(true)}>→</button>
          </div>

          {searchFocus && (
            <div className="problem-overlay">
              <div className="problem-overlay-head">
                <button className="btn ghost" onClick={() => setSearchFocus(false)}>✕</button>
              </div>
              <div className="problem-hints">
                <div>* 난이도</div>
                <div>$# 푼 사람 수</div>
                <div># 태그</div>
              </div>
              <div className="problem-overlay-section">
                <h4>문제 ({filtered.length.toLocaleString()})</h4>
                {filtered.length === 0 ? (
                  <p className="problem-overlay-empty">표시할 문제가 없습니다.</p>
                ) : (
                  filtered.slice(0, 10).map((p) => (
                    <button key={p.id} className="problem-overlay-item" onClick={() => handleOverlayPick(p.id)}>
                      {p.title} <span>#{p.id}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="status">
            {loading ? "로딩 중..." : `결과: ${filtered.length}개 문제 · 티어 ${tierLabels[minTier]} ~ ${tierLabels[maxTier]}`}
          </div>

          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 90 }}>ID</th>
                <th>제목</th>
                <th style={{ width: 140 }}>티어</th>
                <th style={{ width: 150 }}>푼 사람 수</th>
                <th style={{ width: 160 }}>태그</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ color: "var(--text-dim)", textAlign: "center", padding: "32px 0" }}>불러오는 중...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ color: "var(--text-dim)", textAlign: "center", padding: "32px 0" }}>조건에 맞는 문제가 없습니다.</td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="clickable" onClick={() => router.push(`/problems/${p.id}`)}>
                    <td style={{ color: "var(--text-muted)" }}>{p.id}</td>
                    <td style={{ fontWeight: 600 }}>{p.title}</td>
                    <td>{getTierLabel(p.tier)}</td>
                    <td>{p.solvedCount.toLocaleString()}</td>
                    <td style={{ color: "var(--text-dim)", fontSize: 12 }}>{p.tags.slice(0, 3).join(", ")}</td>
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
