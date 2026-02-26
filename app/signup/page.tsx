"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    if (!userId.trim() || !email.trim() || !nickname.trim() || !password.trim()) {
      setStatus("아이디, 이메일, 닉네임, 비밀번호를 모두 입력해 주세요.");
      setSubmitting(false);
      return;
    }

    if (!/^[a-zA-Z0-9_-]{3,24}$/.test(userId.trim())) {
      setStatus("아이디는 3~24자의 영문/숫자/_/- 만 사용할 수 있습니다.");
      setSubmitting(false);
      return;
    }

    if (password !== confirm) {
      setStatus("비밀번호 확인이 일치하지 않습니다.");
      setSubmitting(false);
      return;
    }

    const result = await signup(userId.trim(), email.trim(), nickname.trim(), password);
    setStatus(result.message);
    setSubmitting(false);
    if (result.ok) router.push("/profile");
  };

  return (
    <main className="login-wrap">
      <form className="login-box" onSubmit={onSubmit}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 32 }}>
          <span className="logo-badge">CC</span>
          <span style={{ fontWeight: 800, fontSize: 18, color: "var(--text)" }}>Choco Chip</span>
        </div>

        <h1 style={{ textAlign: "center", color: "#fff", fontSize: 26, margin: "0 0 28px", fontWeight: 800 }}>회원가입</h1>

        <input className="login-input" placeholder="아이디" value={userId} onChange={(e) => setUserId(e.target.value)} />
        <input className="login-input" type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="login-input" placeholder="닉네임" value={nickname} onChange={(e) => setNickname(e.target.value)} />
        <input className="login-input" type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input className="login-input" type="password" placeholder="비밀번호 확인" value={confirm} onChange={(e) => setConfirm(e.target.value)} />

        <button type="submit" className="login-btn" style={{ width: "100%", padding: "12px", marginTop: 20 }} disabled={submitting}>
          {submitting ? "가입 중..." : "가입하기"}
        </button>

        <div style={{ marginTop: 12, textAlign: "center" }}>
          <button
            type="button"
            className="btn ghost"
            style={{ fontSize: 13, width: "100%", justifyContent: "center" }}
            onClick={() => router.push("/login")}
          >
            이미 계정이 있나요? 로그인
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
