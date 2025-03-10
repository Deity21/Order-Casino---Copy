document.addEventListener("DOMContentLoaded", () => {
    const reel1 = document.getElementById("reel1");
    const reel2 = document.getElementById("reel2");
    const reel3 = document.getElementById("reel3");
    const spinButton = document.getElementById("spin-button");
    const balanceDisplay = document.getElementById("balance");

    const messageDisplay = document.getElementById("message");
    const betAmountInput = document.getElementById("bet-amount");
    const logContainer = document.getElementById("game-log");
    const betAmountDisplay = document.querySelector(".black-box p:nth-child(2)"); 

    const cardImages = [
        "static/images/card1.png", "static/images/card2.png", "static/images/card3.png",
        "static/images/card4.png", "static/images/card5.png", "static/images/card6.png",
        "static/images/card7.png", "static/images/card8.png", "static/images/card9.png",
        "static/images/card10.png", "static/images/card11.png", "static/images/card12.png"
    ];

    // 🎵 Load Sound Effects
    const spinSound = new Audio("static/sounds/spinner-sound-36693.mp3");
    const winSound = new Audio("static/sounds/game-bonus-144751.mp3");
    const loseSound = new Audio("static/sounds/you-lose-game-sound-230514.mp3");
    const buttonClickSound = new Audio("static/sounds/click-buttons-ui-menu-sounds-effects-button-7-203601.mp3");

    let balance = 0; // Default balance
    let totalBetAmount = 0;

    function saveLogsToLocalStorage(logs) {
        const timestampedLogs = logs.map(log => ({
            text: log,
            timestamp: new Date().getTime()
        }));
        localStorage.setItem("gameLogs", JSON.stringify(timestampedLogs));
    }

    function loadLogsFromLocalStorage() {
        const storedLogs = JSON.parse(localStorage.getItem("gameLogs")) || [];
        const now = new Date().getTime();

        // Remove logs older than 2 hours (7200000ms)
        const validLogs = storedLogs.filter(log => now - log.timestamp < 7200000);

        logContainer.innerHTML = "";
        validLogs.forEach(log => addLogToContainer(log.text));

        localStorage.setItem("gameLogs", JSON.stringify(validLogs));
    }

    function addLogToContainer(logText) {
        let logEntry = document.createElement("p");
        logEntry.classList.add("log-entry");
        logEntry.innerText = logText;
        logEntry.style.backgroundColor = "#222"; 
        logEntry.style.padding = "8px";
        logEntry.style.margin = "5px 0";
        logEntry.style.borderRadius = "5px";
        logContainer.appendChild(logEntry);
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    if (!balanceDisplay) {
        console.error("🚨 balanceDisplay is NULL! Check if <p id='balance'> exists in slot.html");
        return;
    }

    // ✅ Fetch Balance Function
    function fetchBalance() {
        console.log("📡 Fetching balance...");
        
        fetch('/get-balance')
            .then(response => {
                console.log(`📩 Received Response: HTTP ${response.status}`);
                return response.json();
            })
            .then(data => {
                console.log("📩 Response Data:", data);
                if (data.error) {
                    console.error("❌ Error fetching balance:", data.error);
                    return;
                }

                balanceDisplay.innerText = `Balance: $${parseFloat(data.balance).toFixed(2)}`;
                console.log(`✅ Updated balance: $${parseFloat(data.balance).toFixed(2)}`);
            })
            .catch(error => console.error('❌ Fetch error:', error));
    }

    // ✅ Ensure Fetch Balance Runs Properly
    fetchBalance();  // Fetch balance immediately when page loads

    // ✅ Check if Network Request Appears
    setTimeout(() => {
        console.log("📡 Checking if /get-balance request appeared in Network Tab");
    }, 2000);

    
    

    function fetchLogs() {
        fetch('/get-logs')
            .then(response => response.json())
            .then(data => {
                logContainer.innerHTML = "";
                data.logs.forEach(log => {
                    addLogToContainer(log);
                });
                logContainer.scrollTop = logContainer.scrollHeight;
            })
            .catch(error => console.error('Error fetching logs:', error));
    }

    async function updateBalance(amount) {
        console.log(`📤 Attempting to update balance with amount: ${amount}`);
    
        try {
            let response = await fetch('/update-balance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount })
            });
    
            console.log(`📩 Server Response: HTTP ${response.status}`);
            let data = await response.json();
    
            if (!response.ok) {
                console.error("❌ Balance update error:", data);
                messageDisplay.innerText = `Balance update failed: ${data.error}`;
                return;
            }
    
            console.log(`✅ Balance Updated: Old ${balance} → New ${data.balance}`);
            balance = data.balance;  
            balanceDisplay.innerText = `Balance: $${balance.toFixed(2)}`;
        } catch (error) {
            console.error('❌ Error updating balance:', error);
        }
    }
    
    
    function startReelSpin(reel) {
        let interval = setInterval(() => {
            let randomIndex = Math.floor(Math.random() * cardImages.length);
            reel.style.backgroundImage = `url(${cardImages[randomIndex]})`;
        }, 80); // Fast spinning
        return interval;
    }

    function spinReels(finalReel1, finalReel2, finalReel3) {
        const reels = [reel1, reel2, reel3];
        const finalResults = [finalReel1, finalReel2, finalReel3];
    
        reels.forEach((reel, index) => {
            let elapsed = 0;
            let spinTime = 10000; // 4 seconds of spinning
            let interval = setInterval(() => {
                let randomIndex = Math.floor(Math.random() * cardImages.length);
                reel.style.backgroundImage = `url(${cardImages[randomIndex]})`;
            }, 100); // Fast spinning effect
    
            setTimeout(() => {
                clearInterval(interval);
                reel.style.backgroundImage = `url(${finalResults[index]})`; // ✅ Show final image and KEEP IT
            }, spinTime);
        });
    }
    
    

    async function spinSlot() {
        try {
            buttonClickSound.play();  // 🎵 Button click sound when spin is pressed
    
            let betAmount = parseFloat(betAmountInput.value);
            if (isNaN(betAmount) || betAmount <= 0) {
                messageDisplay.innerText = "Enter a valid bet amount!";
                return;
            }
    
            console.log("📤 Sending spin request...");
    
            let response = await fetch('/spin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bet_amount: betAmount })
            });
    
            let data = await response.json();
    
            if (response.status === 401) {
                console.error("❌ User not authenticated.");
                messageDisplay.innerText = "You must log in to play!";
                return;
            }
    
            if (!response.ok) {
                console.error("❌ Spin failed:", data.error);
                messageDisplay.innerText = `Error: ${data.error}`;
                return;
            }
    
            console.log("✅ Spin successful:", data);
    
            // ✅ Update Balance Immediately
            balance = data.balance;
            balanceDisplay.innerText = `Balance: $${balance.toFixed(2)}`;
    
            // ✅ Start spinning animation
            spinReels(data.reel1, data.reel2, data.reel3);
    
            // ✅ Play the correct sound & display result after animation
            setTimeout(() => {
                if (data.winnings > 0) {
                    messageDisplay.innerHTML = `🎉 You won $${data.winnings.toFixed(2)}! 🎉`;
                    winSound.play(); // 🎵 Play WIN sound
                } else {
                    messageDisplay.innerHTML = "❌ Try Again!";
                    loseSound.play(); // 🎵 Play LOSE sound
                }
            }, 3000); // 3 seconds delay to match animation
    
        } catch (error) {
            console.error("❌ Error during spin:", error);
            messageDisplay.innerText = "Unexpected error!";
        }
    }
    
    
    
    spinButton.addEventListener("click", spinSlot);



    async function logGameResult(bet, winnings, balance) {
        try {
            let response = await fetch("/log-game", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bet, winnings, balance })
            });
    
            let result = await response.json();
    
            if (!response.ok) {
                console.error("❌ Game log failed:", result);
                return;
            }
    
            console.log("✅ Game log stored:", result.message);
        } catch (error) {
            console.error("❌ Error logging game result:", error);
        }
    }
    
    spinButton.addEventListener("click", spinSlot);
    loadLogsFromLocalStorage();
    fetchBalance();
    fetchLogs();
});
