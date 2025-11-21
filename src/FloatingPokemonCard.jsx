import React, { useEffect, useState } from "react";

export default function FloatingPokemonCard() {
  const [pokemon, setPokemon] = useState(null);       // 寶可夢資料
  const [loading, setLoading] = useState(false);      // 載入狀態
  const [error, setError] = useState("");             // 錯誤訊息
  const [inputName, setInputName] = useState("pikachu"); // 搜尋輸入
  const [expanded, setExpanded] = useState(false);    // 是否展開

  // 取得寶可夢資料
  const fetchPokemon = async (nameOrId) => {
    if (!nameOrId) return;
    setLoading(true);
    setError("");
    setPokemon(null);

    try {
      const res = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${nameOrId.toLowerCase()}`
      );

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("查不到這隻寶可夢，試試看別的名字或編號！");
        }
        throw new Error(`取得資料失敗（HTTP ${res.status}）`);
      }

      const data = await res.json();
      setPokemon(data);
    } catch (err) {
      console.error("[FloatingPokemonCard] 發生錯誤：", err);
      setError(err.message || "取得寶可夢資料時發生錯誤");
    } finally {
      setLoading(false);
    }
  };

  // 一載入先顯示皮卡丘
  useEffect(() => {
    fetchPokemon("pikachu");
  }, []);

  // 隨機抽一隻
  const handleRandom = () => {
    const randomId = Math.floor(Math.random() * 898) + 1; // 1~898
    fetchPokemon(String(randomId));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!inputName.trim()) return;
    fetchPokemon(inputName.trim());
  };

  const toggleExpanded = () => {
    setExpanded((prev) => !prev);
  };

  // 抓官方插畫
  const getArtwork = (p) => {
    if (!p) return "";
    return (
      p.sprites?.other?.["official-artwork"]?.front_default ||
      p.sprites?.front_default ||
      ""
    );
  };

  const isLoaded = !loading && !error && pokemon;

  return (
    <div className={`floating-poke-card ${expanded ? "poke-expanded" : ""}`}>
      {/* 懸浮的 Pokéball 按鈕 */}
      {!expanded && (
  <button
    type="button"
    className="poke-toggle-btn"
    onClick={toggleExpanded}
    aria-label="切換寶可夢卡片"
  >
    <img
      src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/25.png"
      alt="pikachu"
      className="poke-head-icon"
    />
  </button>
)}


      {/* 展開後的內容卡片 */}
      {expanded && (
        <div className="poke-card">
          <div className="poke-header">
  <h3 className="poke-title">Pokémon 資料庫</h3>
  <div className="poke-header-right">
    <button
      type="button"
      className="poke-random-btn"
      onClick={handleRandom}
    >
      🎲 隨機
    </button>
    <button
      type="button"
      className="poke-close-btn"
      onClick={() => setExpanded(false)}
      aria-label="關閉寶可夢卡片"
    >
      ×
    </button>
  </div>
</div>


          <form className="poke-form" onSubmit={handleSearch}>
            <input
              className="poke-input"
              type="text"
              placeholder="輸入名字或編號，如 pikachu 或 25"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
            />
            <button type="submit" className="poke-search-btn">
              搜尋
            </button>
          </form>

          {loading && <div className="poke-text">載入中…</div>}
          {error && <div className="poke-error">{error}</div>}

          {isLoaded && (
            <div className="poke-content">
              <div className="poke-main">
                <div className="poke-image-wrapper">
                  <img
                    className="poke-image"
                    src={getArtwork(pokemon)}
                    alt={pokemon.name}
                  />
                </div>
                <div className="poke-basic">
                  <div className="poke-name">
                    #{pokemon.id} · {pokemon.name.toUpperCase()}
                  </div>
                  <div className="poke-types">
                    {pokemon.types.map((t) => (
                      <span
                        key={t.slot}
                        className={`poke-type type-${t.type.name}`}
                      >
                        {t.type.name}
                      </span>
                    ))}
                  </div>
                  <div className="poke-meta">
                    <span>身高：{pokemon.height / 10} m</span>
                    <span>體重：{pokemon.weight / 10} kg</span>
                  </div>
                </div>
              </div>

              <div className="poke-stats">
                {pokemon.stats.map((s) => (
                  <div key={s.stat.name} className="poke-stat-row">
                    <span className="poke-stat-name">{s.stat.name}</span>
                    <div className="poke-stat-bar-wrap">
                      <div
                        className="poke-stat-bar"
                        style={{ width: `${(s.base_stat / 150) * 100}%` }}
                      />
                    </div>
                    <span className="poke-stat-value">{s.base_stat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
