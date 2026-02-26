"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { useAuth } from "@/context/AuthContext";

export default function ProfileIndexPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    router.replace(`/profile/${encodeURIComponent(user.handle ?? user.dbUserId ?? user.nickname)}`);
  }, [loading, router, user]);

  return (
    <>
      <SiteHeader />
      <main className="page" style={{ padding: "40px 0" }}>이동 중...</main>
    </>
  );
}
