"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [status, setStatus] = useState("");
  const profileHref = user ? `/profile/${encodeURIComponent(user.handle ?? user.dbUserId ?? user.nickname)}` : "/login";
  const items = [
    { href: "/problems", label: "문제" },
    { href: "/class", label: "CLASS" },
    { href: "/ranking", label: "랭킹" },
    { href: profileHref, label: "프로필", activePrefix: "/profile" },
  ];

  return (
    <>
      <header className="topbar">
        <div className="top-left">
          <Link className="brand" href="/">
            <span className="logo-badge">CC</span>
            <span>Choco Chip</span>
          </Link>
          <nav className="nav">
            {items.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={pathname.startsWith(item.activePrefix ?? item.href) ? "active" : ""}
              >
                {item.label}
              </Link>
            ))}
            <button className="search-dot btn ghost" onClick={() => router.push("/problems")} aria-label="search">⌕</button>
          </nav>
        </div>

        <div className="top-right">
          {user ? (
            <>
              <button className="btn ghost" onClick={() => router.push(profileHref)}>{user.nickname}</button>
              <button className="btn ghost" onClick={() => { logout(); setStatus("로그아웃되었습니다."); router.push("/"); }}>로그아웃</button>
            </>
          ) : (
            <Link className="btn btn-primary" href="/login">로그인</Link>
          )}
        </div>
      </header>
      {status ? <div className="page status">{status}</div> : null}
    </>
  );
}


