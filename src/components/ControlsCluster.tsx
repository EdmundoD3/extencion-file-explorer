import type { FileItem } from "../types/fileTypes";
import "../styles/controlCluster.css";

interface ControlsProps {
  current: FileItem;
  index: number;
  total: number;
  isActive: boolean;
  setIsActive: (val: boolean) => void;
  progress: number;
  timePerItem: number;
  setTimePerItem: (ms: number) => void;
  next: () => void;
  prev: () => void;
}

export const ControlsCluster = ({
  current, index, total, isActive, setIsActive, 
  progress, timePerItem, setTimePerItem, next, prev 
}: ControlsProps) => {
  
  // Cálculo de segundos restantes para el badge
  const secondsLeft = Math.ceil((timePerItem - (progress * timePerItem) / 100) / 1000);

  return (
    <div className="controls-cluster">
      <div className="file-info">{current.name}</div>

      <div className="btn-row">
        <button className="control-btn" onClick={prev}>⏮</button>

        <button
          className="control-btn"
          onClick={() => setIsActive(!isActive)}
          style={{ position: "relative" }}
        >
          {isActive ? "⏸" : "▶"}
          {isActive && current.type === "img" && (
            <span className="presentation-timer-badge">
              {secondsLeft}s
            </span>
          )}
        </button>

        <button className="control-btn" onClick={next}>⏭</button>

        <div className="time-input-group">
          <input
            type="number"
            min="1"
            value={timePerItem / 1000}
            onChange={(e) => setTimePerItem(Number(e.currentTarget.value) * 1000)}
          />
          <span style={{ color: "white", fontSize: "12px" }}>s</span>
        </div>
      </div>

      <div className="counter-text">
        {index + 1} / {total}
      </div>
    </div>
  );
};