import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/** Defines the possible types for notifications. */
export type NotificationType = "success" | "error" | "info";

/** Defines the structure of the notification slice state. */
interface NotificationState {
  message: string;
  type: NotificationType;
}

/** Defines the payload structure for the showNotification action. */
interface ShowNotificationPayload {
  message: string;
  type: NotificationType;
}

const initialState: NotificationState = {
  message: "",
  type: "info", // Default type
};

const notificationSlice = createSlice({
  name: "notification",
  initialState, // Uses the typed initialState
  reducers: {
    // action is typed as PayloadAction<ShowNotificationPayload>
    showNotification: (
      state,
      action: PayloadAction<ShowNotificationPayload>
    ) => {
      state.message = action.payload.message;
      state.type = action.payload.type;
    },
    // action is typed as PayloadAction<void> (no payload)
    clearNotification: (state) => {
      state.message = "";
      state.type = "info";
    },
  },
});

// Export the action creators and the reducer, which are now correctly typed
export const { showNotification, clearNotification } =
  notificationSlice.actions;

export default notificationSlice.reducer;
