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
