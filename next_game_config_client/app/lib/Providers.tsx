"use client";

import React, { FC, PropsWithChildren, useMemo } from "react";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { configureStore } from "@reduxjs/toolkit";

// Import necessary files
import notificationReducer from "../store/notificationSlice";
import { FirebaseProvider } from "./FirebaseProvider"; // Corrected import path
import type { AppStore } from "../store/store-config"; // Import type for memoization

// 1. Define the store creation function
const makeStore = () =>
  configureStore({
    reducer: {
      notification: notificationReducer,
      // Add other reducers here as you create them
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        // Disable checks for non-serializable values (for Firestore/Firebase objects)
        serializableCheck: false,
      }),
  });

// 2. Initialize TanStack Query Client once
const queryClient = new QueryClient();

/**
 * Wraps the application with necessary context providers (Redux, TanStack Query, and Firebase).
 */
export const Providers: FC<PropsWithChildren> = ({ children }) => {
  // 3. Create the Redux store once on the client side using useMemo
  const store: AppStore = useMemo(() => makeStore(), []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* 4. Wrap the Firebase Context inside the Query Client, then Redux */}
      <FirebaseProvider>
        {/* 5. Pass the client-side created store to the Redux Provider */}
        <Provider store={store}>{children}</Provider>
      </FirebaseProvider>
    </QueryClientProvider>
  );
};
