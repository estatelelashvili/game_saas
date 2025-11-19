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
