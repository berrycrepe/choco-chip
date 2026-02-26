"use client";

import type { Account, BannerType } from "@/lib/types";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

interface AuthContextValue {
  user: Account | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<{ ok: boolean; message: string }>;
  signup: (id: string, email: string, nickname: string, password: string) => Promise<{ ok: boolean; message: string }>;
  logout: () => void;
  updateProfile: (payload: {
    nickname: string;
    bio: string;
    avatarDataUrl: string;
    bannerType: BannerType;
    customBannerDataUrl?: string;
  }) => Promise<{ ok: boolean; message: string }>;
  toggleSolvedProblem: (problemId: number) => { ok: boolean; message: string };
}

const ACCOUNTS_KEY = "ac_accounts";
const CURRENT_KEY = "ac_current";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalizeAccount(account: Partial<Account>): Account {
  const rawBanner = account.bannerType;
  const bannerType =
    rawBanner === "free-grid" || rawBanner === "free-nebula" || rawBanner === "free-midnight" || rawBanner === "custom-upload"
      ? rawBanner
      : "free-grid";

  return {
    email: account.email ?? "",
    nickname: account.nickname ?? "",
    password: account.password ?? "",
    bio: account.bio ?? "",
    solvedProblemIds: Array.isArray(account.solvedProblemIds) ? account.solvedProblemIds : [],
    avatarDataUrl: account.avatarDataUrl ?? "",
    bannerType,
    customBannerDataUrl: account.customBannerDataUrl ?? "",
    dbUserId: account.dbUserId,
    handle: account.handle,
    division: account.division,
    rating: typeof account.rating === "number" ? account.rating : undefined,
    solvedCount: typeof account.solvedCount === "number" ? account.solvedCount : undefined,
    wins: typeof account.wins === "number" ? account.wins : undefined,
    losses: typeof account.losses === "number" ? account.losses : undefined,
    draws: typeof account.draws === "number" ? account.draws : undefined,
  };
}

function readAccounts(): Account[] {
  const raw = localStorage.getItem(ACCOUNTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Partial<Account>[];
    return parsed.map(normalizeAccount);
  } catch {
    return [];
  }
}

function writeAccounts(accounts: Account[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentEmail = localStorage.getItem(CURRENT_KEY);
    const accounts = readAccounts();
    const current = accounts.find((account) => account.email === currentEmail) ?? null;
    setUser(current);
    setLoading(false);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    login: async (identifier: string, password: string) => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, password }),
        });
        const data = await res.json();
        if (data.ok) {
          const accounts = readAccounts();
          const account: Account = normalizeAccount({
            email: data.user.email,
            nickname: data.user.nickname,
            password: "",
            bio: data.user.bio ?? "",
            solvedProblemIds: data.user.solvedProblemIds ?? [],
            avatarDataUrl: data.user.avatarDataUrl ?? "",
            bannerType: data.user.bannerType ?? "free-grid",
            customBannerDataUrl: data.user.customBannerDataUrl ?? "",
            dbUserId: data.user.id,
            handle: data.user.handle,
            division: data.user.division,
            rating: data.user.rating,
            solvedCount: data.user.solvedCount,
            wins: data.user.wins,
            losses: data.user.losses,
            draws: data.user.draws,
          });

          const existing = accounts.find((a) => a.email.toLowerCase() === data.user.email.toLowerCase());
          const mergedAccount = existing
            ? {
                ...existing,
                ...account,
              }
            : account;

          const updated = existing
            ? accounts.map((a) => (a.email === mergedAccount.email ? mergedAccount : a))
            : [...accounts, mergedAccount];

          writeAccounts(updated);
          localStorage.setItem(CURRENT_KEY, mergedAccount.email);
          setUser(mergedAccount);
          return { ok: true, message: "로그인되었습니다." };
        }
        return { ok: false, message: data.message ?? "로그인에 실패했습니다." };
      } catch {
        // Network error: fall back to localStorage-only accounts
      }

      const accounts = readAccounts();
      const found = accounts.find((a) => {
        const id = (a.dbUserId ?? "").toLowerCase();
        return id === identifier.toLowerCase() || a.email.toLowerCase() === identifier.toLowerCase();
      });
      if (!found) return { ok: false, message: "계정을 찾을 수 없습니다." };
      if (found.password !== password) return { ok: false, message: "비밀번호가 올바르지 않습니다." };

      localStorage.setItem(CURRENT_KEY, found.email);
      setUser(found);
      return { ok: true, message: "로그인되었습니다." };
    },
    signup: async (id: string, email: string, nickname: string, password: string) => {
      const accounts = readAccounts();
      const exists = accounts.some(
        (account) =>
          (account.dbUserId ?? "").toLowerCase() === id.toLowerCase() ||
          account.email.toLowerCase() === email.toLowerCase() ||
          account.nickname.toLowerCase() === nickname.toLowerCase()
      );
      if (exists) return { ok: false, message: "이미 존재하는 아이디, 이메일 또는 닉네임입니다." };

      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, email, nickname, password }),
        });
        const data = await res.json();
        if (!data?.ok) {
          return { ok: false, message: data?.message ?? "회원가입에 실패했습니다." };
        }

        const created: Account = normalizeAccount({
          email: data.user.email,
          nickname: data.user.nickname,
          password: "",
          bio: data.user.bio ?? "",
          solvedProblemIds: data.user.solvedProblemIds ?? [],
          avatarDataUrl: data.user.avatarDataUrl ?? "",
          bannerType: data.user.bannerType ?? "free-grid",
          customBannerDataUrl: data.user.customBannerDataUrl ?? "",
          dbUserId: data.user.id,
          handle: data.user.handle,
          division: data.user.division,
          rating: data.user.rating,
          solvedCount: data.user.solvedCount,
          wins: data.user.wins,
          losses: data.user.losses,
          draws: data.user.draws,
        });

        const merged = [...accounts.filter((a) => a.email !== created.email), created];
        writeAccounts(merged);
        localStorage.setItem(CURRENT_KEY, created.email);
        setUser(created);
        return { ok: true, message: "회원가입이 완료되었습니다." };
      } catch {
        return { ok: false, message: "회원가입 중 네트워크 오류가 발생했습니다." };
      }
    },
    logout: () => {
      localStorage.removeItem(CURRENT_KEY);
      setUser(null);
    },
    updateProfile: async ({ nickname, bio, avatarDataUrl, bannerType, customBannerDataUrl }) => {
      if (!user) return { ok: false, message: "로그인이 필요합니다." };
      const accounts = readAccounts();

      const duplicate = accounts.find(
        (account) =>
          account.nickname.toLowerCase() === nickname.toLowerCase() && account.email !== user.email
      );
      if (duplicate) return { ok: false, message: "이미 사용 중인 닉네임입니다." };

      const updated = accounts.map((account) =>
        account.email === user.email
          ? {
              ...account,
              nickname,
              bio,
              avatarDataUrl,
              bannerType,
              customBannerDataUrl: customBannerDataUrl ?? account.customBannerDataUrl ?? "",
            }
          : account
      );

      writeAccounts(updated);
      const localCurrent = updated.find((account) => account.email === user.email) ?? null;
      setUser(localCurrent);

      // Persist visual profile fields to DB for logged-in DB users.
      if (localCurrent?.dbUserId) {
        try {
          const res = await fetch("/api/users/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: localCurrent.dbUserId,
              nickname,
              bio,
              avatarDataUrl,
              bannerType,
              customBannerDataUrl: customBannerDataUrl ?? "",
            }),
          });

          const data = await res.json();
          if (data?.ok) {
            const refreshed = normalizeAccount({
              ...localCurrent,
              nickname: data.user.name,
              handle: localCurrent.handle, // handle never changes
              bio: data.user.bio,
              avatarDataUrl: data.user.avatarDataUrl,
              bannerType: data.user.bannerType,
              customBannerDataUrl: data.user.customBannerDataUrl,
            });

            const synced = updated.map((a) => (a.email === refreshed.email ? refreshed : a));
            writeAccounts(synced);
            setUser(refreshed);
            return { ok: true, message: "프로필이 저장되었습니다." };
          }

          return { ok: false, message: data?.message ?? "프로필 DB 저장에 실패했습니다." };
        } catch {
          return { ok: false, message: "로컬 저장은 완료됐지만 DB 저장에 실패했습니다." };
        }
      }

      return { ok: true, message: "프로필이 저장되었습니다." };
    },
    toggleSolvedProblem: () => {
      return { ok: false, message: "수동 토글은 비활성화되었습니다. 실제 제출 기록으로만 반영됩니다." };
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
