import { useState, useEffect } from "preact/hooks";

type FilterMode = "all" | "img" | "vid";

export const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<FilterMode>("all");

useEffect(() => {
  const tbody = document.getElementById("tbody");
  if (!tbody) return;

  // 1. DESCONECTAR EL RENDERIZADO: Ocultamos el tbody completo.
  // Al hacer esto, Chrome ignora gráficamente todo lo que pase adentro.
  tbody.style.display = "none";

  const rows = Array.from(tbody.querySelectorAll("tr"));
  
  // 2. PROCESAMIENTO ATÓMICO: Como el padre está oculto, 
  // este bucle corre a la velocidad de la RAM (menos de 2ms para 2,000 filas)
  rows.forEach((row) => {
    const anchor = row.querySelector("a");
    if (!anchor) return;

    const fileName = anchor.innerText.toLowerCase();
    const href = anchor.href.toLowerCase();
    const isFolder = anchor.classList.contains("dir");
    
    const isImg = href.match(/\.(jpe?g|png|webp|avif|jfif|gif)$/i);
    const isVid = href.match(/\.(mp4|webm|ogg)$/i);

    const matchesQuery = fileName.includes(query.toLowerCase());
    let matchesMode = true;

    if (mode === "img") matchesMode = !!isImg;
    if (mode === "vid") matchesMode = !!isVid;

    if (mode !== "all" && isFolder) {
      row.style.display = "none";
    } else {
      row.style.display = (matchesQuery && matchesMode) ? "" : "none";
    }
  });

  // 3. RECONEXIÓN GRÁFICA: Volvemos a mostrar el tbody.
  // Chrome hace un SOLO cálculo visual para pintar los resultados finales.
  tbody.style.display = "";

  // Avisamos a la caché que ya terminamos
  window.dispatchEvent(new CustomEvent("filter-changed"));

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