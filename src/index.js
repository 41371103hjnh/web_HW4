// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AItest from './AItest';
import GeoWeather from './GeoWeather';
import NewsTicker from './NewsTicker';   // 新聞跑馬燈元件
import QuoteWidget from './QuoteWidget'; // 名言佳句元件
import FloatingApodCard from './FloatingApodCard'; // NASA 懸浮卡元件
import FloatingPokemonCard from './FloatingPokemonCard'; // 🆕 寶可夢懸浮卡元件
import reportWebVitals from './reportWebVitals';

// 先抓一次 .env 裡的 NASA Key
const nasaKey = process.env.REACT_APP_NASA_KEY;
if (!nasaKey) {
  console.warn(
    '⚠ REACT_APP_NASA_KEY 沒有設定，FloatingApodCard 若使用 DEMO_KEY 可能容易遇到 429（rate limit）。'
  );
}

// ----------------------------
// ⭐ 掛載 FloatingApodCard 到 #apod-root
// ----------------------------
const apodEl = document.getElementById('apod-root');
if (apodEl) {
  const apodRoot = ReactDOM.createRoot(apodEl);
  apodRoot.render(
    <React.StrictMode>
      <FloatingApodCard apiKey={nasaKey} />
    </React.StrictMode>
  );
} else {
  console.warn('⚠ 找不到 #apod-root（請確認 HTML 有 <div id="apod-root"></div>）');
}

// ----------------------------
// 🆕 掛載 FloatingPokemonCard 到 #pokemon-root
// ----------------------------
const pokeEl = document.getElementById('pokemon-root');
if (pokeEl) {
  const pokeRoot = ReactDOM.createRoot(pokeEl);
  pokeRoot.render(
    <React.StrictMode>
      <FloatingPokemonCard />
    </React.StrictMode>
  );
} else {
  console.warn('⚠ 找不到 #pokemon-root（請確認 HTML 有 <div id="pokemon-root"></div>）');
}

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
// 掛載 QuoteWidget 到 #quote-root
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
