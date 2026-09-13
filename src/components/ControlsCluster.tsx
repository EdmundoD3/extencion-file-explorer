import type { FileItem } from "../types/fileTypes";
import "../styles/controlCluster.css";

interface ControlsProps {
  current: FileItem;
  index: number;
  total: number;
  isActive: boolean;
  setIsActive: (
    value: boolean | ((value: boolean) => boolean)
  ) => void;
  progress: number;
  timePerItem: number;
  setTimePerItem: (ms: number) => void;
  next: () => void;
  prev: () => void;
}

export const ControlsCluster = ({
  current,
  index,
  total,
  isActive,
  setIsActive,
  progress,
  timePerItem,
  setTimePerItem,
  next,
  prev,
}: ControlsProps) => {
  const secondsLeft = Math.max(
    0,
    Math.ceil(
      (timePerItem -
        (progress * timePerItem) / 100) /
        1000
    )
  );

  return (
    <div className="controls-cluster">
      <div className="file-info">
        {current.name}
      </div>

      <div className="btn-row">
        <button
          className="control-btn"
          onClick={prev}
        >
          ⏮
        </button>

        <button
          className="control-btn"
          onClick={() =>
            setIsActive(
              (active) => !active
            )
          }
          style={{
            position: "relative",
          }}
        >
          {isActive ? "⏸" : "▶"}

          {isActive &&
            current.type === "img" && (
              <span className="presentation-timer-badge">
                {secondsLeft}s
              </span>
            )}
        </button>

        <button
          className="control-btn"
          onClick={next}
        >
          ⏭
        </button>

        <div className="time-input-group">
          <input
            type="number"
            min="1"
            value={timePerItem / 1000}
            onChange={(e) => {
              const seconds = Number(
                e.currentTarget.value
              );

              if (
                Number.isFinite(seconds) &&
                seconds > 0
              ) {
                setTimePerItem(
                  seconds * 1000
                );
              }
            }}
          />

          <span
            style={{
              color: "white",
              fontSize: "12px",
            }}
          >
            s
          </span>
        </div>
      </div>

      <div className="counter-text">
        {index + 1} / {total}
      </div>
    </div>
  );
};
