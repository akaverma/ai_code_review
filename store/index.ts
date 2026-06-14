import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from "redux-persist";

import reviewReducer from "@/store/slices/reviewSlice";
import historyReducer from "@/store/slices/historySlice";
import uiReducer from "@/store/slices/uiSlice";
import { createAppStorage } from "@/store/storage";

const rootReducer = combineReducers({
  review: reviewReducer,
  history: historyReducer,
  ui: uiReducer,
});

const persistConfig = {
  key: "ai-code-review",
  storage: createAppStorage(),
  // Only persist history and UI preferences — the in-progress review
  // (and any streaming text) should not survive a refresh.
  whitelist: ["history", "ui"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export function makeStore() {
  return configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE],
        },
      }),
  });
}

export const store = makeStore();
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
