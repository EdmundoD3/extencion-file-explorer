// src/components/SearchCluster.tsx
export const SearchCluster = ({ 
  searchTerm, 
  setSearchTerm 
}: { 
  searchTerm: string; 
  setSearchTerm: (s: string) => void 
}) => {
  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Filtrar por nombre o extensión (ej: .png, vid...)"
        value={searchTerm}
        onInput={(e) => setSearchTerm(e.currentTarget.value)}
        className="search-input"
      />
      {searchTerm && (
        <button onClick={() => setSearchTerm("")} className="clear-search">×</button>
      )}
    </div>
  );
};