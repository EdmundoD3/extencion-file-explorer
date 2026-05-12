import { render } from "preact";
import { App } from "./app";
import "./styles.css";
import type { FileItem } from "./types/fileTypes";
import { SearchBar } from "./components/SearchBar";

const root = document.createElement("div");
root.id = "ext-file-explorer-root";
document.body.appendChild(root);
// Mantenemos scanFiles igual, pero ahora la llamaremos por cada clic
const scanFiles = (): FileItem[] => {
  // Solo seleccionamos enlaces que NO estén dentro de una fila oculta
  const links = Array.from(document.querySelectorAll("#tbody tr:not([style*='display: none']) a"));
  
  return links
    .filter((link) => (link as HTMLAnchorElement).href.match(/\.(jpe?g|png|webp|avif|gif|mp4|webm|ogg)$/i))
    .map((link) => ({
      src: (link as HTMLAnchorElement).href,
      name: (link as HTMLElement).innerText.trim(),
      type: (link as HTMLAnchorElement).href.match(/\.(mp4|webm|ogg)$/i) ? "vid" : "img",
    }));
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
const files = scanFiles();
setupSearch();

// Solo renderizamos si hay archivos
if (files.length > 0) {
  render(<App files={files} />, root);
}


document.addEventListener("click", (e) => {
  const anchor = (e.target as HTMLElement).closest("a");

  if (anchor && anchor.href) {
    const url = anchor.href;
    const isMedia = url.match(/\.(jpe?g|png|webp|gif|mp4|webm|ogg)$/i);

    if (isMedia) {
      e.preventDefault();

      // REESCANEO: Obtenemos el orden actual del DOM
      const currentFiles = scanFiles(); 
      const fileIndex = currentFiles.findIndex((f) => f.src === url);

      if (fileIndex !== -1) {
        // Enviamos tanto el nuevo orden como el índice
        window.dispatchEvent(new CustomEvent("open-explorer", {
          detail: { 
            index: fileIndex,
            newFiles: currentFiles // <-- Enviamos la lista actualizada
          },
        }));
      }
    }
  }
});