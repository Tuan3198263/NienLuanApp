import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice'; 

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // Thêm các reducers khác khi cần thiết
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Thêm các định nghĩa kiểu TypeScript
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {auth: AuthState, ...}
export type AppDispatch = typeof store.dispatch;
