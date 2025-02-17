// script.js
document.addEventListener("DOMContentLoaded", () => {
    const menuIcon = document.getElementById("menu-icon");
    const asideMenu = document.getElementById("aside-menu");
  
    // Function to toggle the menu
    function toggleMenu() {
      if (asideMenu.style.left === "0px") {
        asideMenu.style.left = "-300px"; // Hide the menu
      } else {
        asideMenu.style.left = "0px"; // Show the menu
      }
    }
  
    // Function to close the menu
    function closeMenu() {
      asideMenu.style.left = "-300px";
    }
  
    // Toggle menu on menu icon click
    menuIcon.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent click from propagating to the document
      toggleMenu();
    });
  
    // Close menu when clicking anywhere else
    document.addEventListener("click", () => {
      closeMenu();
    });
  
    // Prevent menu from closing when clicking inside the aside menu
    asideMenu.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  });
  // script.js
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal-sign-in");
  const openModal = document.getElementById("sign-in-btn");
  const openloginModal = document.getElementById('login-btn')
  const closeModal = document.getElementById("close-modal");
  const loginModal = document.getElementById("modal");
  const closeLoginModal = document.getElementById('close-login-modal');

  // loginModal.style.display = "none";
  openModal.addEventListener("click", () => {
    modal.style.display = "flex";
  });
  openloginModal.addEventListener("click", () => {
    loginModal.style.display = "flex";
  });
  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
    loginModal.style.display = "none";
  });
  closeLoginModal.addEventListener("click", () => {
    loginModal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  window.addEventListener("click", (e) => {
    if (e.target === loginModal) {
      loginModal.style.display = "none";
    }
  });
});

function logout() {
  fetch('/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
    .then(response => response.json())
    .then(data => {
      if (data.message) {
        window.location.href = '/homepage'; // Redirect to homepage
      }
    })
    .catch(error => console.error('Error:', error));
}

