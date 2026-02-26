"use client";

import Image from "next/image";

interface Props {
  nickname: string;
  division?: string;
  solvedCount?: number;
  avatarDataUrl?: string;
}

export default function UserSummaryCard({ nickname, division, solvedCount, avatarDataUrl }: Props) {
  const initial = nickname ? nickname[0].toUpperCase() : "?";
  return (
    <article className="home-user-card">
      <div className="home-user-avatar">
        {avatarDataUrl ? (
          <Image src={avatarDataUrl} alt="profile" width={68} height={68} className="home-user-avatar-img" unoptimized />
        ) : (
          initial
        )}
      </div>
      <h3>{nickname}</h3>
      <div className="home-user-meta">
        문제해결 <span>{division ?? "Unranked"}</span>
      </div>
      <div className="home-user-meta" style={{ marginTop: 4 }}>
        푼 문제 <span>{typeof solvedCount === "number" ? solvedCount.toLocaleString() : "-"}</span>
      </div>
    </article>
  );
}
