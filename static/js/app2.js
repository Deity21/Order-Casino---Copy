document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("modal");
    const loginTab = document.getElementById("login-tab");
    const signupTab = document.getElementById("signup-tab");
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const closeModal = document.getElementById("close-modal");

    const loginBtn = document.getElementById("login-btn");
    const signUpBtn = document.getElementById("sign-in-btn");

    const signupWarning = document.getElementById("signup-warning");
    const loginWarning = document.getElementById("login-warning");

    // Function to switch tabs
    function switchTab(tab) {
        loginTab.classList.remove("active");
        signupTab.classList.remove("active");
        loginForm.classList.remove("active");
        signupForm.classList.remove("active");

        if (tab === "login") {
            loginTab.classList.add("active");
            loginForm.classList.add("active");
        } else {
            signupTab.classList.add("active");
            signupForm.classList.add("active");
        }
    }

    // Open modal with login tab
    loginBtn.addEventListener("click", function () {
        modal.style.display = "flex";
        switchTab("login");
    });

    // Open modal with sign-up tab
    signUpBtn.addEventListener("click", function () {
        modal.style.display = "flex";
        switchTab("signup");
    });

    // Tab click event listeners
    loginTab.addEventListener("click", function () {
        switchTab("login");
    });

    signupTab.addEventListener("click", function () {
        switchTab("signup");
    });

    // Close modal when clicking close button
    closeModal.addEventListener("click", function () {
        modal.style.display = "none";
    });

    // Close modal when clicking outside modal content
    window.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    // ✅ Handle Sign Up Submission
    document.getElementById("signUpForm").addEventListener("submit", async function (event) {
        event.preventDefault();
        const username = document.getElementById("signup-username").value.trim();
        const email = document.getElementById("signup-email").value.trim();
        const password = document.getElementById("signup-password").value.trim();

        signupWarning.textContent = ""; // Clear previous warnings

        if (!username || !email || !password) {
            signupWarning.textContent = "Please enter all required fields.";
            return;
        }

        try {
            const response = await fetch("/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                signupWarning.style.color = "green";
                signupWarning.textContent = "Sign-up successful! Redirecting to Sign In...";
                
                setTimeout(() => {
                    switchTab("login"); // Redirect to Sign In tab
                    signupWarning.textContent = "";
                }, 2000);
            } else {
                signupWarning.textContent = data.error || "Signup failed.";
            }
        } catch (error) {
            signupWarning.textContent = "An error occurred. Please try again.";
        }
    });

    // ✅ Handle Login Submission
    document.getElementById("loginForm").addEventListener("submit", async function (event) {
        event.preventDefault();
        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value.trim();

        loginWarning.textContent = ""; // Clear previous warnings

        if (!email || !password) {
            loginWarning.textContent = "Please enter your email and password.";
            return;
        }

        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                loginWarning.style.color = "green";
                loginWarning.textContent = "Login successful! Redirecting...";
                
                setTimeout(() => {
                    window.location.href = data.redirect; // ✅ Redirect to either admin dashboard or homepage
                }, 1500);
            } else {
                loginWarning.textContent = data.error || "Login failed.";
            }
        } catch (error) {
            loginWarning.textContent = "An error occurred. Please try again.";
            console.error("Login Error:", error);
        }
    });

});

// Update Profile Picture
function changeProfilePic(event) {
  event.preventDefault();

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.onchange = () => {
      const file = fileInput.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('profile_pic', file);

      fetch('/update-profile-pic', {
          method: 'POST',
          body: formData,
      })
      .then(response => response.json())
      .then(data => {
          if (data.error) {
              alert(data.error);
          } else {
              alert('Profile picture updated successfully!');
              document.querySelector('.avatar').src = data.profile_pic_url;
              localStorage.setItem('profile_pic', data.profile_pic_url); // Save to localStorage
          }
      })
      .catch(error => {
          console.error('Error:', error);
      });
  };
  fileInput.click();
}

// Display User Balance
document.addEventListener("DOMContentLoaded", () => {
  fetch('/profile')
      .then(response => response.json())
      .then(data => {
          if (data.error) {
              console.error(data.error);
              return;
          }

          // Update balance or use a fallback
          document.querySelector('.balance').textContent = `$${data.balance ? data.balance.toFixed(2) : '20.00'}`;

          // Update username
          document.querySelector('.user-info p').textContent = data.username;

          // Update profile picture
          document.querySelector('.avatar').src = data.profile_pic;

          // Save to localStorage
          localStorage.setItem('username', data.username);
          localStorage.setItem('profile_pic', data.profile_pic);
      })
      .catch(error => console.error('Error fetching user data:', error));
});


// Transaction History Pop-up
function openHistoryPopup() {
    const historyPopup = document.getElementById("history-popup");
    const transactionList = document.getElementById("transaction-list");

    // Show the popup
    historyPopup.style.display = "flex";

    // Fetch and populate transaction history
    fetch("/get-transactions")
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error fetching transactions: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            transactionList.innerHTML = ""; // Clear existing content

            if (data.transactions.length === 0) {
                transactionList.innerHTML = "<p>No transactions found.</p>";
                return;
            }

            // Populate transactions dynamically
            data.transactions.forEach(transaction => {
                const transactionItem = document.createElement("p");

                // Style status color (✅ Green for approved, ❌ Red for rejected, 🟡 Yellow for pending)
                let statusColor = transaction.status === "Approved" ? "green" :
                                  transaction.status === "Rejected" ? "red" : "yellow";

                transactionItem.innerHTML = `
                    <span style="font-weight: bold;">${transaction.timestamp}</span> - 
                    ${transaction.type.toUpperCase()}: 
                    <span style="color: ${statusColor};">$${transaction.amount.toFixed(2)}</span> 
                    <strong>(${transaction.status})</strong>
                `;
                
                transactionList.appendChild(transactionItem);
            });
        })
        .catch(error => {
            console.error("❌ Error loading transactions:", error);
            transactionList.innerHTML = "<p>Error loading transactions.</p>";
        });
}

// ✅ Close Popup
function closeHistoryPopup() {
    document.getElementById("history-popup").style.display = "none";
}


document.addEventListener("DOMContentLoaded", () => {
  fetch('/get-balance')
      .then(response => response.json())
      .then(data => {
          if (data.error) {
              console.error(data.error);
              return;
          }
          const balanceElement = document.getElementById('balance');
          balanceElement.textContent = `$${data.balance.toFixed(2)}`;
      })
      .catch(error => console.error('Error fetching balance:', error));
});


// Load User Data from LocalStorage
window.onload = () => {
  const username = localStorage.getItem('username');
  const profilePic = localStorage.getItem('profile_pic');

  if (username) {
      document.querySelector('.user-info p').textContent = username;
  }

  if (profilePic) {
      document.querySelector('.avatar').src = profilePic;
  }

  displayBalance();
};

document.addEventListener("DOMContentLoaded", async function () {
    const depositBar = document.querySelector(".progress:nth-of-type(1) .progress-fill");
    const betBar = document.querySelector(".progress:nth-of-type(2) .progress-fill");
    const depositText = document.querySelector(".progress:nth-of-type(1) p span");
    const betText = document.querySelector(".progress:nth-of-type(2) p span");

    async function fetchVIPProgress() {
        try {
            const response = await fetch('/get-vip-progress');
            const data = await response.json();

            if (data.error) {
                console.error("Error:", data.error);
                return;
            }

            const depositAmount = data.deposit_amount;
            const betAmount = data.bet_amount;

            // VIP level thresholds
            const depositThreshold = 300;
            const betThreshold = 100;

            // Calculate progress percentages
            const depositProgress = Math.min((depositAmount / depositThreshold) * 100, 100);
            const betProgress = Math.min((betAmount / betThreshold) * 100, 100);

            // Update text display
            depositText.innerText = `R$${depositAmount} / R$${depositThreshold}`;
            betText.innerText = `R$${betAmount} / R$${betThreshold}`;

            // Update progress bars
            depositBar.style.width = `${depositProgress}%`;
            betBar.style.width = `${betProgress}%`;

        } catch (error) {
            console.error("Error fetching VIP progress:", error);
        }
    }

    // Fetch VIP progress on page load
    fetchVIPProgress();

    // Refresh VIP progress every 10 seconds
    setInterval(fetchVIPProgress, 10000);
});
async function updateBalance(amount) {
    try {
        const response = await fetch('/update-balance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: amount })
        });

        const data = await response.json();

        if (data.error) {
            alert(data.error);
            return;
        }

        // Update balance UI
        document.getElementById("balanceDisplay").innerText = `Balance: R$${data.balance.toFixed(2)}`;

        // If a bet was placed, update the bet progress bar
        if (amount < 0) {
            updateBetProgress(data.bet_amount);
        }

    } catch (error) {
        console.error("Error updating balance:", error);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const betProgressBar = document.querySelector(".progress:nth-child(2) .progress-fill");
    const depositProgressBar = document.querySelector(".progress:nth-child(1) .progress-fill");
    const betAmountDisplay = document.querySelector(".black-box p:nth-child(2)");

    const BET_THRESHOLD = 100;   // Bet amount required per level
    const DEPOSIT_THRESHOLD = 300; // Deposit required per level

    function updateVIPProgress() {
        let totalBetAmount = parseFloat(localStorage.getItem("totalBetAmount") || 0);
        let totalDepositAmount = parseFloat(localStorage.getItem("totalDepositAmount") || 0);

        // Update BET progress
        let betProgress = Math.min((totalBetAmount / BET_THRESHOLD) * 100, 100);
        betProgressBar.style.width = `${betProgress}%`;

        // Update Deposit progress
        let depositProgress = Math.min((totalDepositAmount / DEPOSIT_THRESHOLD) * 100, 100);
        depositProgressBar.style.width = `${depositProgress}%`;

        // Update Display
        betAmountDisplay.innerText = `$${totalBetAmount.toFixed(2)}`;
    }

    // Initial load
    updateVIPProgress();

    // Listen for storage updates
    window.addEventListener("storage", updateVIPProgress);
});


// Function to update bet progress bar dynamically
function updateBetProgress(betAmount) {
    const betBar = document.querySelector(".progress:nth-of-type(2) .progress-fill");
    const betText = document.querySelector(".progress:nth-of-type(2) p span");

    const betThreshold = 100; // Required amount to level up
    const betProgress = Math.min((betAmount / betThreshold) * 100, 100);

    betText.innerText = `R$${betAmount} / R$${betThreshold}`;
    betBar.style.width = `${betProgress}%`;
}

document.addEventListener("DOMContentLoaded", function () {
    const rankOverlay = document.getElementById("rankOverlay");
    const closePopup = document.getElementById("closePopup");
    const rankSystemLink = document.querySelector(".rank-system");
    const rankContainer = document.querySelector(".rank-container");

    // Ensure the popup is **hidden** on page load
    rankOverlay.style.display = "none";

    // Level Data
    const levels = [
        { level: 1, deposit: 0, bet: 0 },
        { level: 2, deposit: 300, bet: 100 },
        { level: 3, deposit: 600, bet: 200 },
        { level: 4, deposit: 1000, bet: 400 },
        { level: 5, deposit: 1500, bet: 700 },
        { level: 6, deposit: 2100, bet: 1000 },
        { level: 7, deposit: 2800, bet: 1400 },
        { level: 8, deposit: 3600, bet: 1800 },
        { level: 9, deposit: 4500, bet: 2300 },
        { level: 10, deposit: 5500, bet: 3000 }
    ];

    // Function to populate ranks
    function populateRanks() {
        rankContainer.innerHTML = ""; // Clear existing content

        levels.forEach(level => {
            const rankItem = document.createElement("div");
            rankItem.classList.add("rank-item");

            rankItem.innerHTML = `
                <img src="./static/images/level${level.level}.webp" alt="Level ${level.level}">
                <div>
                    <strong>Level ${level.level}</strong>
                    <p>Deposit: R$${level.deposit} | Bet: R$${level.bet}</p>
                </div>
            `;

            rankContainer.appendChild(rankItem);
        });
    }

    // ✅ Show the rank popup **only when the button is clicked**
    rankSystemLink.addEventListener("click", function (event) {
        event.preventDefault();
        populateRanks();
        rankOverlay.style.display = "flex";
    });

    // ✅ Close popup when clicking "X"
    closePopup.addEventListener("click", function () {
        rankOverlay.style.display = "none";
    });

    // ✅ Close popup when clicking outside the popup content
    rankOverlay.addEventListener("click", function (event) {
        if (event.target === rankOverlay) {
            rankOverlay.style.display = "none";
        }
    });
});


document.addEventListener("DOMContentLoaded", function () {
    const betAmountDisplay = document.querySelector(".black-box p:nth-child(2)"); // BET Amount Display
    
    function updateBetAmount() {
        let totalBetAmount = localStorage.getItem("totalBetAmount") || 0;
        betAmountDisplay.innerText = `$${parseFloat(totalBetAmount).toFixed(2)}`;
    }

    // Initial load
    updateBetAmount();

    // Listen for storage updates from slot.js
    window.addEventListener("storage", updateBetAmount);
});

document.addEventListener("DOMContentLoaded", function () {
    // Ensure all popups are hidden on page load
    document.querySelectorAll('.popup-overlay').forEach(popup => {
        popup.style.display = "none";
    });

    // Open popup function
    function openPopup(id) {
        const popupOverlay = document.getElementById(id);
        if (popupOverlay) {
            popupOverlay.style.display = "flex"; // Show overlay
        }
    }

    // Close popup function (works for X button)
    function closePopup(id) {
        const popupOverlay = document.getElementById(id);
        if (popupOverlay) {
            popupOverlay.style.display = "none";
        }
    }

    // Close popup when clicking outside the popup content
    document.addEventListener("click", function (event) {
        document.querySelectorAll(".popup-overlay").forEach(popup => {
            if (event.target === popup) {
                popup.style.display = "none"; // Hide overlay
            }
        });
    });

    // Add event listeners to deposit and withdraw buttons
    document.querySelector(".deposit-btn").addEventListener("click", () => openPopup("depositPopup"));
    document.querySelector(".withdraw-btn").addEventListener("click", () => openPopup("withdrawPopup"));

    // Ensure X buttons work
    document.querySelectorAll(".close-btnn").forEach(button => {
        button.addEventListener("click", function () {
            const popupOverlay = this.closest(".popup-overlay");
            if (popupOverlay) popupOverlay.style.display = "none";
        });
    });
});




// ✅ Handle Deposit Submission
async function submitDeposit() {
    let amount = parseFloat(document.getElementById("depositAmount").value);
    let network = document.getElementById("usdtNetwork").value;

    if (isNaN(amount) || amount <= 0) {
        alert("Enter a valid deposit amount.");
        return;
    }

    try {
        let response = await fetch("/update-balance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: amount })
        });

        let data = await response.json();
        if (response.ok) {
            alert(`Deposit Successful: $${amount} via ${network}`);
            closePopup("depositPopup");
            localStorage.setItem("totalDepositAmount", (parseFloat(localStorage.getItem("totalDepositAmount") || 0) + amount));
            window.dispatchEvent(new Event("storage"));
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error("Deposit error:", error);
    }
}



// ✅ Modified Withdrawal Function
async function submitWithdrawal() {
    let typeElement = document.getElementById("withdrawType");
    let type = typeElement ? typeElement.value.trim().toLowerCase() : "";

    let amountInput = type === "money" 
        ? document.getElementById("withdrawAmount") 
        : document.getElementById("nftWithdrawAmount");

    let amount = parseFloat(amountInput ? amountInput.value : 0);
    let walletAddressInput = type === "money" 
        ? document.getElementById("walletAddress") 
        : document.getElementById("solanaAddress");

    let walletAddress = walletAddressInput ? walletAddressInput.value.trim() : "";
    let networkElement = document.getElementById("withdrawNetwork");
    let network = type === "money" && networkElement ? networkElement.value : "Solana";

    // ✅ Ensure withdrawal type is valid
    if (!["money", "nft"].includes(type)) {
        alert("Please select a valid withdrawal type (Money or NFT).");
        return;
    }

    // ✅ Validate amount
    if (isNaN(amount) || amount < 20) {
        alert("Withdrawal amount must be at least $20.");
        return;
    }

    // ✅ Validate wallet address
    if (!walletAddress) {
        alert("Enter a valid wallet address.");
        return;
    }

    try {
        let response = await fetch("/submit-withdrawal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                type, 
                amount, 
                network, 
                walletAddress 
            }) 
        });

        let data = await response.json();
        console.log("Server Response:", data); // ✅ Debugging

        if (response.ok && data.success) {
            // ✅ Update balance display
            let balanceDisplay = document.getElementById("balance");
            let newBalance = parseFloat(balanceDisplay.innerText.replace("$", "")) - amount;
            balanceDisplay.innerText = `$${newBalance.toFixed(2)}`;

            // ✅ Show success notification
            showSuccessNotification(`✅ Withdrawal Submitted: $${amount} via ${network}`);

            closePopup("withdrawPopup");
        } else {
            alert(`❌ Withdrawal Failed: ${data.error}`);
        }
    } catch (error) {
        console.error("Withdrawal error:", error);
        
    }
}

function toggleWithdrawOptions() {
    let type = document.getElementById("withdrawType").value;

    if (type === "money") {
        document.getElementById("moneyWithdraw").style.display = "block";
        document.getElementById("nftWithdraw").style.display = "none";
    } else {
        document.getElementById("moneyWithdraw").style.display = "none";
        document.getElementById("nftWithdraw").style.display = "block";
    }
}




function showSuccessNotification(message) {
    let notification = document.createElement("div");
    notification.classList.add("success-notification");
    notification.innerText = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = "0";
        setTimeout(() => notification.remove(), 500);
    }, 5000);
}

// ✅ Add CSS for better styling
const style = document.createElement("style");
style.innerHTML = `
.success-notification {
    position: fixed;
    top: 10%;
    right: 10%;
    background: #28a745;
    color: white;
    padding: 15px 20px;
    border-radius: 5px;
    font-size: 16px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: opacity 0.5s ease-in-out;
}
`;
document.head.appendChild(style);

async function submitDeposit() {
    let amount = parseFloat(document.getElementById("depositAmount").value);
    let network = document.getElementById("usdtNetwork").value.trim().toUpperCase();

    if (isNaN(amount) || amount <= 0) {
        alert("Enter a valid deposit amount.");
        return;
    }

    if (!["TRC20", "ERC20", "BEP20"].includes(network)) {
        alert("Invalid network. Choose TRC20, ERC20, or BEP20.");
        return;
    }

    try {
        let response = await fetch("/create-deposit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount, network })
        });

        let data = await response.json();

        if (response.ok && data.success) {
            window.location.href = data.payment_url; // ✅ Redirect to NowPayments
        } else {
            alert(data.error || "Something went wrong.");
        }
    } catch (error) {
        console.error("Deposit error:", error);
        alert("An error occurred while processing your deposit.");
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const notificationIcon = document.getElementById("notificationIcon");
    const announcementPopup = document.getElementById("announcementPopup");
    const announcementList = document.getElementById("announcementList");
    const closeButton = document.getElementById("closePopup");

    // ✅ Fetch Announcements from Backend
    function fetchAnnouncements() {
        fetch("/get-announcements")
        .then(response => response.json())
        .then(data => {
            announcementList.innerHTML = "";

            if (!data || data.length === 0) {
                announcementList.innerHTML = "<p>No announcements available.</p>";
                return;
            }

            data.forEach(announcement => {
                const li = document.createElement("li");
                li.innerHTML = `
                    <strong>${announcement.title}</strong> 
                    <p>${announcement.message}</p>
                    <small>${announcement.date}</small>
                    <hr>
                `;
                announcementList.appendChild(li);
            });
        })
        .catch(error => {
            console.error("Error fetching announcements:", error);
            announcementList.innerHTML = "<p style='color: red;'>Failed to load announcements.</p>";
        });
    }

    // ✅ Open Popup when clicking the notification icon
    notificationIcon.addEventListener("click", function () {
        announcementPopup.style.display = "flex";
        fetchAnnouncements(); // Load announcements dynamically
    });

    // ✅ Close popup when clicking outside content
    announcementPopup.addEventListener("click", function (event) {
        if (event.target === announcementPopup) {
            closePopup();
        }
    });

    // ✅ Close popup when clicking close button
    closeButton.addEventListener("click", closePopup);

    // ✅ Close popup function
    function closePopup() {
        announcementPopup.style.display = "none";
    }
});

