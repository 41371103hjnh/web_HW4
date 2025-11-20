import { GoogleGenAI } from '@google/genai';
import React, { useEffect, useMemo, useRef, useState } from 'react';

/* ==== Helpers ==== */
const uid = () => Math.random().toString(36).slice(2, 10);
const asUser  = (text) => ({ role: 'user',  parts: [{ text }] });
const asModel = (text) => ({ role: 'model', parts: [{ text }] });

function autoTitleFromHistory(history) {
  const userMsg = history.find(m => m.role === 'user');
  if (!userMsg) return '新的美食';
  let text = (userMsg.parts || []).map(p => p.text).join(' ');
  text = text
    .replace(/👋/g, '')
    .replace(/嗨+[～!！]?/g, '')
    .replace(/[#*_\-~'>]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
  const short = text.slice(0, 25);
  return short ? short + (text.length > 25 ? '…' : '') : '新的美食';
}

/* ==== FoodRoulette ==== */
function FoodRoulette({
  size = 200,
  items = [
    '拉麵', '義大利麵', '壽司', '三明治', '牛排',
    '鐵板燒', '烏龍麵', '便利商店', '蔥油餅', '火鍋',
  ],
  right = 20,
  bottom = 20,
  embedded = false,
} = {}) {
  const wheelRef = useRef(null);
  const [spinning, setSpinning] = useState(false);
  const [selected, setSelected] = useState('');

  const ring = Math.max(4, Math.round(size * 0.03));
  const centerSize = Math.round(size * 0.30);
  const R = size / 2;
  const sectorDeg = 360 / items.length;
  const thetaAll = (2 * Math.PI) / items.length;

  const labelRadius = R - ring - 24;
  const baseFont = Math.round(size * 0.06);

  const colors = ['#f5dfe0','#ebb7b5','#f0d5e3','#e6acc7','#e3c1e6'];
  const gradientStops = items
    .map((_, i) => {
      const start = i * sectorDeg;
      const end = (i + 1) * sectorDeg;
      return `${colors[i % colors.length]} ${start}deg ${end}deg`;
    })
    .join(', ');

  function handleStart() {
    const el = wheelRef.current;
    if (!el || spinning) return;
    setSelected('');
    setSpinning(true);
    el.style.transition = 'none';
    el.style.animation = 'roulette-spin 900ms linear infinite';
  }

  function handleStop() {
    const el = wheelRef.current;
    if (!el || !spinning) return;

    setSpinning(false);
    el.style.animation = 'none';

    const idx = Math.floor(Math.random() * items.length);
    const targetDeg = 90- (idx * sectorDeg + sectorDeg / 2);
    const extraTurns = 6 * 360;
    const finalDeg = extraTurns + targetDeg;

    const cs = getComputedStyle(el).transform;
    let currentDeg = 0;
    if (cs && cs !== 'none') {
      const vals = cs.split('(')[1].split(')')[0].split(',');
      const a = parseFloat(vals[0]);
      const b = parseFloat(vals[1]);
      const rad = Math.atan2(b, a);
      currentDeg = (rad * 180) / Math.PI;
    }
    const normalized = ((currentDeg % 360) + 360) % 360;
    const deltaToTarget = (360 + ((finalDeg - normalized) % 360)) % 360;
    const absoluteFinal = currentDeg + deltaToTarget;

    el.style.transition = 'transform 3000ms cubic-bezier(0.12, 0.6, 0.03, 1)';
    el.style.transform = 'rotate(' + absoluteFinal + 'deg)';

    const onDone = () => {
      setSelected(items[idx]);
      el.removeEventListener('transitionend', onDone);
    };
    el.addEventListener('transitionend', onDone);
  }

  return (
    <>
      <style>{'@keyframes roulette-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }'}</style>

      <div
        style={{
          position: embedded ? 'relative' : 'fixed',
          ...(embedded ? {} : { right, bottom, zIndex: 2147483647 }),
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          userSelect: 'none',
        }}
      >
        <div style={{ position: 'relative', width: size, height: size }}>
          {/* 指針 */}
          <div
            style={{
              position: 'absolute',
              top: '-' + (size * 0.08) + 'px',
              left: '50%',
              transform: 'translateX(0%)',
              width: (size * 0.015) + 'px',
              height: (size * 0.2) + 'px',
              backgroundColor: '#8a6878ff',
              borderRadius: (size * 0.01) + 'px',
              zIndex: 3,
              boxShadow: '0 0 4px rgba(0,0,0,0.3)',
            }}
          />

          {/* 轉盤本體 */}
          <div
            ref={wheelRef}
            style={{
              position: 'absolute',
              inset: 0,
              margin: 'auto',
              width: size,
              height: size,
              borderRadius: '50%',
              border: ring + 'px solid #8a6878ff',
              background: 'conic-gradient(from -90deg, ' + gradientStops + ')',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 6px 18px #232426ff(0,0,0,0.3)',
            }}
          >
            <div
              style={{
                width: centerSize,
                height: centerSize,
                borderRadius: '50%',
                background: '#fff',
                border: Math.max(2, Math.round(ring * 0.6)) + 'px solid #8a6878ff',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 800,
                fontSize: Math.max(10, Math.round(baseFont * 0.9)),
              }}
            >
              吃什麼
            </div>

            {/* 扇區文字 */}
            {items.map((label, i) => {
              const angleDeg = -90 + i * sectorDeg + sectorDeg / 2;
              const chord = 2 * labelRadius * Math.sin(thetaAll / 2);
              const maxW = Math.max(40, Math.floor(chord - size * 0.06));
              const fontSize = Math.max(10, Math.min(Math.round(size * 0.08), Math.floor(maxW / 6)));
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%) rotate(' + angleDeg + 'deg) translateY(-' + labelRadius + 'px) rotate(-90deg)',
                    transformOrigin: 'center center',
                    width: maxW + 'px',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    pointerEvents: 'none',
                    fontWeight: 700,
                    fontSize: fontSize,
                    lineHeight: 1.1,
                    textShadow: '0 1px 2px ##8a6878ff(0,0,0,0.25)',
                  }}
                  title={label}
                >
                  {label}
                </div>
              );
            })}
          </div>
        </div>

        {/* 按鈕列 */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={handleStart}
            disabled={spinning}
            style={{
              padding: '8px 12px',
              borderRadius: 999,
              border: '1px solid #8a6878ff',
              background: '#8a6878ff',
              color: '#fff',
              cursor: spinning ? 'not-allowed' : 'pointer',
              fontSize: 14,
            }}
          >
            開始
          </button>
          <button
            type="button"
            onClick={handleStop}
            disabled={!spinning}
            style={{
              padding: '8px 12px',
              borderRadius: 999,
              border: '1px solid #8a6878ff',
              background: '#fff',
              color: '#8a6878ff',
              cursor: !spinning ? 'not-allowed' : 'pointer',
              fontSize: 14,
            }}
          >
            停止
          </button>
        </div>

        <div
          style={{
            minHeight: 22,
            fontSize: 14,
            fontWeight: 700,
            color: '#8a6878ff',
          }}
        >
          {selected ? '今天吃：' + selected : '　'}
        </div>
      </div>
    </>
  );
}

/* ==== Main Component ==== */
export default function AItest({
  defaultModel = 'gemini-2.5-flash',
  starter = '師大附近有推薦的餐廳嗎?',
} = {}) {
  const [model, setModel] = useState(defaultModel);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [rememberKey, setRememberKey] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const listRef = useRef(null);

  const [convs, setConvs] = useState([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('gemini_api_key');
      if (saved) setApiKey(saved);
    } catch {}
  }, []);

  useEffect(() => {
    if (convs.length > 0) return;
    const first = {
      id: uid(),
      title: '新的美食',
      history: [asModel('嗨~👋，今天又不知道要吃什麼了嗎？')],
      createdAt: Date.now(),
    };
    setConvs([first]);
    setActiveId(first.id);
    setHistory(first.history);
    if (starter) setInput(starter);
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [history, loading]);

  const ai = useMemo(() => {
    try {
      return apiKey ? new GoogleGenAI({ apiKey }) : null;
    } catch {
      return null;
    }
  }, [apiKey]);

  function startNewConversation(prefill) {
    const c = {
      id: uid(),
      title: '新的美食',
      history: [asModel('👋 開始一個新的美食旅程吧！')],
      createdAt: Date.now(),
    };
    setConvs(prev => [c, ...prev]);
    setActiveId(c.id);
    setHistory(c.history);
    setInput(prefill ?? '');
    setError('');
  }

  function switchConversation(id) {
    const target = convs.find(c => c.id === id);
    if (!target) return;
    setActiveId(id);
    setHistory(target.history);
    setInput('');
    setError('');
  }

  async function sendMessage(message) {
    const content = (message ?? input).trim();
    if (!content || loading) return;
    if (!ai) { setError('請先輸入有效的 Gemini API Key'); return; }
    setError('');
    setLoading(true);

    const nextHistory = [...history, asUser(content)];
    setHistory(nextHistory);
    setConvs(prev => prev.map(c => c.id === activeId ? { ...c, history: nextHistory } : c));
    setInput('');

    try {
      const resp = await ai.models.generateContent({
        model,
        contents: nextHistory,
      });

      const reply =
        (resp && resp.text) ??
        (resp && resp.output_text) ??
        (resp && resp.response && typeof resp.response.text === 'function' ? resp.response.text() : null) ??
        '[No content]';

      setHistory(h => {
        const updated = [...h, asModel(String(reply))];
        const newTitle = autoTitleFromHistory(updated);
        setConvs(prev => prev.map(c =>
          c.id === activeId ? { ...c, history: updated, title: newTitle } : c
        ));
        return updated;
      });

    } catch (err) {
      const anyErr = err || {};
      const code = anyErr.status || anyErr.code || (anyErr.response && anyErr.response.status);
      let msg = anyErr.message || String(anyErr);
      if (code === 401) msg = '鑑權失敗（401）：請確認 API Key 是否正確／未過期。';
      else if (code === 403) msg = '拒絕存取（403）：此金鑰可能沒有權限。';
      else if (code === 404) msg = '模型不存在（404）：請確認模型 ID是否有效。';
      else if (code === 429) msg = '已達流量/速率限制（429）：請稍後再試或降低頻率。';
      else if (code >= 500 && code < 600) msg = '伺服器暫時問題（5xx）：請稍後重試。';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function renderMarkdownLike(text) {
    const lines = String(text || '').split(/\n/);
    return (
      <>
        {lines.map((ln, i) => (
          <div key={i} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{ln}</div>
        ))}
      </>
    );
  }

  return (
    <>
      <div style={styles.wrap}>
        {/* 左：聊天主卡片 */}
        <div style={styles.card}>
          <div style={styles.header}>
            <span style={{ fontWeight: 800, fontSize: 26 }}>👩‍🍳美食報報2.0🍴</span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                style={styles.modelSelect}
              >
                <option value="gemini-2.5-flash">gemini-2.5-flash（快速）</option>
                <option value="gemini-2.5-pro">gemini-2.5-pro（進階）</option>
              </select>

              <input
                type="password"
                value={apiKey}
                onChange={(e) => {
                  const v = e.target.value;
                  setApiKey(v);
                  if (rememberKey) localStorage.setItem('gemini_api_key', v);
                }}
                placeholder="API Key"
                style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  fontSize: 14,
                  width: 220,
                }}
              />

              <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                <input
                  type="checkbox"
                  checked={rememberKey}
                  onChange={(e) => {
                    setRememberKey(e.target.checked);
                    if (!e.target.checked) localStorage.removeItem('gemini_api_key');
                    else if (apiKey) localStorage.setItem('gemini_api_key', apiKey);
                  }}
                />
                記住在本機
              </label>
            </div>
          </div>

          <div ref={listRef} style={styles.messages}>
            {history.map((m, idx) => (
              <div
                key={idx}
                style={{ ...styles.msg, ...(m.role === 'user' ? styles.user : styles.assistant) }}
              >
                <div style={styles.msgRole}>{m.role === 'user' ? 'You' : 'Gemini'}</div>
                <div style={styles.msgBody}>
                  {renderMarkdownLike(((m.parts ?? []).map((p) => p.text ?? '')).join('\n'))}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ ...styles.msg, ...styles.assistant }}>
                <div style={styles.msgRole}>Gemini</div>
                <div style={styles.msgBody}>思考中…</div>
              </div>
            )}
          </div>

          {error && <div style={styles.error}>⚠ {error}</div>}

          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} style={styles.composer}>
            <input
              placeholder="輸入訊息，按 Enter 送出"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={styles.textInput}
            />
            <button type="submit" disabled={loading || !input.trim() || !apiKey} style={styles.sendBtn}>
              送出
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexWrap: 'wrap', marginTop: 8, padding: '0 12px 12px' }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>常見問題</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['台北有什麼好吃的甜點', '今天午餐要吃什麼？', '推薦好吃的早午餐店',  '平價又好吃的餐廳推薦', '最近流行哪些特色美食？'].map((q) => (
                <button key={q} type="button" style={styles.suggestion} onClick={() => sendMessage(q)}>
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div style={{ fontWeight: 600, marginBottom: 4 , marginLeft: 16}}>健康料理</div>
          <div
            style={{
              position: 'sticky',
              bottom: 0,
              background: '#fff',
              padding: '8px 12px 12px',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              justifyContent: 'flex-start',
              zIndex: 10,
            }}
          >
            {[
              { icon: '🍅🍳', name: '番茄雞蛋麵' },
              { icon: '🥬🥚', name: '蔬菜蛋捲' },
              { icon: '🍲', name: '豬肉白菜豆腐湯' },
              { icon: '🍤🍗', name: '鮮蝦雞肉排' },
              { icon: '🥗', name: '雞胸肉沙拉' },
              { icon: '🥘🍱', name: '低脂料理' },

            ].map((dish) => (
              <button
                key={dish.name}
                type="button"
                style={styles.suggestion}
                onClick={() => sendMessage(dish.name + ' 的料理食譜')}
              >
                <span style={{ marginRight: 6 }}>{dish.icon}</span>
                {dish.name}
              </button>
            ))}
          </div>
        </div>

        {/* 右：對話選單 */}
        <aside style={styles.sidebar}>
          <div style={styles.sideHeader}>
            你最近搜尋的美食
            <button type="button" style={styles.newBtn} onClick={() => startNewConversation()}>
              ＋ 新增美食
            </button>
          </div>

          <div style={styles.convList}>
            {convs.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => switchConversation(c.id)}
                style={{
                  ...styles.convItem,
                  ...(c.id === activeId ? styles.convItemActive : null),
                }}
                title={new Date(c.createdAt).toLocaleString()}
              >
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
                  {c.title || '未命名'}
                </div>
                <div style={{ fontSize: 12, opacity: 0.7, textAlign: 'left' }}>
                  {((c.history[c.history.length - 1] || {}).parts || [])[0]?.text?.slice(0, 24) ?? '（無訊息）'}
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* ✅ 放在右側卡片外正下方的轉盤 */}
        <div style={{ position: 'absolute', right: 24, bottom: 24 }}>
          <FoodRoulette embedded size={200} />
        </div>
      </div>
    </>
  );
}

/* ==== Styles ==== */
const styles = {
  wrap: {
    width: '90vw',
    height: '100vh',
    display: 'grid',
    gridTemplateColumns: '1fr 300px',
    gap: 16,
    background: 'transparent',
    padding: 0,
    boxSizing: 'border-box',
    position: 'relative',   // for absolute-positioned roulette holder
    margin: '0 auto',   
  },

  card: {
    width: '100%',
    height: '90%',
    background: '#fff',
    border: '1px solid #684d68ff',
    borderRadius: 16,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 20px rgba(12, 12, 12, 0.3)',
    overflow: 'hidden',
    position: 'relative',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
    fontWeight: 800,
    fontSize: '26px',
    color: '#3f5974',
    borderBottom: '1px solid #dad2d8ff',
    background: '#d9c2d3ff',
  },

  controls: {
    display: 'grid',
    gap: 12,
    gridTemplateColumns: '1fr 1fr',
    padding: 12,
    borderBottom: '1px solid #dad2d8ff',
    flexShrink: 0,
  },

  label: { display: 'grid', gap: 6, fontSize: 13, fontWeight: 600 },
  input: { padding: '10px 12px', borderRadius: 10, border: '1px solid #dad2d8ff', fontSize: 14 },

  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    background: '#fafafa',
    WebkitOverflowScrolling: 'touch',
  },

  msg: { borderRadius: 12, padding: 10, border: '1px solid #dad2d8ff' },
  user: { background: '#e9d0dfb1', borderColor: '#fad5f1ac' },
  assistant: { background: '#96527433', borderColor: '#dad2d8ff' },
  msgRole: { fontSize: 12, fontWeight: 700, opacity: 0.7, marginBottom: 6 },
  msgBody: { fontSize: 14, lineHeight: 1.5 },

  error: { color: '#b91c1c', padding: '4px 12px' },

  composer: {
    padding: 12,
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: 8,
    borderTop: '1px solid #dad2d8ff',
    flexShrink: 0,
    background: '#fff',
  },

  textInput: { padding: '10px 12px', borderRadius: 10, border: '1px solid #dad2d8ff', fontSize: 14 },
  sendBtn: { padding: '10px 14px', borderRadius: 999, border: '1px solid #684d68ff', background: '#8a6878ff', color: '#fff', fontSize: 14, cursor: 'pointer' },
  suggestion: { padding: '6px 10px', borderRadius: 999, border: '1px solid #dad2d8ff', background: '#f9fafb', cursor: 'pointer', fontSize: 12 },

  sidebar: {
    height: '50%',
    background: '#ffffff',
    border: '1px solid #684d68ff',
    borderRadius: 16,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
     boxShadow: '0 4px 20px rgba(12, 12, 12, 0.3)',
  },

  sideHeader: {
    padding: '12px 14px',
    borderBottom: '1px solid #684d68ff',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#d9c2d3ff',
  },

  newBtn: {
    fontSize: 12,
    padding: '6px 10px',
    borderRadius: 999,
    border: '1px solid #684d68ff',
    background: '#8a6878ff',
    color: '#fff',
    cursor: 'pointer',
  },

  convList: {
    flex: 1,
    overflowY: 'auto',
    padding: 8,
    background: '#fff',
  },

  convItem: {
    width: '100%',
    textAlign: 'left',
    display: 'block',
    padding: '10px 12px',
    borderRadius: 12,
    border: '1px solid #684d68ff',
    background: '#fff',
    marginBottom: 8,
    cursor: 'pointer',
  },

  convItemActive: {
    borderColor: '#684d68ff',
    background: '#f3f4f6',
  },

  modelSelect: {
    marginLeft: 'auto',
    padding: '6px 10px',
    fontSize: '14px',
    borderRadius: '8px',
    border: '1px solid #dad2d8ff',
    background: '#fff',
    cursor: 'pointer',
  },

  controlsSingle: {
    display: 'flex',
    justifyContent: 'flex-start',
    padding: 12,
  },
};

export { };
