const table = document.getElementById("tbody");
// Crear el contenido del modal
const createModalContent = () => {
  const myModal = document.createElement('div');
  myModal.id = "myModal";
  myModal.classList.add("modal");

  const manageModal = document.createElement('div');
  manageModal.classList.add("manage-modal");

  const beforeBtn = document.createElement('span');
  beforeBtn.classList.add("before-btn");
  beforeBtn.id = "before-btn";
  beforeBtn.textContent = "&LT;";
  const afterBtn = document.createElement('span');
  afterBtn.classList.add("after-btn");
  afterBtn.id = "after-btn";
  afterBtn.textContent = "&GT;";
  const closeBtn = document.createElement('span');
  closeBtn.classList.add("close");
  closeBtn.id = "closeModal";
  closeBtn.textContent = "&times;";

  manageModal.appendChild(beforeBtn);
  manageModal.appendChild(afterBtn);
  manageModal.appendChild(closeBtn);
  myModal.appendChild(manageModal);

  const modalImage = document.createElement('img');
  modalImage.classList.add("modal-content");
  modalImage.id = "modalImage";

  myModal.appendChild(modalImage);

  return myModal;
}


const modalHTML = createModalContent();
// const modalHTML = `
// `
//   <!-- Modal para la imagen en tamaño completo -->
//   <div id="myModal" class="modal">
//     <div class="manage-modal">
//       <span class="before-btn" id="presentation-pause">&CircleDot;</span>	
//       <span class="before-btn" id="presentation-start">&ac;</span>
//       <span class="before-btn" id="before-btn">&LT;</span>
//       <span class="after-btn" id="after-btn">&GT;</span>
//       <span class="close" id="closeModal">&times;</span>
//     </div>
//     <img class="modal-content" id="modalImage" />
//   </div>
// `;

// Agregar el contenido antes de que termine el body
document.body.insertAdjacentHTML('beforeend', modalHTML);

// const myModal = new ModalManager(document.getElementById('myModal'), document.getElementById('modalImage'));
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