// GeoWeather.jsx
import React, { useEffect, useState } from 'react';

const API_KEY = process.env.REACT_APP_OPENWEATHER_KEY;

function GeoWeather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!API_KEY) {
      setError('找不到 OpenWeather API Key，請確認 .env 設定');
      return;
    }

    if (!navigator.geolocation) {
      setError('這個瀏覽器不支援定位功能');
      return;
    }

    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchWeather(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        console.error(err);
        setError('無法取得你的目前位置，請確認已允許定位權限');
        setLoading(false);
      }
    );
  }, []);

  const fetchWeather = async (lat, lon) => {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=zh_tw`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('取得天氣資料失敗');

      const data = await res.json();
      setWeather(data);
    } catch (err) {
      console.error(err);
      setError(err.message || '取得天氣資料時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#3f5974' }}>
      {loading && <p style={{ fontSize: '0.9rem' }}>⏳ 正在取得資料…</p>}
      {error && <p style={{ color: '#b91c1c', fontSize: '0.9rem' }}>⚠ {error}</p>}

      {weather && !loading && !error && (
        <div style={{ lineHeight: '1.5', fontSize: '0.95rem' }}>
          {/* 第一行：地點（加粗加大） + 天氣 */}
          <p style={{ margin: '0.2rem 0' }}>
            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
              📍{weather.name}
            </span>
            　|　
            天氣：{weather.weather?.[0]?.description}
          </p>

          {/* 第二行：溫度 + 濕度 + 風速 */}
          <p style={{ margin: '0.2rem 0' }}>
            溫度：{Math.round(weather.main.temp)}°C　|　
            濕度：{weather.main.humidity}%　|　
            風速：{weather.wind.speed} m/s
          </p>
        </div>
      )}
    </div>
  );
}

export default GeoWeather;
