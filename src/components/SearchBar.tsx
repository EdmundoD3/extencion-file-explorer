import { useState, useEffect } from "preact/hooks";

type FilterMode = "all" | "img" | "vid";

export const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<FilterMode>("all");

  useEffect(() => {
    const rows = Array.from(document.querySelectorAll("#tbody tr"));
    
    rows.forEach((row) => {
      const anchor = row.querySelector("a");
      if (!anchor) return;

      const fileName = anchor.innerText.toLowerCase();
      const href = anchor.href.toLowerCase();
      
      // 1. Verificar si es carpeta (las carpetas suelen terminar en / o no tener extensión de media)
      const isFolder = anchor.classList.contains("dir");
      
      // 2. Lógica de filtrado por tipo
      const isImg = href.match(/\.(jpe?g|png|webp|gif)$/i);
      const isVid = href.match(/\.(mp4|webm|ogg)$/i);

      const matchesQuery = fileName.includes(query.toLowerCase());
      let matchesMode = true;

      if (mode === "img") matchesMode = !!isImg;
      if (mode === "vid") matchesMode = !!isVid;

      // Decisión final: Mostrar si coincide la búsqueda Y el modo
      // Las carpetas se ocultan si activamos un filtro específico
      if (mode !== "all" && isFolder) {
        (row as HTMLElement).style.display = "none";
      } else {
        (row as HTMLElement).style.display = (matchesQuery && matchesMode) ? "" : "none";
      }
    });
  }, [query, mode]);

  return (
    <div className="native-search-container">
      <div className="search-input-wrapper">
        <input
          type="text"
          placeholder="Buscar archivos..."
          value={query}
          onInput={(e) => setQuery(e.currentTarget.value)}
          className="native-search-input"
        />
      </div>

      <div className="filter-buttons">
        <button 
          className={`filter-btn ${mode === 'all' ? 'active' : ''}`}
          onClick={() => setMode("all")}
        >
          📁 Todos
        </button>
        <button 
          className={`filter-btn ${mode === 'img' ? 'active' : ''}`}
          onClick={() => setMode("img")}
        >
          🖼️ Imágenes
        </button>
        <button 
          className={`filter-btn ${mode === 'vid' ? 'active' : ''}`}
          onClick={() => setMode("vid")}
        >
          🎬 Videos
        </button>
      </div>

      <small className="search-stats">
        {document.querySelectorAll('#tbody tr:not([style*="display: none"])').length} resultados
      </small>
    </div>
  );
};