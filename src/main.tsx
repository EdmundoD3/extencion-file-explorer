import { render } from "preact";
import { App } from "./app";
import "./styles.css";
import type { FileItem } from "./types/fileTypes";

const root = document.createElement("div");
root.id = "ext-file-explorer-root";
document.body.appendChild(root);

const scanFiles = (): FileItem[] => {
  const links = Array.from(document.querySelectorAll("a"));
  return links
    .filter((link) => link.href.match(/\.(jpe?g|png|webp|gif|mp4|webm|ogg)$/i))
    .map((link) => ({
      src: link.href,
      name: link.innerText.trim() || link.href.split("/").pop() || "Untitled",
      type: link.href.match(/\.(mp4|webm|ogg)$/i) ? "vid" : "img",
    }));
};

const files = scanFiles();

// Solo renderizamos si hay archivos
if (files.length > 0) {
  render(<App files={files} />, root);
}

// Escuchador de clics
document.addEventListener("click", (e) => {
  const anchor = (e.target as HTMLElement).closest("a");

  if (anchor && anchor.href) {
    const url = anchor.href;
    const isMedia = url.match(/\.(jpe?g|png|webp|gif|mp4|webm|ogg)$/i);

    if (isMedia) {
      // Importante: Encontrar el index ANTES de prevenir el default
      const fileIndex = files.findIndex((f) => f.src === url);
      
      if (fileIndex !== -1) {
        e.preventDefault(); // Detenemos la navegación solo si lo encontramos en nuestra lista
        
        // Pequeño delay para asegurar que el componente App está listo para escuchar
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("open-explorer", {
            detail: { index: fileIndex },
          }));
        }, 10);
      }
    }
  }
});