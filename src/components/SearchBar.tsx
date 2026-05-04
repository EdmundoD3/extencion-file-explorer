// src/components/SearchBar.tsx
import { useState, useEffect } from "preact/hooks";

export const SearchBar = () => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const rows = Array.from(document.querySelectorAll("#tbody tr"));
    
    rows.forEach((row) => {
      // Buscamos el texto dentro del enlace en esa fila
      const fileName = row.querySelector("a")?.innerText.toLowerCase() || "";
      const matches = fileName.includes(query.toLowerCase());
      
      // Si coincide lo mostramos, si no, lo ocultamos
      (row as HTMLElement).style.display = matches ? "" : "none";
    });
  }, [query]);

  return (
    <div className="native-search-container">
      <span className="search-icon">🔍</span>
      <input
        type="text"
        placeholder="Filtrar archivos en esta carpeta..."
        value={query}
        onInput={(e) => setQuery(e.currentTarget.value)}
        className="native-search-input"
      />
      {query && (
        <button onClick={() => setQuery("")} className="native-search-clear">
          Limpiar
        </button>
      )}
      <small className="search-stats">
        Mostrando {document.querySelectorAll('#tbody tr:not([style*="display: none"])').length} archivos
      </small>
    </div>
  );
};