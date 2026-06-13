import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authStore";
import chatReducer from "./chatStore";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Essential to keep socket instances alive
    }),
});