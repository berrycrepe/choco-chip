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
              <span>AC</span>
              알고리즘 문제해결 플랫폼
            </div>
            <h1>
              우리 모두가 만들어가는<br />
              <span className="gradient-text">문제해결 학습의 여정</span>
            </h1>
            <p className="subtitle">
              티어 체계로 정리된 알고리즘 문제를 풀고<br />
              CLASS를 달성하며 실력을 키워보세요.
            </p>
            <div className="hero-actions">
              <button className="hero-login" onClick={() => router.push("/login")}>로그인하기</button>
              <button className="hero-secondary" onClick={() => router.push("/problems")}>문제 둘러보기</button>
            </div>
            <div className="notice">
              <strong>데모 버전</strong> · 계정을 만들고 풀이 기록을 관리해 보세요.
            </div>
          </div>
        </div>
      </section>

      <main className="page">
        <section className="section">
          <div className="section-eyebrow">시작하기</div>
          <h2>실력에 맞는 문제를 고르고 꾸준히 성장하세요</h2>
          <p>
            Bronze부터 Diamond까지 단계별 문제를 풀며 실력을 높이세요.
            CLASS 시스템으로 학습 목표를 명확하게 설정할 수 있습니다.
          </p>
          <div className="quick-links">
            <button onClick={() => router.push("/problems")}>문제 둘러보기 →</button>
            <button onClick={() => router.push("/class")}>CLASS 시스템 →</button>
            <button onClick={() => router.push("/ranking")}>랭킹 →</button>
          </div>
        </section>

        <section className="section">
          <div className="section-eyebrow">공지</div>
          <h2>공지사항</h2>
          <div className="landing-notice-card">
            <strong>안내</strong>
            <p>현재 등록된 공지가 없습니다.</p>
          </div>
        </section>

        {stats && (
          <section className="section">
            <div className="section-eyebrow">통계</div>
            <h2>커뮤니티 통계</h2>
            <div className="stats">
              <div className="stat">
                <div className="k">등록된 문제 수</div>
                <div className="v">{stats.problemCount.toLocaleString()}</div>
              </div>
              <div className="stat">
                <div className="k">등록된 사용자 수</div>
                <div className="v">{stats.userCount.toLocaleString()}</div>
              </div>
              <div className="stat">
                <div className="k">총 제출 수</div>
                <div className="v">{stats.submissionCount.toLocaleString()}</div>
              </div>
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </>
  );
}

