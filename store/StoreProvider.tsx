"use client";

import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "@/store";

/**
 * Wraps the app with the Redux store and waits for `redux-persist` to
 * rehydrate (history + theme) before rendering children. The `loading`
 * fallback is `null` so there's no flash of unstyled content — the
 * persisted state loads almost instantly from localStorage.
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
