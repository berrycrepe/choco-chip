import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div>
          <div className="brand" style={{ marginBottom: 14 }}>
            <span className="logo-badge">CC</span>
            <span>Choco Chip</span>
          </div>
          <p style={{ color: "var(--text-dim)", margin: "0 0 12px", fontSize: 13, lineHeight: 1.6 }}>
            알고리즘 문제해결 학습 플랫폼 데모입니다.
          </p>
        </div>
        <div>
          <h4>바로가기</h4>
          <Link href="/">홈</Link>
          <Link href="/problems">문제</Link>
          <Link href="/class">CLASS</Link>
          <Link href="/ranking">랭킹</Link>
          <Link href="/profile">프로필</Link>
        </div>
        <div>
          <h4>안내</h4>
          <p style={{ color: "var(--text-muted)", margin: "0 0 8px", fontSize: 13 }}>현재 데모 버전입니다.</p>
          <p style={{ color: "var(--text-dim)", margin: 0, fontSize: 13 }}>실제 Choco Chip과 무관합니다.</p>
        </div>
      </div>
      <div className="copyright">© 2026 Choco Chip style demo · 실제 서비스와 무관합니다</div>
    </footer>
  );
}


