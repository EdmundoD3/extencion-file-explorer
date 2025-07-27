class ImageManagger {
  _currentIndex = 0;
  _timePresentation = 5000;
  _maxTime = 5 * 60 * 1000
  _minTime = 900
  modePresentation = false; 
  presentationStartTime = 0;
  presentationAnimationId = null;
  /** @type {ModalManager} */
  modal;
  /** @type {string[]} */
  imageList;

  /**
   * @param {ModalManager} modal
   */
  constructor(modal) {
    this.imageList = []
    this.modal = modal 
  }
  /**
   * @param {string} newSrc
   */
  set addSrc(newSrc) {
    this.imageList.push(newSrc)
  }
  /**
   * @param {number} index
   */
  set currentIndex(index) {
    if (index >= this.imageList.length || index < 0) return
    this._currentIndex = index
  }

  get currentIndex() {
    return this._currentIndex
  }
  get currentImageSrc() {
    return this.imageList[this.currentIndex]
  }
  /**
   * @param {number} newtime
   */
  set timePresentation(newtime) {
    if (newtime > this._maxTime) return this._timePresentation = this._maxTime;
    if (newtime < this._minTime) return this._timePresentation = this._minTime;
    this._timePresentation = newtime
  }
  get timePresentation() {
    return this._timePresentation
  }
  changeImage() {
    this.modal.changeImage(this.currentImageSrc)
  }
  getSrc(index) {
    this.currentIndex = index
    return this.currentImageSrc
  }
  addSrcAndGetIndex(src) {
    const index = this.imageList.length
    this.addSrc = src
    return index
  }
  next() {
    const newIndex = (this.currentIndex + 1) % this.imageList.length;
    this.currentIndex = newIndex;
    this.changeImage();
    // Si estamos en modo presentación, reiniciamos el temporizador.
    if (this.modePresentation) {
      this.presentation();
    }
  }
  previous() {
    const newIndex = (this.currentIndex - 1 + this.imageList.length) % this.imageList.length;
    this.currentIndex = newIndex;
    this.changeImage();
    // Si estamos en modo presentación, reiniciamos el temporizador.
    if (this.modePresentation) {
      this.presentation();
    }
  }
  presentation() {
    clearTimeout(this.presentationTimeout);
    cancelAnimationFrame(this.presentationAnimationId); // Detiene la animación anterior

    this.presentationTimeout = setTimeout(() => {
      this.next();
      if (this.modePresentation) this.presentation();
    }, this.timePresentation);

    this.presentationStartTime = Date.now();
    this.startTimerAnimation();
  }
  startPresentation() {
    this.modal.openImage(this.currentImageSrc)
    this.modePresentation = true
    this.modal.updateTimerDisplay(true); // Muestra el contenedor del timer
    this.presentation()
  }
  openModal(index) {
    this.modal.openImage(this.imageList[index])
    this.currentIndex = index
    this.modePresentation = false
  }
  closeModal() {
    this.endPresentation()
    this.modal.close()
  }
  endPresentation() {
    this.modePresentation = false
    this.modal.updateTimerDisplay(false); // Oculta el timer
    clearTimeout(this.presentationTimeout);
    cancelAnimationFrame(this.presentationAnimationId);
  }
  startTimerAnimation() {
    const update = () => {
      if (!this.modePresentation) return;

      const elapsedTime = Date.now() - this.presentationStartTime;
      const remainingTime = this.timePresentation - elapsedTime;

      if (remainingTime > 0) {
        // Actualiza el texto del timer en el modal
        const secondsLeft = (remainingTime / 1000).toFixed(0);
        this.modal.updateTimerDisplay(secondsLeft);
        // Solicita el siguiente frame
        this.presentationAnimationId = requestAnimationFrame(update);
      } else {
        // El tiempo terminó, oculta el display
        this.modal.updateTimerDisplay(false);
      }
    };
    this.presentationAnimationId = requestAnimationFrame(update);
  }
}

class ModalManager {
  _isOpened = false;
  /** @type {HTMLElement} */
  modal;
  /** @type {HTMLImageElement} */
  modalImage;
  /** @type {HTMLElement} */
  modalImageParent;
  /** @type {HTMLElement} */
  presentationTimer;

  /**
   * @param {HTMLElement} modal The modal container element.
   * @param {HTMLImageElement} modalImage The image element inside the modal.
   */
  constructor(modal, modalImage) {
    this.modal = modal
    this.modalImage = modalImage
    this.modalImageParent = modalImage.parentElement; // Guardamos el contenedor de la imagen
    this.presentationTimer = document.querySelector('.presentation-timer');
  }
  /**
   * @param {boolean} newIsOpened
   */
  set isOpened(newIsOpened) {
    if (typeof newIsOpened !== "boolean") return;
    this._isOpened = newIsOpened;
  }
  get isOpened() {
    return this._isOpened;
  }
  /**
   * @param {string} src
   */
  set setImage(src) {
    if (this.modalImage) {
      // Primero, reseteamos los estilos para que la imagen se cargue con sus dimensiones intrínsecas
      this.modalImage.style.width = 'auto';
      this.modalImage.style.height = 'auto';
      this.modalImage.src = src;

      // Usamos el evento 'onload' para asegurarnos de que la imagen se haya cargado
      // y tengamos acceso a sus dimensiones reales (naturalWidth/naturalHeight).
      this.modalImage.onload = () => {
        // Comparamos la relación de aspecto de la imagen con la del contenedor del modal.
        const imageAspectRatio = this.modalImage.naturalWidth / this.modalImage.naturalHeight;
        const modalAspectRatio = this.modal.clientWidth / this.modal.clientHeight;

        // Si la imagen es proporcionalmente más ancha que el modal
        if (imageAspectRatio > modalAspectRatio) {
          // Hacemos que ocupe todo el ancho y la altura se ajuste automáticamente.
          this.modalImage.style.width = '100%';
          this.modalImage.style.height = 'auto';
        } else {
          // Si la imagen es más alta o tiene la misma proporción, ajustamos la altura.
          this.modalImage.style.height = '100%';
          this.modalImage.style.width = 'auto';
        }
      };
    }
  }
  open() {
    this.isOpened = true
    this.modal.style.display = 'flex';  // Muestra el modal
  }
  openImage(src) {
    this.setImage = src
    this.open()
  }
  close() {
    this.isOpened = false
    this.modal.style.display = 'none'
    // Limpiamos el 'src' para resetear el estado de la imagen y evitar problemas de renderizado.
    this.modalImage.src = ''
  }
  /**
   * @param {string | boolean} text
   */
  updateTimerDisplay(text) {
    if (!this.presentationTimer) return;

    if (text === false) {
      this.presentationTimer.style.display = 'none';
    } else {
      this.presentationTimer.style.display = 'block';
      // Solo actualizamos el texto si es un string (un número)
      if (typeof text === 'string') this.presentationTimer.textContent = text;
    }
  }
  changeImage(src) {
    this.setImage = src
  }
}
