import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SubNav from "@/components/SubNav";
import MathText from "@/components/MathText";
import { getProblemById, tierLabel, tierClass } from "@/lib/queries";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProblemDetailPage({ params }: Props) {
  const { id } = await params;
  const num = Number(id);
  if (Number.isNaN(num)) notFound();

  const problem = await getProblemById(num);
  if (!problem) notFound();

  return (
    <>
      <SiteHeader />
      <SubNav />
      <main className="page">
        <section className="section">
          <div className="section-eyebrow">문제 #{problem.id}</div>
          <h2 style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            {problem.title}
            <span className={`pill ${tierClass(problem.tier)}`} style={{ fontSize: 13, padding: "3px 10px" }}>
              {tierLabel(problem.tier)}
            </span>
          </h2>

          <div style={{ display: "flex", gap: 20, color: "var(--text-muted)", fontSize: 13, marginBottom: 24, flexWrap: "wrap" }}>
            <span>시간 제한 {problem.timeLimit / 1000}초</span>
            <span>메모리 제한 {problem.memoryLimit} MB</span>
            <span>푼 사람 수 {problem.solvedCount.toLocaleString()}</span>
          </div>

          {problem.tags.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
              {problem.tags.map((tag) => (
                <span key={tag} className="pill">{tag}</span>
              ))}
            </div>
          )}

          <div className="metric-card">
            <h3>문제</h3>
            <MathText className="problem-richtext" text={problem.description || "설명이 없습니다."} />
          </div>

          {problem.inputDesc && (
            <div className="metric-card">
              <h3>입력</h3>
              <MathText className="problem-richtext" text={problem.inputDesc} />
            </div>
          )}

          {problem.outputDesc && (
            <div className="metric-card">
              <h3>출력</h3>
              <MathText className="problem-richtext" text={problem.outputDesc} />
            </div>
          )}

          <div className="problem-source-link-wrap">
            source: <a href={`https://faystonoj.vercel.app/problem/${problem.id}`} target="_blank" rel="noreferrer">https://faystonoj.vercel.app/problem/{problem.id}</a>
          </div>
        </section>
      </main>
    </>
  );
}

