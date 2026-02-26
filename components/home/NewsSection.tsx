"use client";

import { loggedInNews } from "@/data/home/dashboardData";

export default function NewsSection() {
  return (
    <section className="home-news-section">
      <div className="home-news-head">
        <h3>공지</h3>
      </div>
      {loggedInNews.length === 0 ? (
        <div className="home-empty-news">현재 등록된 공지가 없습니다.</div>
      ) : (
        <div className="news-list">
          {loggedInNews.map((item, i) => (
            <div key={i} className="news-row">
              <span>{item.title}</span>
              <span className="news-date">{item.date}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
