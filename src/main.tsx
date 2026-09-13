import { render } from "preact";
import { App } from "./app";
import "./styles.css";
import type { FileItem } from "./types/fileTypes";
import { SearchBar } from "./components/SearchBar";

const root = document.createElement("div");
root.id = "ext-file-explorer-root";
document.body.appendChild(root);

// --------------------------------------------------
// CACHÉ DE ARCHIVOS
// --------------------------------------------------

let cachedFiles: FileItem[] = [];

const MEDIA_REGEX =
  /\.(jpe?g|png|webp|avif|jfif|gif|mp4|webm|ogg)$/i;

const scanFiles = (): FileItem[] => {
  const links = Array.from(
    document.querySelectorAll(
      "#tbody tr:not([style*='display: none']) a"
    )
  );

  return links
    .filter((link) => {
      const href = (link as HTMLAnchorElement).href;
      return MEDIA_REGEX.test(href);
    })
    .map((link) => {
      const href = (link as HTMLAnchorElement).href;

      return {
        src: href,
        name: (link as HTMLElement).innerText.trim(),
        type: /\.(mp4|webm|ogg)$/i.test(href) ? "vid" : "img",
      };
    });
};

const updateCachedFiles = () => {
  cachedFiles = scanFiles();

  window.dispatchEvent(
    new CustomEvent("files-updated", {
      detail: {
        files: cachedFiles,
      },
    })
  );
};

// --------------------------------------------------
// SEARCH BAR
// --------------------------------------------------

const setupSearch = () => {
  const header = document.getElementById("header");

  if (!header) return;

  const searchRoot = document.createElement("div");
  searchRoot.id = "search-bar-root";

  header.insertAdjacentElement("afterend", searchRoot);

  render(<SearchBar />, searchRoot);
};

// --------------------------------------------------
// INICIALIZACIÓN
// --------------------------------------------------

updateCachedFiles();
setupSearch();

// Siempre montamos App.
// Aunque no haya archivos inicialmente.
render(<App files={cachedFiles} />, root);

// --------------------------------------------------
// CAMBIOS PRODUCIDOS POR EL BUSCADOR
// --------------------------------------------------

window.addEventListener("filter-changed", () => {
  updateCachedFiles();
});

// --------------------------------------------------
// DETECTAR ORDENAMIENTOS DEL EXPLORADOR DE CHROME
// --------------------------------------------------

const tbody = document.getElementById("tbody");

if (tbody) {
  let updateScheduled = false;

  const observer = new MutationObserver(() => {
    // Evitamos ejecutar scanFiles varias veces
    // si Chrome hace varias mutaciones seguidas.
    if (updateScheduled) return;

    updateScheduled = true;

    requestAnimationFrame(() => {
      updateScheduled = false;
      updateCachedFiles();
    });
  });

  observer.observe(tbody, {
    childList: true,
    subtree: true,
  });
}

// --------------------------------------------------
// ABRIR ARCHIVOS EN EL EXPLORADOR
// --------------------------------------------------

document.addEventListener("click", (e) => {
  const target = e.target;

  if (!(target instanceof HTMLElement)) return;

  const anchor = target.closest("a");

  if (!anchor || !anchor.href) return;

  const url = anchor.href;

  if (!MEDIA_REGEX.test(url)) return;

  const fileIndex = cachedFiles.findIndex(
    (file) => file.src === url
  );

  if (fileIndex === -1) return;

  e.preventDefault();

  window.dispatchEvent(
    new CustomEvent("open-explorer", {
      detail: {
        index: fileIndex,
        newFiles: cachedFiles,
      },
    })
  );
});