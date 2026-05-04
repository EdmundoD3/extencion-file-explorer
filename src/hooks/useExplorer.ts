import { useState, useEffect, useRef } from 'preact/hooks';
import type { FileItem } from '../types/fileTypes';

export const useExplorer = (items: FileItem[], onClose: () => void) => {
  const [index, setIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timePerItem, setTimePerItem] = useState(5000);
  
  const startTimeRef = useRef<number>(0);
  const requestRef = useRef<number>();

  const next = () => {
    setIndex((i) => (i + 1) % items.length);
    setProgress(0);
  };

  const prev = () => {
    setIndex((i) => (i - 1 + items.length) % items.length);
    setProgress(0);
  };

  // Lógica de Atajos de Teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Evitamos que los atajos activen funciones si el usuario está escribiendo en el input de tiempo
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case 'ArrowRight':
          next();
          break;
        case 'ArrowLeft':
          prev();
          break;
        case ' ': // Espacio
          e.preventDefault(); // Evita el scroll de página
          setIsActive(!isActive);
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, index]); // Se actualiza si cambia el estado

  // Lógica de animación de progreso
  const animate = () => {
    const now = Date.now();
    const elapsed = now - startTimeRef.current;
    const newProgress = Math.min((elapsed / timePerItem) * 100, 100);

    setProgress(newProgress);

    if (newProgress < 100) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      next();
    }
  };

  useEffect(() => {
    const current = items[index];
    if (isActive && current?.type === 'img') {
      startTimeRef.current = Date.now();
      requestRef.current = requestAnimationFrame(animate);
    } 
    return () => cancelAnimationFrame(requestRef.current!);
  }, [index, isActive, timePerItem]);

  return {
    current: items[index],
    index,
    isActive,
    setIsActive,
    setIndex,
    progress,
    timePerItem,
    setTimePerItem,
    next,
    prev
  };
};