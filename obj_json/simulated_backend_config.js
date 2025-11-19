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
