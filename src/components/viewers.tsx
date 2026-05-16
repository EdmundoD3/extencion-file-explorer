import { useState, useEffect, useRef } from "preact/hooks";
import type { FileItem } from "../types/fileTypes";

interface Props {
  item: FileItem;
  onVideoEnd: () => void;
  timePerItem: number; // Necesitamos saber cuántos milisegundos debe durar como mínimo
  isActive: boolean;   // Necesitamos saber si la reproducción automática está encendida
}

export const Viewer = ({ item, onVideoEnd, timePerItem, isActive }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [accumulatedTime, setAccumulatedTime] = useState(0);

  // Cada vez que el usuario cambie de archivo, reseteamos el tiempo acumulado
  useEffect(() => {
    setAccumulatedTime(0);
  }, [item.src]);

const handleVideoEnded = () => {
  if (!videoRef.current) return;

  // Si la presentación automática está desactivada (NO hay temporizador corriendo)
  if (!isActive) {
    // Modo bucle manual infinito: reiniciamos y reproducimos siempre
    videoRef.current.currentTime = 0;
    videoRef.current.play().catch(err => console.log("Error al repetir video:", err));
    return; // Nos salimos aquí, ignorando cualquier lógica de tiempos
  }

  // --- SI EL TEMPORIZADOR ESTÁ ACTIVO (isActive === true) ---
  const durationMs = videoRef.current.duration * 1000;
  const newAccumulatedTime = accumulatedTime + durationMs;
  setAccumulatedTime(newAccumulatedTime);

  // Comprobamos si ya se cumplió el tiempo mínimo configurado
  if (newAccumulatedTime >= timePerItem) {
    onVideoEnd(); // Pasa al siguiente archivo
  } else {
    // Loop temporal hasta alcanzar los segundos requeridos
    videoRef.current.currentTime = 0;
    videoRef.current.play().catch(err => console.log("Error al repetir video:", err));
  }
};

  return (
    <div className="viewer-container">
      <div className="file-info">
        <span title={item.name}>{item.name}</span>
      </div>

      {item.type === 'img' ? (
        <img 
          src={item.src} 
          className="media-content" 
          loading="eager"
        />
      ) : (
        <video 
          ref={videoRef}
          src={item.src} 
          className="media-content"
          controls
          autoPlay={true}
          onEnded={handleVideoEnded} // Usamos nuestra nueva función controladora
        />
      )}
    </div>
  );
};