import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import type { AppDispatch, RootState } from "@/store";

/** Typed `useDispatch` — use this instead of the plain `react-redux` version. */
export const useAppDispatch: () => AppDispatch = useDispatch;

/** Typed `useSelector` — use this instead of the plain `react-redux` version. */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
