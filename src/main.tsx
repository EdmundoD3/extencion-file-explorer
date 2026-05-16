import { render } from "preact";
import { App } from "./app";
import "./styles.css";
import type { FileItem } from "./types/fileTypes";
import { SearchBar } from "./components/SearchBar";

const root = document.createElement("div");
root.id = "ext-file-explorer-root";
document.body.appendChild(root);

// 1. VARIABLE GLOBAL DE CACHÉ
let cachedFiles: FileItem[] = [];

const scanFiles = (): FileItem[] => {
  // Selecciona solo los enlaces que están visibles en la tabla
  const links = Array.from(document.querySelectorAll("#tbody tr:not([style*='display: none']) a"));
  
  return links
    .filter((link) => (link as HTMLAnchorElement).href.match(/\.(jpe?g|png|webp|avif|jfif|gif|mp4|webm|ogg)$/i))
    .map((link) => ({
      src: (link as HTMLAnchorElement).href,
      name: (link as HTMLElement).innerText.trim(),
      type: (link as HTMLAnchorElement).href.match(/\.(mp4|webm|ogg)$/i) ? "vid" : "img",
    }));
};

// 2. FUNCIÓN PARA ACTUALIZAR LA CACHÉ
const updateCachedFiles = () => {
  cachedFiles = scanFiles();
};

const setupSearch = () => { 
  const header = document.getElementById("header");
  if (header) {
    const searchRoot = document.createElement("div");
    searchRoot.id = "search-bar-root";
    header.insertAdjacentElement("afterend", searchRoot);
    render(<SearchBar />, searchRoot);
  }
};

// Inicialización al cargar la página
updateCachedFiles();
setupSearch();

if (cachedFiles.length > 0) {
  render(<App files={cachedFiles} />, root);
}

// 3. ESCUCHAR CUANDO EL BUSCADOR CAMBIE LOS FILTROS
window.addEventListener("filter-changed", () => {
  updateCachedFiles();
});

// 4. EL LISTENER DEL CLICK AHORA ES INSTANTÁNEO
document.addEventListener("click", (e) => {
  const anchor = (e.target as HTMLElement).closest("a");

  if (anchor && anchor.href) {
    const url = anchor.href;
    const isMedia = url.match(/\.(jpe?g|png|webp|avif|jfif|gif|mp4|webm|ogg)$/i);

    if (isMedia) {
      // Buscamos directamente en el array de la memoria RAM (No toca el DOM)
      const fileIndex = cachedFiles.findIndex((f) => f.src === url);

      if (fileIndex !== -1) {
        e.preventDefault();

        // Enviamos la caché actual y el índice al modal
        window.dispatchEvent(new CustomEvent("open-explorer", {
          detail: { 
            index: fileIndex,
            newFiles: cachedFiles 
          },
        }));
      }
    }
  }
});