import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "preact/hooks";

import type { FileItem } from "../types/fileTypes";

export const useExplorer = (
  items: FileItem[],
  onClose: () => void
) => {
  const [index, setIndexState] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timePerItem, setTimePerItem] = useState(5000);
  const nextRef = useRef<() => void>(() => {});
  

  // --------------------------------------------------
  // ARCHIVO ACTUAL
  // --------------------------------------------------

  const currentSrcRef = useRef<string | null>(null);

  // --------------------------------------------------
  // TIMER
  // --------------------------------------------------

  const startTimeRef = useRef<number>(0);
  const requestRef = useRef<number | undefined>(undefined);

  // --------------------------------------------------
  // CAMBIAR ÍNDICE MANUALMENTE
  // --------------------------------------------------

  const setIndex = useCallback(
    (newIndex: number) => {
      if (items.length === 0) {
        setIndexState(0);
        currentSrcRef.current = null;
        setProgress(0);
        return;
      }

      const safeIndex = Math.max(
        0,
        Math.min(newIndex, items.length - 1)
      );

      setIndexState(safeIndex);

      currentSrcRef.current =
        items[safeIndex]?.src ?? null;

      setProgress(0);
    },
    [items]
  );

  // --------------------------------------------------
  // SIGUIENTE
  // --------------------------------------------------

  const next = useCallback(() => {
    if (items.length === 0) return;

    setIndexState((currentIndex) => {
      const nextIndex =
        (currentIndex + 1) % items.length;

      currentSrcRef.current =
        items[nextIndex]?.src ?? null;

      return nextIndex;
    });

    setProgress(0);
  }, [items]);

  // --------------------------------------------------
  // ANTERIOR
  // --------------------------------------------------

  const prev = useCallback(() => {
    if (items.length === 0) return;

    setIndexState((currentIndex) => {
      const prevIndex =
        (currentIndex - 1 + items.length) %
        items.length;

      currentSrcRef.current =
        items[prevIndex]?.src ?? null;

      return prevIndex;
    });

    setProgress(0);
  }, [items]);

  // --------------------------------------------------
  // MANTENER EL ARCHIVO ACTUAL CUANDO CAMBIA EL ORDEN
  // --------------------------------------------------

  useEffect(() => {
    if (items.length === 0) {
      setIndexState(0);
      currentSrcRef.current = null;
      setProgress(0);
      return;
    }

    // Primera inicialización
    if (!currentSrcRef.current) {
      const initialItem = items[index];

      if (initialItem) {
        currentSrcRef.current = initialItem.src;
      }

      return;
    }

    // Buscar el archivo que estábamos viendo
    // dentro del nuevo orden.
    const newIndex = items.findIndex(
      (item) => item.src === currentSrcRef.current
    );

    if (newIndex !== -1) {
      // El archivo sigue existiendo.
      // Actualizamos únicamente su índice.
      setIndexState(newIndex);
    } else {
      // El archivo desapareció del filtro.
      currentSrcRef.current =
        items[0]?.src ?? null;

      setIndexState(0);
      setProgress(0);
    }
  }, [items]);

  // --------------------------------------------------
  // ATAJOS DE TECLADO
  // --------------------------------------------------

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) {
        return;
      }

      switch (e.key) {
        case "ArrowRight":
          next();
          break;

        case "ArrowLeft":
          prev();
          break;

        case " ":
          e.preventDefault();
          setIsActive((active) => !active);
          break;

        case "Escape":
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [next, prev, onClose]);

  // --------------------------------------------------
  // ANIMACIÓN DEL PROGRESO
  // --------------------------------------------------

const animate = useCallback(() => {
  const now = Date.now();

  const elapsed =
    now - startTimeRef.current;

  const newProgress = Math.min(
    (elapsed / timePerItem) * 100,
    100
  );

  setProgress(newProgress);

  if (newProgress < 100) {
    requestRef.current =
      requestAnimationFrame(animate);
  } else {
    nextRef.current();
  }
}, [timePerItem]);

  // --------------------------------------------------
  // INICIAR / DETENER PRESENTACIÓN
  // --------------------------------------------------

useEffect(() => {
  cancelAnimationFrame(
    requestRef.current ?? 0
  );

  requestRef.current = undefined;

  const current = items[index];

  if (
    isActive &&
    current?.type === "img"
  ) {
    startTimeRef.current = Date.now();

    requestRef.current =
      requestAnimationFrame(animate);
  } else {
    setProgress(0);
  }

  return () => {
    cancelAnimationFrame(
      requestRef.current ?? 0
    );

    requestRef.current = undefined;
  };
}, [
  index,
  isActive,
  timePerItem,
  animate,
]);

  // --------------------------------------------------
  // PROTEGER ÍNDICE
  // --------------------------------------------------

  useEffect(() => {
    if (items.length === 0) {
      setIndexState(0);
      currentSrcRef.current = null;
      return;
    }

    if (index >= items.length) {
      const safeIndex = items.length - 1;

      setIndexState(safeIndex);

      currentSrcRef.current =
        items[safeIndex]?.src ?? null;

      setProgress(0);
    }
  }, [items.length, index]);
  useEffect(() => {
  nextRef.current = next;
}, [next]);

  // --------------------------------------------------
  // RESULTADO
  // --------------------------------------------------

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
    prev,
  };
};
