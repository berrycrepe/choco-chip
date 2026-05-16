"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";

const NAV_ITEMS = [
  { href: "/problems",  label: "문제",   icon: "code"          },
  { href: "/class",     label: "CLASS",  icon: "workspace_premium" },
  { href: "/ranking",   label: "랭킹",   icon: "leaderboard"   },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [status, setStatus] = useState("");
  const profileHref = user
    ? `/profile/${encodeURIComponent(user.handle ?? user.dbUserId ?? user.nickname)}`
    : "/login";

  return (
    <>
      <header className="topbar">
        <div className="top-left">
          <Link className="brand" href="/">
            <span className="logo-badge">CC</span>
            <span>Choco Chip</span>
          </Link>
          <nav className="nav">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={pathname.startsWith(item.href) ? "active" : ""}
              >
                <span className="material-symbols-rounded">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            {user && (
              <Link
                href={profileHref}
                className={pathname.startsWith("/profile") ? "active" : ""}
              >
                <span className="material-symbols-rounded">person</span>
                프로필
              </Link>
            )}
            <button
              className="search-dot btn ghost"
              onClick={() => router.push("/problems")}
              aria-label="search"
            >
              <span className="material-symbols-rounded">search</span>
            </button>
          </nav>
        </div>

        <div className="top-right">
          <ThemeToggle />
          {user ? (
            <>
              <button className="btn ghost" onClick={() => router.push(profileHref)}>
                <span className="material-symbols-rounded icon-sm">person</span>
                {user.nickname}
              </button>
              <button
                className="btn ghost"
                onClick={() => { logout(); setStatus("로그아웃되었습니다."); router.push("/"); }}
              >
                <span className="material-symbols-rounded icon-sm">logout</span>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link className="btn btn-ghost" href="/login">로그인</Link>
              <Link className="btn btn-primary" href="/signup">
                <span className="material-symbols-rounded icon-sm">person_add</span>
                회원가입
              </Link>
            </>
          )}
        </div>
      </header>
      {status ? <div className="page status">{status}</div> : null}
    </>
  );
}
