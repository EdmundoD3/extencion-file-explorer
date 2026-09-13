import {
  useEffect,
  useMemo,
  useState,
} from "preact/hooks";

import { useExplorer } from "./hooks/useExplorer";
import { ControlsCluster } from "./components/ControlsCluster";
import type { FileItem } from "./types/fileTypes";
import { Viewer } from "./components/viewers";

interface AppProps {
  files: FileItem[];
}

export const App = ({
  files: initialFiles,
}: AppProps) => {
  const [showModal, setShowModal] = useState(false);
  const [currentFiles, setCurrentFiles] =
    useState(initialFiles);

  const [searchTerm, setSearchTerm] =
    useState("");

  // --------------------------------------------------
  // FILTRADO
  // --------------------------------------------------

  const filteredFiles = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return currentFiles.filter((file) => {
      const matchesName = file.name
        .toLowerCase()
        .includes(term);

      const matchesType = file.type
        .toLowerCase()
        .includes(term);

      const matchesExt = file.src
        .toLowerCase()
        .includes(term);

      return (
        matchesName ||
        matchesType ||
        matchesExt
      );
    });
  }, [currentFiles, searchTerm]);

  // --------------------------------------------------
  // EXPLORER
  // --------------------------------------------------

  const explorer = useExplorer(
    filteredFiles,
    () => setShowModal(false)
  );

  // --------------------------------------------------
  // RECIBIR CAMBIOS DE ARCHIVOS
  // --------------------------------------------------

  useEffect(() => {
    const handleFilesUpdated = (e: Event) => {
      const event =
        e as CustomEvent<{
          files: FileItem[];
        }>;

      if (!event.detail?.files) return;

      setCurrentFiles(event.detail.files);
    };

    window.addEventListener(
      "files-updated",
      handleFilesUpdated
    );

    return () => {
      window.removeEventListener(
        "files-updated",
        handleFilesUpdated
      );
    };
  }, []);

  // --------------------------------------------------
  // ABRIR EXPLORADOR
  // --------------------------------------------------

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const event =
        e as CustomEvent<{
          index: number;
          newFiles?: FileItem[];
        }>;

      const {
        index,
        newFiles,
      } = event.detail;

      if (newFiles) {
        setCurrentFiles(newFiles);
      }

      setSearchTerm("");

      setTimeout(() => {
        explorer.setIndex(index);
        setShowModal(true);
      }, 0);
    };

    window.addEventListener(
      "open-explorer",
      handleOpen
    );

    return () => {
      window.removeEventListener(
        "open-explorer",
        handleOpen
      );
    };
  }, [explorer.setIndex]);

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  if (
    !showModal ||
    !explorer.current
  ) {
    return null;
  }

  return (
    <div className="modal-full">
      <div
        className="close-btn"
        onClick={() =>
          setShowModal(false)
        }
      >
        ×
      </div>

      <Viewer
        item={explorer.current}
        onVideoEnd={explorer.next}
        timePerItem={
          explorer.timePerItem
        }
        isActive={explorer.isActive}
      />

      <ControlsCluster
        {...explorer}
        total={filteredFiles.length}
      />
    </div>
  );
};
