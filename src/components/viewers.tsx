import type { FileItem } from "../types/fileTypes";

interface Props {
  item: FileItem;
  onVideoEnd: () => void;
}

export const Viewer = ({ item, onVideoEnd }: Props) => {
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
          src={item.src} 
          className="media-content"
          controls 
          autoPlay 
          onEnded={onVideoEnd}
        />
      )}
    </div>
  );
};