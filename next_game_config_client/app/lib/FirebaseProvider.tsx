"use client";

import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  FC,
  ReactNode,
} from "react";
import { initializeApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  Auth,
  User,
} from "firebase/auth";
import { getFirestore, setLogLevel, Firestore } from "firebase/firestore";

// --- 1. Type Definitions ---

/** Defines the expected structure of the Firebase configuration object. */
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
}

/** Defines the structure of the data provided by the Firebase Context. */
interface FirebaseContextType {
  db: Firestore | null;
  userId: string | null;
  firebaseReady: boolean;
  appId: string;
}

// --- 2. Configuration & Context Setup ---

// Placeholder for environment variables in a Next.js context
const NEXT_PUBLIC_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: "AIzaSyBswmEuKEW2iZE1HINqoOd41eVbtKT6tI4",
  authDomain: "gameconfigdashboard.firebaseapp.com",
  projectId: "gameconfigdashboard",
  storageBucket: "gameconfigdashboard.firebasestorage.app",
  messagingSenderId: "704597526858",
  appId: "1:704597526858:web:219e314baa38298ffe99b3",
  measurementId: "G-04M7FKLR5M",
  // IMPORTANT: Add all other necessary config fields here
};

// Create the context, initialized to null (or undefined)
// We assert it won't be null when used within the provider
const FirebaseContext = createContext<FirebaseContextType | null>(null);

/**
 * Custom hook to consume the Firebase context.
 * Throws an error if used outside of the FirebaseProvider to ensure non-null access.
 */
export const useFirebase = (): FirebaseContextType => {
  const context = useContext(FirebaseContext);
  if (context === null) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  return context;
};

// --- 3. Firebase Provider Component ---

/** Defines the props for the FirebaseProvider component. */
interface FirebaseProviderProps {
  children: ReactNode;
}

export const FirebaseProvider: FC<FirebaseProviderProps> = ({ children }) => {
  // State hooks with explicit typing
  const [firebaseReady, setFirebaseReady] = useState<boolean>(false);
  const [db, setDb] = useState<Firestore | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [appId] = useState<string>("default-app-id"); // Uses a default app ID for the artifact path

  useEffect(() => {
    // Simple check to ensure we have a minimum config
    if (
      !NEXT_PUBLIC_FIREBASE_CONFIG.apiKey ||
      !NEXT_PUBLIC_FIREBASE_CONFIG.projectId
    ) {
      console.error(
        "Firebase config not set! Please replace placeholder values in NEXT_PUBLIC_FIREBASE_CONFIG."
      );
      return;
    }

    try {
      // Enable Firestore debug logging
      setLogLevel("debug");

      // Initialize services
      const app: FirebaseApp = initializeApp(NEXT_PUBLIC_FIREBASE_CONFIG);
      const firestore: Firestore = getFirestore(app);
      const authentication: Auth = getAuth(app);

      setDb(firestore);

      // Handle authentication state
      const unsubscribe = onAuthStateChanged(
        authentication,
        async (user: User | null) => {
          if (!user) {
            // Sign in anonymously if no user is present
            // We expect an Anon user or a User object after the sign-in
            const anonCredential = await signInAnonymously(authentication);
            setUserId(anonCredential.user.uid);
          } else {
            setUserId(user.uid);
          }
          setFirebaseReady(true);
        }
      );

      // Cleanup function
      return () => unsubscribe();
    } catch (error) {
      console.error("Firebase Initialization Error:", error);
      // Even on error, set ready to false if you want to show an error state,
      // or true to unblock the UI if the error is non-critical.
      // For a robust app, you might set an error state here.
      setFirebaseReady(false);
    }
  }, []);

  // Explicitly typed context value object
  const value: FirebaseContextType = { db, userId, firebaseReady, appId };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};
