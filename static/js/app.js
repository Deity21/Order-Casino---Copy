// JavaScript to handle modal opening and closing
const modalOverlay = document.querySelector('.modal-overlay');
const openModalBtn = document.querySelector('.deposit-btn');
const closeModalBtn = document.querySelector('.close-btn');

// Open modal
openModalBtn.addEventListener('click', () => {
  modalOverlay.classList.remove('hidden');
});

// Close modal
closeModalBtn.addEventListener('click', () => {
  modalOverlay.classList.add('hidden');
});

// Close modal by clicking outside the container
modalOverlay.addEventListener('click', (event) => {
  if (event.target === modalOverlay) {
    modalOverlay.classList.add('hidden');
  }
});
