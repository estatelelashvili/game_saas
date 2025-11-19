import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from "react-redux";
// Import the types you defined in your store configuration (e.g., store/index.ts)
import type { RootState, AppDispatch } from "./store-config";

/**
 * Use throughout your app instead of plain `useDispatch` and `useSelector`.
 * These hooks are pre-typed with your store's RootState and AppDispatch.
 */

// Use the standard useDispatch hook, specifying the AppDispatch type
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Use the standard useSelector hook with the TypedUseSelectorHook utility
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
