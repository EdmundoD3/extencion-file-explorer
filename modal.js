class ImageManagger {
  _currentIndex = 0;
  _timePresentation = 5000;
  _maxTime = 5 * 60 * 1000
  _minTime = 900
  modePresentation = false; 
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
    this._currentIndex++
    if (this._currentIndex >= this.imageList.length) this.currentIndex = 0
    this.changeImage()
  }
  previous() {
    this._currentIndex--
    if (this._currentIndex < 0) this.currentIndex = this.imageList.length - 1
    this.changeImage()
  }
  presentation() {
    clearTimeout(this.presentationTimeout);
    this.presentationTimeout = setTimeout(() => {
      this.next();
      if (this.modePresentation) this.presentation();
    }, this.timePresentation);
  }
  startPresentation() {
    this.modal.openImage(this.currentImageSrc)
    this.modePresentation = true
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
    clearTimeout(this.presentationTimeout);
  }
}

class ModalManager {
  _isOppend = false;
  /** @type {HTMLElement} */
  modal;
  /** @type {HTMLImageElement} */
  modalImage;

  /**
   * @param {HTMLElement} modal The modal container element.
   * @param {HTMLImageElement} modalImage The image element inside the modal.
   */
  constructor(modal, modalImage) {
    this.modal = modal
    this.modalImage = modalImage
  }
  /**
   * @param {boolean} newIsOppend
   */
  set isOppend(newIsOppend) {
    if (typeof (newIsOppend) != "boolean") return
    this._isOppend = newIsOppend;
  }
  get isOppend() {
    return this._isOppend
  }
  /**
   * @param {string} src
   */
  set setImage(src) {
    this.modalImage.src = '';
    this.modalImage.src = src
  }
  open() {
    this.isOppend = true
    this.modal.style.display = 'flex';  // Muestra el modal
  }
  openImage(src) {
    this.setImage = src
    this.open()
  }
  close() {
    this.isOppend = false
    this.modal.style.display = 'none';
  }
  changeImage(src) {
    this.setImage = src
  }
}
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