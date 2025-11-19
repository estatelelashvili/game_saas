import React from "react";
import { Providers } from "./lib/Providers";
// Note: You may need to create a mock for useFirebase to run this component
import Dashboard from "./dashboard";

// This is a Server Component (default in App Router)
// It imports the Client Component Providers to wrap client-side logic.
export default function HomePage() {
  return (
    // Wrapping the entire application tree with the Providers component
    // ensures Redux and Query contexts are available to all children.
    <Providers>
      <Dashboard />
    </Providers>
  );
}
