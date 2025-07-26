const table = document.getElementById("tbody");

const myModal = new ModalManager(document.getElementById('myModal'), document.getElementById('modalImage'));
const myImages = new ImageManagger(myModal);
// Recorrer todas las filas de la tabla
Array.from(table.rows).forEach((row, index) => {
  const firstCell = row.cells[0]; // cells[0] accede al primer <td>

  const link = firstCell.querySelector("a");

  // Si hay un <a>, proceder
  if (link) {
    // Obtener la URL del archivo
    const fileUrl = link.getAttribute("href");
    // Obtener la extensión del archivo
    const extension = fileUrl.split(".").pop().toLowerCase();

    // Crear un nuevo elemento dependiendo de la extensión
    let newElement;

    if (["jpg", "jpeg", "png", "gif","web","webp"].includes(extension)) {

      const index = myImages.addSrcAndGetIndex(`${link.href}`);

      link.href = "#";
      link.addEventListener("click", (e) => {
          e.preventDefault();
          myImages.openModal(index);
      });
    }

  }
})

// Configuración de eventos para los controles del modal
document.getElementById("before-btn").addEventListener("click", (e) => {
  e.preventDefault();
  myImages.previous();
});

document.getElementById("after-btn").addEventListener("click", (e) => {
  e.preventDefault();
  myImages.next();
});

document.getElementById("closeModal").addEventListener("click", (e) => {
  e.preventDefault();
  myImages.endPresentation();
  myModal.close();
});
document.getElementById("presentation-start").addEventListener("click",(e)=>{
  e.preventDefault();
  myImages.startPresentation();
})
document.getElementById("presentation-pause").addEventListener("click",e=>{
  e.preventDefault();
  myImages.endPresentation();
})