// src/QuoteWidget.jsx
import React, { useEffect, useState, useMemo } from "react";

function QuoteWidget() {
  const [quote, setQuote] = useState(null);   // { text, author }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pageIndex, setPageIndex] = useState(0); // 目前在第幾頁

  const PAGE_SIZE = 90; // 每頁約幾個字元（以單字為單位切）

  const fetchQuote = async () => {
    setLoading(true);
    setError("");
    setPageIndex(0); // 換新名言時，回到第一頁

    try {
      // 使用 QuoteSlate API
      const res = await fetch("https://quoteslate.vercel.app/api/quotes/random");

      if (!res.ok) {
        const text = await res.text();
        console.error("API Error:", res.status, text);
        throw new Error(`取得名言失敗（HTTP ${res.status}）`);
      }

      const data = await res.json();

      if (!data || !data.quote) {
        throw new Error("API 回傳格式異常");
      }

      setQuote({
        text: data.quote,
        author: data.author || "未知作者",
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "取得名言時發生錯誤");
      setQuote(null);
    } finally {
      setLoading(false);
    }
  };

  // ⭐ 只在「元件首次載入 / 頁面刷新」時抓一次
  useEffect(() => {
    fetchQuote();
  }, []);

  // ⭐ 組成完整文字並「嚴格處理空白」：所有空白轉成單一空格
  const normalizedFullText = useMemo(() => {
    if (!quote) return "";
    const raw = `“${quote.text}” — ${quote.author}`;
    return raw.replace(/\s+/g, " ").trim(); // 把 \n、\t、多個空白 全部壓成一個空格
  }, [quote]);

  // ⭐ 依照「單字」切成多頁（不切斷單字）
  const pages = useMemo(() => {
    if (!normalizedFullText) return [];

    const words = normalizedFullText.split(" "); // 嚴格以空格為單字切割
    const result = [];
    let current = "";

    for (const word of words) {
      const next = current ? current + " " + word : word;
      if (next.length > PAGE_SIZE && current) {
        // 這一頁差不多滿了，先收進去，再用 word 開新頁
        result.push(current);
        current = word;
      } else {
        current = next;
      }
    }
    if (current) result.push(current);

    return result;
  }, [normalizedFullText]);

  const totalPages = pages.length;
  const currentPageText = totalPages ? pages[pageIndex] : "";

  const isFirstPage = pageIndex === 0;
  const isLastPage = pageIndex === totalPages - 1;

  // 顯示時前後補上 …
  const displayText = totalPages
    ? `${isFirstPage ? "" : "…"}${currentPageText}${isLastPage ? "" : "…"}`
    : "";

  const handleNextPage = () => {
    if (!totalPages) return;
    setPageIndex((prev) => (prev + 1) % totalPages); // 最後一頁再按就回到第一頁
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "720px",         // ⭐ 固定容器最大寬度（可自行調整）
        padding: "6px 10px",
        background: "#f8f9f2",
        color: "#3f5974",
        borderRadius: "8px",
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "14px",
        whiteSpace: "nowrap",      // 一行顯示
        overflow: "hidden",        // 超出隱藏
      }}
    >
      {/* 左邊標題 */}
      <span style={{ fontWeight: 600, flexShrink: 0 }}>
        🌟
      </span>

      {/* 中間文字區 */}
      <span
        style={{
          flex: 1,
          overflow: "hidden",
          textOverflow: "clip",
        }}
      >
        {loading && "載入中..."}
        {error && (
          <span style={{ color: "#b91c1c" }}>{error}</span>
        )}
        {!loading && !error && quote && displayText}
      </span>

      {/* 右邊箭頭：只有需要分頁時才顯示 */}
      {totalPages > 1 && (
        <button
          onClick={handleNextPage}
          style={{
            padding: "4px 6px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            fontSize: "12px",
            background: "transparent",
            color: "#3f5974",
            flexShrink: 0,
          }}
        >
          ▸
        </button>
      )}
    </div>
  );
}

export default QuoteWidget;
