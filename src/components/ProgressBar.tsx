export const ProgressBar = ({ progress }: { progress: number }) => (
  <div style={{ width: '100%', height: '4px', background: '#333' }}>
    <div 
      style={{ 
        width: `${progress}%`, 
        height: '100%', 
        background: '#007bff', 
        transition: 'width 0.1s linear' 
      }} 
    />
  </div>
);