// IIFE (Immediately Invoked Function Expression) para encapsular el código y no contaminar el scope global.
(function () {
  // --- Constantes y Configuración ---
  const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp"];
  const MODAL_HTML = `
    <div id="myModal" class="modal">
      <div class="manage-modal">
        <!-- Cluster de controles en la esquina -->
        <div class="controls-cluster controls-hidden">
          <span class="control-btn" id="toggle-controls-btn" title="Mostrar/Ocultar Controles">&#9881;</span>
          <span class="main-controls">
            <span class="time-control">
              <input type="number" id="presentation-time" min="1" max="300" value="5">
              <label for="presentation-time">s</label>
            </span>
          </span>
          <span class="control-btn" id="presentation-start" title="Iniciar Presentación">&rtrif;</span>
          <span class="control-btn" id="presentation-pause" title="Pausar Presentación">&CircleDot;</span>
          <span class="control-btn" id="before-btn" title="Imagen Anterior">&LT;</span>
          <span class="control-btn" id="after-btn" title="Imagen Siguiente">
            &GT;
            <span class="presentation-timer"></span>
          </span>
        </div>
        <!-- Botón de cerrar independiente -->
        <span class="control-btn close" id="closeModal" title="Cerrar">&times;</span>
      </div>
      <img class="modal-content" id="modalImage" />
    </div>
  `;

  /**
   * Inyecta el HTML del modal en el body de la página.
   */
  function injectModal() {
    document.body.insertAdjacentHTML('beforeend', MODAL_HTML);
  }

  /**
   * Función principal que inicializa toda la lógica.
   */
  function initialize() {
    injectModal();

    // --- Búsqueda de Elementos del DOM ---
    const table = document.getElementById("tbody");
    if (!table) {
      console.error("File Explorer Extension: No se pudo encontrar la tabla con id 'tbody'.");
      return;
    }

    const modalElement = document.getElementById('myModal');
    const modalImageElement = document.getElementById('modalImage');
    const timeInput = document.getElementById('presentation-time');


    if (!modalElement || !modalImageElement) {
      console.error("File Explorer Extension: No se pudieron encontrar los elementos del modal tras la inyección.");
      return;
    }

    // --- Instanciación de Clases ---
    const modalManager = new ModalManager(modalElement, modalImageElement);
    const imageManagger = new ImageManagger(modalManager);

    timeInput.value = imageManagger.timePresentation / 1000;

    // --- Lógica Principal: Procesar la tabla ---
    Array.from(table.rows).forEach((row) => {
      const link = row.querySelector("td:first-child a");

      if (link) {
        const fileUrl = link.getAttribute("href");
        const extension = fileUrl.split(".").pop().toLowerCase();

        if (IMAGE_EXTENSIONS.includes(extension)) {
          const index = imageManagger.addSrcAndGetIndex(link.href);
          link.href = "#";
          link.addEventListener("click", (e) => {
            e.preventDefault();
            imageManagger.openModal(index);
          });
        }
      }
    });
    timeInput.addEventListener('input', (event) => {
      // Obtenemos el valor en segundos
      const seconds = parseFloat(event.target.value);

      // Validamos que sea un número válido
      if (!isNaN(seconds) && seconds > 0) {
        // Actualizamos el tiempo en el manager (multiplicamos por 1000 para pasarlo a ms)
        imageManagger.timePresentation = seconds * 1000;

        // ¡Mejora! Si la presentación está activa, reinicia el temporizador con el nuevo valor.
        if (imageManagger.modePresentation) {
          imageManagger.presentation();
        }
      }
    });

    // --- Configuración de Eventos ---
    document.getElementById("before-btn").addEventListener("click", () => imageManagger.previous());
    document.getElementById("after-btn").addEventListener("click", () => imageManagger.next());
    document.getElementById("closeModal").addEventListener("click", () => imageManagger.closeModal());
    document.getElementById("presentation-start").addEventListener("click", () => imageManagger.startPresentation());
    document.getElementById("presentation-pause").addEventListener("click", () => imageManagger.endPresentation());

    // Evento para el nuevo botón de mostrar/ocultar controles
    const controlsCluster = document.querySelector('.controls-cluster');
    document.getElementById("toggle-controls-btn").addEventListener("click", () => controlsCluster.classList.toggle('controls-hidden'));

    // Navegación con teclado
    document.addEventListener('keydown', (e) => {
      if (!modalManager.isOpened) return;

      if (e.key === 'ArrowRight') imageManagger.next();
      if (e.key === 'ArrowLeft') imageManagger.previous();
      if (e.key === 'Escape') imageManagger.closeModal();
    });
  }

  // Ejecutar el script cuando el DOM esté listo.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();