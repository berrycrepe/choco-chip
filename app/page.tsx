"use client";

import SiteHeader from "@/components/SiteHeader";
import GuestLanding from "@/components/home/GuestLanding";
import LoggedInHome from "@/components/home/LoggedInHome";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <>
        <SiteHeader />
        <main className="page" style={{ padding: "40px 0" }}>로딩 중...</main>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      {user ? (
        <LoggedInHome
          nickname={user.nickname}
          division={user.division}
          solvedCount={user.solvedCount}
          avatarDataUrl={user.avatarDataUrl}
        />
      ) : (
        <GuestLanding />
      )}
    </>
  );
}
