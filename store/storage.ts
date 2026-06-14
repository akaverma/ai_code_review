import type { WebStorage } from "redux-persist/lib/types";

/**
 * A no-op storage engine used during server-side rendering, where
 * `window`/`localStorage` don't exist. `redux-persist` calls these
 * methods during store setup even before any persisted state is read,
 * so importing `redux-persist/lib/storage` directly would throw on the
 * server. On the client we fall back to real `localStorage`.
 */
const noopStorage: WebStorage = {
  getItem: () => Promise.resolve(null),
  setItem: () => Promise.resolve(),
  removeItem: () => Promise.resolve(),
};

export function createAppStorage(): WebStorage {
  if (typeof window === "undefined") {
    return noopStorage;
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("redux-persist/lib/storage").default as WebStorage;
}
