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
        type: /\.(mp4|webm|ogg)$/i.test(href)
          ? "vid"
          : "img",
      };
    });
};

// --------------------------------------------------
// COMPARAR LISTAS
// --------------------------------------------------

const areFilesEqual = (
  a: FileItem[],
  b: FileItem[]
): boolean => {
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i++) {
    if (
      a[i].src !== b[i].src ||
      a[i].name !== b[i].name ||
      a[i].type !== b[i].type
    ) {
      return false;
    }
  }

  return true;
};

// --------------------------------------------------
// ACTUALIZAR CACHÉ
// --------------------------------------------------

const updateCachedFiles = () => {
  const newFiles = scanFiles();

  // No hacemos absolutamente nada si la lista
  // no cambió realmente.
  if (areFilesEqual(cachedFiles, newFiles)) {
    return;
  }

  cachedFiles = newFiles;

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

  header.insertAdjacentElement(
    "afterend",
    searchRoot
  );

  render(<SearchBar />, searchRoot);
};

// --------------------------------------------------
// INICIALIZACIÓN
// --------------------------------------------------

updateCachedFiles();
setupSearch();

render(<App files={cachedFiles} />, root);

// --------------------------------------------------
// CAMBIOS DEL BUSCADOR
// --------------------------------------------------

window.addEventListener("filter-changed", () => {
  updateCachedFiles();
});

// --------------------------------------------------
// DETECTAR ORDENAMIENTOS
// --------------------------------------------------

const tbody = document.getElementById("tbody");

if (tbody) {
  let updateScheduled = false;

  const observer = new MutationObserver(() => {
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
// ABRIR ARCHIVOS
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
