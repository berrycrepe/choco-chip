"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus("로그인 중...");
    const result = await login(loginId.trim(), password);
    setStatus(result.message);
    setSubmitting(false);
    if (result.ok) {
      router.push("/profile");
    }
  };

  return (
    <main className="login-wrap">
      <form className="login-box" onSubmit={onSubmit}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 32 }}>
          <span className="logo-badge">CC</span>
          <span style={{ fontWeight: 800, fontSize: 18, color: "var(--text)" }}>Choco Chip</span>
        </div>

        <h1 style={{ textAlign: "center", color: "#fff", fontSize: 26, margin: "0 0 28px", fontWeight: 800 }}>로그인</h1>

        <input
          className="login-input"
          placeholder="아이디"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
        />

        <input
          className="login-input"
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" className="login-btn" style={{ width: "100%", padding: "12px", marginTop: 12 }} disabled={submitting}>
          {submitting ? "로그인 중..." : "로그인"}
        </button>

        <div style={{ marginTop: 12, textAlign: "center" }}>
          <button
            type="button"
            className="btn ghost"
            style={{ fontSize: 13, width: "100%", justifyContent: "center" }}
            onClick={() => router.push("/signup")}
          >
            아직 계정이 없나요? 회원가입
          </button>
        </div>

        {status && (
          <div className="status" style={{ color: "var(--brand-light)", marginTop: 12, textAlign: "center" }}>
            {status}
          </div>
        )}
      </form>
    </main>
  );
}



