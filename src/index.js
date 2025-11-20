// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import AItest from './AItest';
import GeoWeather from './GeoWeather';
import NewsTicker from './NewsTicker';   // 新聞跑馬燈元件
import QuoteWidget from './QuoteWidget'; // ⭐ 新增：名言佳句元件

import reportWebVitals from './reportWebVitals';


// ----------------------------
// 掛載 AItest 到 #ai-root
// ----------------------------
const aiEl = document.getElementById('ai-root');
if (aiEl) {
  const aiRoot = ReactDOM.createRoot(aiEl);
  aiRoot.render(
    <React.StrictMode>
      <AItest />
    </React.StrictMode>
  );
} else {
  console.warn('⚠ 找不到 #ai-root（如果你暫時不用 AItest 可以忽略這個訊息）');
}



// ----------------------------
// 掛載 GeoWeather 到 #weather-root
// ----------------------------
const weatherEl = document.getElementById('weather-root');
if (weatherEl) {
  const weatherRoot = ReactDOM.createRoot(weatherEl);
  weatherRoot.render(
    <React.StrictMode>
      <GeoWeather />
    </React.StrictMode>
  );
} else {
  console.warn('⚠ 找不到 #weather-root（如果你暫時不用天氣元件可以忽略這個訊息）');
}



// ----------------------------
// 掛載 NewsTicker 到 #news-root
// ----------------------------
const newsEl = document.getElementById('news-root');
if (newsEl) {
  const newsRoot = ReactDOM.createRoot(newsEl);
  newsRoot.render(
    <React.StrictMode>
      <NewsTicker />
    </React.StrictMode>
  );
} else {
  console.warn('⚠ 找不到 #news-root（請確認 HTML 有 <div id="news-root"></div>）');
}



// ----------------------------
// ⭐ 新增：掛載 QuoteWidget 到 #quote-root
// ----------------------------
const quoteEl = document.getElementById('quote-root');
if (quoteEl) {
  const quoteRoot = ReactDOM.createRoot(quoteEl);
  quoteRoot.render(
    <React.StrictMode>
      <QuoteWidget />
    </React.StrictMode>
  );
} else {
  console.warn('⚠ 找不到 #quote-root（請確認 HTML 有 <div id="quote-root"></div>）');
}


reportWebVitals();
