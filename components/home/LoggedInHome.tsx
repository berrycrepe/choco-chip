"use client";

import { useRouter } from "next/navigation";
import ClassCard from "./ClassCard";
import NewsSection from "./NewsSection";
import RandomMarathonCard from "./RandomMarathonCard";
import StreakCard from "./StreakCard";
import UserSummaryCard from "./UserSummaryCard";

interface Props {
  nickname: string;
  division?: string;
  solvedCount?: number;
  avatarDataUrl?: string;
}

export default function LoggedInHome({ nickname, division, solvedCount, avatarDataUrl }: Props) {
  const router = useRouter();

  return (
    <main className="page home-logged-main">
      <section className="home-top-grid">
        <UserSummaryCard nickname={nickname} division={division} solvedCount={solvedCount} avatarDataUrl={avatarDataUrl} />
        <ClassCard />
      </section>
      <StreakCard />

      <section className="home-message-row">
        <h2>오늘도 한 문제씩 꾸준히 해결해 보세요</h2>
        <button className="btn ghost" onClick={() => router.push("/problems")}>문제 풀러 가기 →</button>
      </section>

      <div className="home-note">문제 난이도와 제출 기록은 Choco Chip 데이터 기준으로 표시됩니다.</div>

      <RandomMarathonCard />
      <NewsSection />
    </main>
  );
}

