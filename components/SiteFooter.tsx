import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <div className="brand" style={{ marginBottom: 14 }}>
            <span className="logo-badge">CC</span>
            <span>Choco Chip</span>
          </div>
          <p style={{ color: "var(--text-dim)", margin: "0 0 16px", fontSize: 13, lineHeight: 1.65 }}>
            알고리즘 문제해결 학습 플랫폼 데모입니다.<br />
            티어·CLASS·랭킹 시스템으로 성장을 설계하세요.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <span className="footer-icon-btn" title="GitHub">
              <span className="material-symbols-rounded icon-sm">code_blocks</span>
            </span>
            <span className="footer-icon-btn" title="Discord">
              <span className="material-symbols-rounded icon-sm">forum</span>
            </span>
            <span className="footer-icon-btn" title="이메일">
              <span className="material-symbols-rounded icon-sm">mail</span>
            </span>
          </div>
        </div>
        <div>
          <h4>
            <span className="material-symbols-rounded icon-sm" style={{ verticalAlign: "middle", marginRight: 4 }}>apps</span>
            플랫폼
          </h4>
          <Link href="/"><span className="material-symbols-rounded icon-sm">home</span>홈</Link>
          <Link href="/problems"><span className="material-symbols-rounded icon-sm">code</span>문제</Link>
          <Link href="/class"><span className="material-symbols-rounded icon-sm">workspace_premium</span>CLASS</Link>
          <Link href="/ranking"><span className="material-symbols-rounded icon-sm">leaderboard</span>랭킹</Link>
          <Link href="/profile"><span className="material-symbols-rounded icon-sm">person</span>프로필</Link>
        </div>
        <div>
          <h4>
            <span className="material-symbols-rounded icon-sm" style={{ verticalAlign: "middle", marginRight: 4 }}>info</span>
            정보
          </h4>
          <p style={{ color: "var(--text-muted)", margin: "0 0 8px", fontSize: 13 }}>현재 데모 버전입니다.</p>
          <p style={{ color: "var(--text-dim)", margin: "0 0 8px", fontSize: 13 }}>실제 Choco Chip과 무관합니다.</p>
          <p style={{ color: "var(--text-dim)", margin: 0, fontSize: 13 }}>
            <span className="material-symbols-rounded icon-sm" style={{ verticalAlign: "middle", marginRight: 4 }}>mail</span>
            baikberry0325@gmail.com
          </p>
        </div>
        <div>
          <h4>
            <span className="material-symbols-rounded icon-sm" style={{ verticalAlign: "middle", marginRight: 4 }}>people</span>
            커뮤니티
          </h4>
          <Link href="/ranking"><span className="material-symbols-rounded icon-sm">emoji_events</span>랭킹 참여</Link>
          <Link href="/signup"><span className="material-symbols-rounded icon-sm">person_add</span>회원가입</Link>
          <Link href="/problems"><span className="material-symbols-rounded icon-sm">psychology</span>문제 도전</Link>
        </div>
      </div>
      <div className="copyright">© 2026 Choco Chip · 실제 서비스와 무관합니다</div>
    </footer>
  );
}
