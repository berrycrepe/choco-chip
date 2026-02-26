"use client";

import { usePathname, useRouter } from "next/navigation";

const items = [
  { label: "문제", href: "/problems" },
  { label: "CLASS", href: "/class" },
  { label: "랭킹", href: "/ranking" },
];

export default function SubNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="subnav">
      {items.map((item) => (
        <button
          key={item.href}
          onClick={() => router.push(item.href)}
          className={pathname.startsWith(item.href) ? "active" : ""}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
