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

    function fetchBalance() {
        fetch('/get-balance')
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error(data.error);
                    return;
                }
                balance = data.balance;
                balanceDisplay.innerText = `Balance: $${balance.toFixed(2)}`;
            })
            .catch(error => console.error('Error fetching balance:', error));
    }

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
        try {
            let response = await fetch('/update-balance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount })
            });

            let data = await response.json();
            if (response.ok) {
                balance = data.balance;
                balanceDisplay.innerText = `$${balance.toFixed(2)}`;
                
                // Send total bet amount to profile.js via localStorage
                localStorage.setItem("totalBetAmount", totalBetAmount);
                window.dispatchEvent(new Event("storage")); // Trigger update in profile.js
            } else {
                console.error(data.error);
            }
        } catch (error) {
            console.error('Error updating balance:', error);
        }
    }
    
    function spinReel(reel, delay) {
        return new Promise((resolve) => {
            let spinTime = 2500; 
            let interval = 100;
            let elapsed = 0;
            
            setTimeout(() => {
                let spinInterval = setInterval(() => {
                    let randomIndex = Math.floor(Math.random() * cardImages.length);
                    reel.style.backgroundImage = `url(${cardImages[randomIndex]})`;
                    reel.style.transition = "transform 0.2s ease-in-out";
                    reel.style.transform = "translateY(10px)";
                    setTimeout(() => reel.style.transform = "translateY(0)", 100);
                    elapsed += interval;

                    if (elapsed >= spinTime) {
                        clearInterval(spinInterval);
                        resolve(cardImages[randomIndex]);
                    }
                }, interval);
            }, delay);
        });
    }

    async function spinSlot() {
        buttonClickSound.play(); // 🎵 Button Click Sound
    
        let betAmount = parseFloat(betAmountInput.value);
        if (isNaN(betAmount) || betAmount <= 0) {
            messageDisplay.innerText = "Enter a valid bet amount!";
            return;
        }
        if (balance < betAmount) {
            messageDisplay.innerText = "Not enough balance!";
            return;
        }
    
        spinButton.disabled = true;
        messageDisplay.innerText = "Spinning... 🎰";
    
        try {
            // Deduct bet amount from balance
            await fetch('/update-balance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: -betAmount })
            });
    
            balance -= betAmount;
            balanceDisplay.innerText = `Balance: $${balance.toFixed(2)}`;
    
            // 🎵 Start spinning sound
            spinSound.loop = true;
            spinSound.play();
    
            let results = await Promise.all([
                spinReel(reel1, 300),
                spinReel(reel2, 800),
                spinReel(reel3, 1400)
            ]);
    
            // 🎵 Stop spinning sound
            spinSound.pause();
            spinSound.currentTime = 0;
    
            let uniqueSymbols = new Set(results);
            let winnings = 0;
    
            if (uniqueSymbols.size === 1) {
                // 🎉 Jackpot - All 3 match (10x winnings)
                winnings = betAmount * 10;
                messageDisplay.innerText = `🎉 JACKPOT! +$${winnings} 🎉`;
                winSound.play();
            } else if (uniqueSymbols.size === 2) {
                // ✅ Fix: If 2 symbols match, give back 1/3 of the bet amount
                winnings = betAmount / 3;
                messageDisplay.innerText = `🎊 Small Win! +$${winnings.toFixed(2)} 🎊`;
                winSound.play();
            } else {
                // ❌ No Win
                messageDisplay.innerText = "Try Again! ❌";
                loseSound.play();
            }
    
            if (winnings > 0) {
                // ✅ Ensure winnings are added back
                await fetch('/update-balance', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: winnings })
                });
    
                balance += winnings;  // ✅ Add winnings back
                balanceDisplay.innerText = `Balance: $${balance.toFixed(2)}`;
            }
    
            logGameResult(betAmount, winnings, balance); // ✅ Log game to backend
    
        } catch (error) {
            console.error('Spin error:', error);
        }
    
        spinButton.disabled = false;
    }
    
    
    
    
    

    async function logGameResult(bet, winnings, balance) {
        try {
            let response = await fetch("/log-game", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bet, winnings, balance })
            });
    
            let result = await response.json();
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
