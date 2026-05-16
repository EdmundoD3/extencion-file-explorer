import { useEffect, useState } from "preact/hooks";
import { useExplorer } from "./hooks/useExplorer";
import { ControlsCluster } from "./components/ControlsCluster";
import type { FileItem } from "./types/fileTypes";
import { Viewer } from "./components/viewers";

export const App = ({ files: initialFiles }: { files: FileItem[] }) => {
  const [showModal, setShowModal] = useState(false);
  const [currentFiles, setCurrentFiles] = useState(initialFiles);
  const [searchTerm, setSearchTerm] = useState("");

  // --- LÓGICA DE FILTRADO ---
  const filteredFiles = currentFiles.filter((file) => {
    const term = searchTerm.toLowerCase();
    const matchesName = file.name.toLowerCase().includes(term);
    const matchesType = file.type.toLowerCase().includes(term); // "vid" o "img"
    const matchesExt = file.src.toLowerCase().includes(term);
    
    return matchesName || matchesType || matchesExt;
  });

  // Importante: useExplorer ahora usa filteredFiles
  const explorer = useExplorer(filteredFiles, () => setShowModal(false));

  useEffect(() => {
    const handleOpen = (e: any) => {
      const { index, newFiles } = e.detail;
      if (newFiles) setCurrentFiles(newFiles);
      
      // Al abrir, reseteamos el buscador para ver el archivo que clickeamos
      setSearchTerm(""); 
      
      setTimeout(() => {
        // Buscamos el índice correcto en la lista completa (sin filtrar aún)
        explorer.setIndex(index);
        setShowModal(true);
      }, 0);
    };

    window.addEventListener("open-explorer", handleOpen);
    return () => window.removeEventListener("open-explorer", handleOpen);
  }, [explorer.setIndex]);

  // Agregamos el check de explorer.current aquí para proteger el renderizado
  if (!showModal || !explorer.current) return null;

return (
  <div className="modal-full">
    <div className="close-btn" onClick={() => setShowModal(false)}>×</div>

    <Viewer 
      item={explorer.current} 
      onVideoEnd={explorer.next} // Ya no hace falta el "explorer.isActive &&" aquí porque lo maneja el Viewer por dentro
      timePerItem={explorer.timePerItem}
      isActive={explorer.isActive}
    />

    <ControlsCluster {...explorer} total={filteredFiles.length} />
  </div>
);}