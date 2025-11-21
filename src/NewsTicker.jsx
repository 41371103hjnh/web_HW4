// NewsTicker.jsx
import React, { useEffect, useState } from "react";

const API_KEY = "697c500836fc14445e1bf9b81ee49084"; // ← 換成你的 GNews key

export default function NewsTicker() {
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError("");

      try {
        const gnewsUrl = `https://gnews.io/api/v4/top-headlines?country=tw&lang=zh&max=10&apikey=${API_KEY}`;
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
          gnewsUrl
        )}`;

        const res = await fetch(proxyUrl);
        if (!res.ok) {
          throw new Error(`HTTP 狀態碼 ${res.status}`);
        }
        const data = await res.json();
        setArticles(data.articles || []);
      } catch (err) {
        console.error(err);
        setError(err.message || "載入新聞失敗");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (error) {
    return <div className="news-ticker-error">新聞載入失敗：{error}</div>;
  }

  if (loading && articles.length === 0) {
    return <div className="news-ticker-loading">新聞載入中…</div>;
  }

  if (!articles.length) return null;

  return (
    <div className="news-ticker">
      <div className="news-ticker-label">最新新聞</div>
      <div className="news-ticker-window">
        <div className="news-ticker-track">
          {/* 第一輪 */}
          {articles.map((a, idx) => (
            <a
              key={idx}
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="news-ticker-item"
            >
              {a.source?.name && (
                <span className="news-ticker-tag">【{a.source.name}】</span>
              )}
              <span>{a.title}</span>
            </a>
          ))}
          {/* 第二輪（複製一份，讓跑馬燈看起來無縫循環） */}
          {articles.map((a, idx) => (
            <a
              key={`dup-${idx}`}
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="news-ticker-item"
            >
              {a.source?.name && (
                <span className="news-ticker-tag">【{a.source.name}】</span>
              )}
              <span>{a.title}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
