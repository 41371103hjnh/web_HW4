// src/FloatingApodCard.jsx
import React, { useEffect, useState } from 'react';

// 簡單日期格式（你要可以自己再改）
function formatDate(dateStr) {
  if (!dateStr) return '';
  return dateStr; // 先用原本的 "YYYY-MM-DD" 格式
}

export default function FloatingApodCard({ apiKey }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [errorDetail, setErrorDetail] = useState('');
  const [expanded, setExpanded] = useState(false); // 是否展開

  // 🔑 最終要用的 API Key
  const finalApiKey = apiKey || process.env.REACT_APP_NASA_KEY || 'DEMO_KEY';
  useEffect(() => {
  console.log("🔍 目前使用的 NASA API KEY：", process.env.REACT_APP_NASA_KEY);
}, []);
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const cacheKey = `apod-${today}`;
    const rateKey = `apod-rate-${today}`;

    // 一個簡單的「示範資料」（今天額度用完時用）
    const fallbackApod = {
      title: '示範：星空圖片（今日 NASA 額度已用完）',
      date: today,
      media_type: 'image',
      // 這裡用隨機圖片服務，你可以換成自己喜歡的圖
      url: 'https://picsum.photos/800/600?random=1',
      hdurl: 'https://picsum.photos/1600/1200?random=1',
      explanation:
        '這是示範用的星空圖片，代表今天的 NASA APOD 免費 API 額度已經用完，因此暫時無法取得真正的今日天文圖片。',
    };
    
    const run = async () => {
      try {
        // 1️⃣ 如果 localStorage 裡已經有「今天的 APOD」，直接用，不再打 API
        const cached = window.localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          setData(parsed);
          setLoading(false);
          return;
        }

        // 2️⃣ 如果今天已經確認「超額」，就不要再打 NASA，直接用示範圖
        const rateHit = window.localStorage.getItem(rateKey);
        if (rateHit === 'hit') {
          setData(fallbackApod);
          setError('今日 NASA APOD 免費額度已用完，顯示示範圖片。');
          setErrorDetail(
            'You have exceeded your rate limit for today. 請隔天再試，或減少 API 呼叫次數。'
          );
          setLoading(false);
          return;
        }

        setLoading(true);
        setError('');
        setErrorDetail('');

        const url = `https://api.nasa.gov/planetary/apod?api_key=${finalApiKey}`;
        console.log('[APOD] 使用的 key 是否存在：', !!finalApiKey);

        const res = await fetch(url);

        if (!res.ok) {
          const text = await res.text();
          console.error('[APOD] 非 2xx 回應：', res.status, text);

          // 嘗試解析錯誤 JSON
          let detailMsg = '';
          try {
            const jsonErr = JSON.parse(text);
            if (jsonErr.error && jsonErr.error.message) {
              detailMsg = jsonErr.error.message;
            }
          } catch (e) {
            detailMsg = text;
          }

          // 429：超出 rate limit → 打個旗子 + 之後都用 fallback
          if (res.status === 429) {
            window.localStorage.setItem(rateKey, 'hit');
            setData(fallbackApod);
            setError('今日 NASA APOD 免費額度已用完，顯示示範圖片。');
            if (detailMsg) setErrorDetail(detailMsg);
          } else {
            setError(`無法取得 NASA 今日天文圖片（HTTP ${res.status}）`);
            if (detailMsg) setErrorDetail(detailMsg);
          }

          setLoading(false);
          return;
        }

        // ✅ 成功取得資料
        const json = await res.json();
        console.log('[APOD] 成功取得資料：', json);
        setData(json);
        window.localStorage.setItem(cacheKey, JSON.stringify(json));
        setLoading(false);
      } catch (err) {
        console.error('[APOD] fetch 發生錯誤：', err);
        setError('取得資料時發生錯誤');
        setErrorDetail(err.message || String(err));
        setLoading(false);
      }
    };

    run();
  }, [finalApiKey]);

  const toggleExpanded = () => {
    setExpanded((prev) => !prev);
  };

  const isImage = data && data.media_type === 'image';

  return (
    <div className={`apod-floating-card ${expanded ? 'apod-expanded' : ''}`}>
      {/* 右下角華麗動畫星星按鈕 */}
      <button
        className="apod-toggle-btn"
        type="button"
        onClick={toggleExpanded}
        aria-label="切換 NASA 天文圖卡片展開"
      >
        <span className="apod-star">⭐</span>
      </button>

      {/* 展開後才顯示內容區塊 */}
      {expanded && (
        <div className="apod-content">
          {loading && <div className="apod-text">載入中…</div>}

          {error && (
            <div style={{ marginBottom: 6 }}>
              <div className="apod-error">{error}</div>
              {errorDetail && (
                <div className="apod-text" style={{ marginTop: 4 }}>
                  詳細訊息：{errorDetail}
                </div>
              )}
            </div>
          )}

          {!loading && data && (
            <>
              <div className="apod-header">
                <div className="apod-title">{data.title}</div>
                <div className="apod-date">
                  NASA APOD · {formatDate(data.date)}
                </div>
              </div>

              {isImage ? (
                <div className="apod-image-wrapper">
                  <img
                    src={data.url}
                    alt={data.title}
                    className="apod-image"
                  />
                </div>
              ) : (
                <div className="apod-text">
                  今日是影片類型，請點連結觀看：
                  <a
                    href={data.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    開啟內容
                  </a>
                </div>
              )}

              <p className="apod-explanation">
                {data.explanation?.length > 150
                  ? data.explanation.slice(0, 150) + '…'
                  : data.explanation}
              </p>

              {data.hdurl || data.url ? (
                <div className="apod-footer">
                  <a
                    href={data.hdurl || data.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    查看完整圖片
                  </a>
                </div>
              ) : null}
            </>
          )}
        </div>
      )}
    </div>
  );
}
