// --- 1. THE GAME COMPONENT (This simulates your basketball game) ---
function GameComponent(config) {
  if (!config || config.id === "placeholder") {
    return `
            <div style="font-family: sans-serif; padding: 20px; border: 2px dashed gray; text-align: center;">
                Game Loading... (or no active config found for Client ID)
            </div>
        `;
  }

  // Extract key variables from the JSON
  const gameId = config.id;
  const gameName = config.name;
  const scoreColor = config.options.basketballOptions.scoreColor;
  const numBalls = config.options.basketballOptions.balls;
  const couponCode = config.coupons[0].code;

  // Build the dynamic HTML based on the config
  return `
        <div style="
            font-family: sans-serif;
            border: 5px solid ${scoreColor};
            padding: 20px;
            max-width: 400px;
            margin: 20px auto;
            text-align: center;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        ">
            <h2 style="color: ${scoreColor};">${gameName.toUpperCase()} IS ACTIVE!</h2>
            <p><strong>Game ID:</strong> ${gameId}</p>
            <p><strong>Total Shots:</strong> ${numBalls}</p>
            <p>
                <span style="font-size: 1.2em; font-weight: bold;">
                    Coupon Code (From JSON):
                </span>
                <br>
                <code style="background: #eee; padding: 5px 10px; border-radius: 5px;">${couponCode}</code>
            </p>
            <p style="margin-top: 15px; font-size: 0.8em; color: gray;">
                This component is reading data directly from the JSON config!
            </p>
        </div>
    `;
}

// --- 2. THE SIMULATED BACKEND CONFIG (The data fetched from Firebase) ---

// The key we're looking for, which acts as the 'clientId' (Your customer's account ID)
const ACTIVE_CLIENT_ID = "qsw689tmjzgj1o7knsevujfg0b23";

// The full JSON object you exported.
const REAL_GAME_CONFIG = {
  id: "tato-basket-1aaf",
  name: "Tato-Basket",
  clientId: ACTIVE_CLIENT_ID,
  options: {
    basketballOptions: {
      scoreColor: "#bd1e6e", // Purple/Maroon color
      balls: 6,
    },
  },
  coupons: [
    { code: "BASKET5OFF" },
    // ... all other coupon data
  ],
};

// A placeholder config (what the server would return if the client was inactive)
const INACTIVE_CONFIG = {
  id: "placeholder",
  name: "Placeholder Game",
  // ... missing all other required options
};

// --- 3. THE EMBEDDABLE SCRIPT (The logic from your index.js) ---

// Simulates the API call: finds the active config for the given clientId
function fetchActiveConfig(clientId) {
  // In a real app, this would be an API call:
  // fetch(`/api/config?clientId=${clientId}`).then(res => res.json());

  // In our simulation, we check if the requested ID matches the active one.
  if (clientId === ACTIVE_CLIENT_ID) {
    return REAL_GAME_CONFIG;
  } else {
    // If the ID is wrong, or the game is inactive, return the placeholder/error state
    return INACTIVE_CONFIG;
  }
}

// Function to find the snippet and inject the game
function initializeWiplyGames() {
  // 1. Find the script tag by its source or other attribute (simulates your snippet)
  const script = document.querySelector('script[data-wiply-embed="true"]');

  if (!script) {
    console.error("Wiply Embed Script not found.");
    return;
  }

  // 2. Extract the clientId from the script tag's data attribute
  const clientId = script.getAttribute("data-client-id");

  if (!clientId) {
    console.error("Wiply Embed: Client ID is missing from the snippet.");
    return;
  }

  // 3. Find the element where the game should be rendered
  const targetElement = document.getElementById("wiply-game-root");

  if (!targetElement) {
    console.error("Wiply Embed: Target element #wiply-game-root is missing.");
    return;
  }

  // 4. Fetch the configuration
  const config = fetchActiveConfig(clientId);

  // 5. Render the Game Component with the fetched config
  targetElement.innerHTML = GameComponent(config);
}

// Run the initialization when the DOM is ready
document.addEventListener("DOMContentLoaded", initializeWiplyGames);
