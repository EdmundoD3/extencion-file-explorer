import { useEffect, useState, useCallback } from "preact/hooks";
import { useExplorer } from "./hooks/useExplorer";
import { ControlsCluster } from "./components/ControlsCluster";
import type { FileItem } from "./types/fileTypes";

export const App = ({ files }: { files: FileItem[] }) => {
  const [showModal, setShowModal] = useState(false);

  // Definimos la función de cerrar con useCallback para que sea estable
  const handleClose = useCallback(() => setShowModal(false), []);

  const explorer = useExplorer(files, handleClose);

  useEffect(() => {
    const handleOpen = (e: any) => {
      const { index: newIndex } = e.detail;
      
      // Accedemos a setIndex directamente desde el objeto actual del hook
      explorer.setIndex(newIndex); 
      setShowModal(true);
    };

    window.addEventListener("open-explorer", handleOpen);
    
    // Limpieza: quitamos el evento cuando el componente se desmonte
    return () => window.removeEventListener("open-explorer", handleOpen);
  }, [explorer.setIndex]); // Solo dependemos de setIndex, que es estable

  // Si el modal está cerrado, no renderizamos el árbol del DOM (ahorra RAM)
  if (!showModal || !explorer.current) return null;

  return (
    <div className="modal-full">
      <div className="close-btn" onClick={handleClose}>×</div>
      
      <div className="viewer-container">
        {explorer.current.type === "img" ? (
          <img 
            src={explorer.current.src} 
            className="media-content" 
            alt={explorer.current.name} 
          />
        ) : (
          <video 
            src={explorer.current.src} 
            className="media-content" 
            autoPlay 
            controls 
            onEnded={() => explorer.isActive && explorer.next()}
          />
        )}
      </div>

      <ControlsCluster {...explorer} total={files.length} />
    </div>
  );
};