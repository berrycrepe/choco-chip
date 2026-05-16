"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HeroBadges from "@/components/HeroBadges";
import SiteFooter from "@/components/SiteFooter";

interface Stats {
  problemCount: number;
  userCount: number;
  submissionCount: number;
}

const FEATURES = [
  {
    icon: "military_tech",
    title: "티어 시스템",
    body: "Bronze부터 Diamond까지 25단계 난이도 체계로 내 실력을 객관적으로 확인하세요.",
  },
  {
    icon: "workspace_premium",
    title: "CLASS 시스템",
    body: "필수 문제를 달성하며 명확한 목표를 설정하고, CLASS 배지로 학습 이력을 증명하세요.",
  },
  {
    icon: "leaderboard",
    title: "실시간 랭킹",
    body: "ELO 기반 아레나 레이팅으로 다른 사용자와 실력을 비교하고 대회에 참가하세요.",
  },
];

const STATS = [
  { icon: "description", label: "등록된 문제 수",   key: "problemCount"    },
  { icon: "group",       label: "등록된 사용자 수",  key: "userCount"       },
  { icon: "send",        label: "총 제출 수",        key: "submissionCount" },
] as const;

export default function GuestLanding() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => {});
  }, []);

  return (
    <>
      <section className="hero">
        <HeroBadges />
        <div className="hero-overlay" />
        <div className="hero-center">
          <div>
            <div className="hero-eyebrow">
              <span className="material-symbols-rounded icon-sm icon-fill">bolt</span>
              알고리즘 문제해결 플랫폼
            </div>
            <h1>
              실력이 증명되는<br />
              <span className="gradient-text">알고리즘 학습의 여정</span>
            </h1>
            <p className="subtitle">
              티어 체계로 정리된 알고리즘 문제를 풀고<br />
              CLASS를 달성하며 실력을 키워보세요.
            </p>
            <div className="hero-actions">
              <button className="hero-login" onClick={() => router.push("/signup")}>
                <span className="material-symbols-rounded">person_add</span>
                무료로 시작하기
              </button>
              <button className="hero-secondary" onClick={() => router.push("/login")}>
                <span className="material-symbols-rounded">login</span>
                로그인하기
              </button>
              <button className="hero-secondary" onClick={() => router.push("/problems")}>
                <span className="material-symbols-rounded">grid_view</span>
                문제 둘러보기
              </button>
            </div>
            <div className="notice">
              <span className="material-symbols-rounded icon-sm icon-fill" style={{ color: "var(--success)", verticalAlign: "middle" }}>check_circle</span>
              {" "}<strong>데모 버전</strong> · 계정을 만들고 풀이 기록을 관리해 보세요.
            </div>
            <div className="hero-scroll">
              <span className="material-symbols-rounded">keyboard_arrow_down</span>
            </div>
          </div>
        </div>
      </section>

      <main className="page">
        <section className="section">
          <div className="section-eyebrow">
            <span className="material-symbols-rounded icon-sm">rocket_launch</span>
            시작하기
          </div>
          <h2>실력에 맞는 문제를 고르고 꾸준히 성장하세요</h2>
          <p>
            Bronze부터 Diamond까지 단계별 문제를 풀며 실력을 높이세요.
            CLASS 시스템으로 학습 목표를 명확하게 설정할 수 있습니다.
          </p>
          <div className="quick-links">
            <button onClick={() => router.push("/problems")}>
              <span className="material-symbols-rounded icon-sm">code</span>
              문제 둘러보기
            </button>
            <button onClick={() => router.push("/class")}>
              <span className="material-symbols-rounded icon-sm">workspace_premium</span>
              CLASS 시스템
            </button>
            <button onClick={() => router.push("/ranking")}>
              <span className="material-symbols-rounded icon-sm">leaderboard</span>
              랭킹
            </button>
          </div>
        </section>

        <section className="section">
          <div className="section-eyebrow">
            <span className="material-symbols-rounded icon-sm">auto_awesome</span>
            핵심 기능
          </div>
          <h2>왜 Choco Chip인가요?</h2>
          <p>단순 풀이 기록을 넘어 성장을 설계할 수 있는 기능을 제공합니다.</p>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div className="feature-card" key={f.title}>
                <div className="feature-card-icon">
                  <span className="material-symbols-rounded">{f.icon}</span>
                </div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-eyebrow">
            <span className="material-symbols-rounded icon-sm">bar_chart</span>
            통계
          </div>
          <h2>커뮤니티 통계</h2>
          <div className="stats">
            {STATS.map((s) => (
              <div className="stat" key={s.key}>
                <div className="stat-icon">
                  <span className="material-symbols-rounded">{s.icon}</span>
                </div>
                <div className="k">{s.label}</div>
                <div className="v">
                  {stats
                    ? stats[s.key].toLocaleString()
                    : <span className="sk" style={{ width: 72, height: 32, borderRadius: 6 }} />}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
