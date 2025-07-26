function adjustTableGrid() {
  const table = document.getElementById("dynamic-table");
  const container = document.getElementById("table-container");
  
  // Calcular el número de columnas basado en el ancho del contenedor
  const columnWidth = 150; // Ancho mínimo deseado para cada columna
  const containerWidth = container.offsetWidth;
  const numColumns = Math.floor(containerWidth / columnWidth);

  // Ajustar el número de columnas en el grid
  table.style.gridTemplateColumns = `repeat(${numColumns}, 1fr)`;
}

// Ajustar el grid al cargar la página
// adjustTableGrid();

// Ajustar el grid al redimensionar la ventana
// window.addEventListener("resize", adjustTableGrid);
