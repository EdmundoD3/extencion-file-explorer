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
    this.modePresentation = true;
    this.modal.setPresentationMode(true); // Activa el modo visual de presentación
    this.presentation()
  }
  openModal(index) {
    this.modal.openImage(this.imageList[index])
    this.currentIndex = index
    this.modePresentation = false
    this.modal.setPresentationMode(false); // Asegura que el modo visual esté desactivado
  }
  closeModal() {
    this.endPresentation()
    this.modal.close()
  }
  endPresentation() {
    this.modePresentation = false;
    this.modal.setPresentationMode(false); // Desactiva el modo visual de presentación
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

class VideoManagger {
  _currentIndex = 0;
  _timePresentation = 5000; // Tiempo base de presentación en ms
  _maxTime = 5 * 60 * 1000
  _minTime = 900
  modePresentation = false;
  presentationTimeout = null;
  videoEndHandler = null; // Para guardar la referencia al listener 'ended'

  // Propiedades para el temporizador pausable
  _presentationTimeRemaining = 0;
  _presentationTimerStart = 0;
  _videoPauseHandler = () => this.pausePresentationTimer();
  _videoPlayHandler = () => this.resumePresentationTimer();

  /** @type {ModalManager} */
  modal;
  /** @type {string[]} */
  videoList = [];

  /**
   * @param {ModalManager} modal
   */
  constructor(modal) {
    this.modal = modal;
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

  addSrcAndGetIndex(src) {
    const index = this.videoList.length;
    this.videoList.push(src);
    return index;
  }

  get currentIndex() {
    return this._currentIndex;
  }
  /**
   * @param {number} index
   */
  set currentIndex(index) {
    if (index >= this.videoList.length || index < 0) return
    this._currentIndex = index
  }

  get currentVideoSrc() {
    return this.videoList[this.currentIndex];
  }

  changeVideo() {
    this.modal.changeVideo(this.currentVideoSrc);
  }

  openModal(index) {
    this.currentIndex = index;
    this.modal.openVideo(this.currentVideoSrc);
    this.modePresentation = false;
    this.modal.setPresentationMode(false);
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.videoList.length;
    this.changeVideo();
    if (this.modePresentation) {
      this.presentation();
    }
  }

  previous() {
    this.currentIndex = (this.currentIndex - 1 + this.videoList.length) % this.videoList.length;
    this.changeVideo();
    if (this.modePresentation) {
      this.presentation();
    }
  }

  startPresentation() {
    this.modal.openVideo(this.currentVideoSrc);
    this.modePresentation = true;
    this.modal.setPresentationMode(true);
    this.presentation();
  }

  endPresentation() {
    this.modePresentation = false;
    this.modal.setPresentationMode(false);
    clearTimeout(this.presentationTimeout);

    // Limpiamos todos los listeners para evitar fugas de memoria y comportamientos inesperados
    const video = this.modal.modalVideo;
    if (this.videoEndHandler) {
      video.removeEventListener('ended', this.videoEndHandler);
      this.videoEndHandler = null;
    }
    video.removeEventListener('pause', this._videoPauseHandler);
    video.removeEventListener('play', this._videoPlayHandler);
  }

  presentation() {
    this.endPresentation(); // Limpia cualquier estado anterior (timers, listeners)
    this.modePresentation = true; // Lo reactivamos
    this.modal.setPresentationMode(true);

    const video = this.modal.modalVideo;
    const presentationTimeMs = this.timePresentation;

    // Esperamos a que los metadatos del video (como la duración) estén cargados
    video.onloadedmetadata = () => {
      const videoDurationMs = video.duration * 1000;

      if (videoDurationMs > presentationTimeMs) {
        // El video es LARGO: se reproduce una vez y pasa al siguiente.
        video.loop = false;
        this.videoEndHandler = () => this.next();
        video.addEventListener('ended', this.videoEndHandler, { once: true });
      } else {
        // El video es CORTO: se repite y avanza después de un tiempo calculado,
        // esperando a que termine el ciclo actual.
        video.loop = true;

        // Calculamos cuántas veces debe repetirse para cubrir el tiempo de presentación
        const loopsNeeded = Math.ceil(presentationTimeMs / videoDurationMs);
        const totalWaitTime = loopsNeeded * videoDurationMs;

        this._presentationTimeRemaining = totalWaitTime;

        // Añadimos listeners para pausar/reanudar nuestro temporizador con el video
        video.addEventListener('pause', this._videoPauseHandler);
        video.addEventListener('play', this._videoPlayHandler);

        // Si el video ya está reproduciéndose (autoplay), iniciamos el temporizador.
        // Si no, el listener 'play' lo iniciará cuando comience.
        if (!video.paused) {
          this.resumePresentationTimer();
        }
      }
    };
    // Si los metadatos ya están cargados (p.ej. al navegar prev/next), ejecutamos manualmente.
    if (video.readyState >= 1) { // HAVE_METADATA
      video.onloadedmetadata();
    }
  }

  pausePresentationTimer() {
    if (!this.modePresentation || this._presentationTimeRemaining <= 0) return;
    clearTimeout(this.presentationTimeout);
    const elapsed = Date.now() - this._presentationTimerStart;
    this._presentationTimeRemaining -= elapsed;
  }

  resumePresentationTimer() {
    if (!this.modePresentation || this._presentationTimeRemaining <= 0) return;
    this._presentationTimerStart = Date.now();
    this.presentationTimeout = setTimeout(() => {
      if (this.modePresentation) this.next();
    }, this._presentationTimeRemaining);
  }

  closeModal() {
    this.endPresentation();
    this.modal.close();
  }
}

class ModalManager {
  _isOpened = false;
  /** @type {'image' | 'video' | null} */
  currentContentType = null;
  /** @type {HTMLElement} */
  modal;
  /** @type {HTMLImageElement} */
  modalImage;
  /** @type {HTMLVideoElement} */
  modalVideo;
  /** @type {HTMLElement} */
  modalImageParent;
  /** @type {HTMLElement} */
  presentationTimer;

  /**
   * @param {HTMLElement} modal The modal container element.
   * @param {HTMLImageElement} modalImage
   * @param {HTMLVideoElement} modalVideo
   */
  constructor(modal, modalImage, modalVideo) {
    this.modal = modal
    this.modalImage = modalImage
    this.modalVideo = modalVideo;
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
    this.isOpened = true;
    this.modal.style.display = 'flex'; // Muestra el modal
  }
  openImage(src) {
    this.currentContentType = 'image';
    this.modal.classList.remove('video-mode');
    this.modal.classList.add('image-mode');
    this.modalVideo.style.display = 'none'; // Oculta video
    this.modalImage.style.display = 'block'; // Muestra imagen
    this.setImage = src;
    this.open();
  }
  openVideo(src) {
    this.currentContentType = 'video';
    this.modal.classList.remove('image-mode');
    this.modal.classList.add('video-mode');
    this.modalImage.style.display = 'none'; // Oculta imagen
    this.modalVideo.style.display = 'block'; // Muestra video
    this.modalVideo.src = src;
    this.open();
  }
  close() {
    this.isOpened = false;
    this.currentContentType = null;
    this.modal.style.display = 'none';
    this.modal.classList.remove('image-mode', 'video-mode');
    // Limpiamos el 'src' para resetear el estado de la imagen y evitar problemas de renderizado.
    this.modalImage.src = ''
    // Detenemos el video y limpiamos su src para liberar recursos
    this.modalVideo.pause();
    this.modalVideo.src = '';
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
  changeVideo(src) {
    this.modalVideo.src = src;
  }

  /**
   * Añade o quita una clase al modal para reflejar el estado de la presentación.
   * @param {boolean} isActive
   */
  setPresentationMode(isActive) {
    this.modal.classList.toggle('presentation-active', isActive);
    this.updateTimerDisplay(isActive); // Muestra u oculta el timer
  }
}
