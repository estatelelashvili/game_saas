// These types must be exported for use in store/hooks.ts
import { configureStore } from "@reduxjs/toolkit";

// Placeholder for the store creation function (to be called in the Provider)
export const createStore = () =>
  configureStore({
    reducer: {
      // Reducers go here
      notification: {} as any, // Placeholder for type inference
    },
  });

// Infer the `RootState` and `AppDispatch` types from the store creation function
export type AppStore = ReturnType<typeof createStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
