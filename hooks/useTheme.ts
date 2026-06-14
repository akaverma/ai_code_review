"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { themeToggled } from "@/store/slices/uiSlice";

/**
 * Reads/writes the `theme` value in the `ui` slice and keeps the
 * `dark` class on `<html>` in sync so Tailwind's `dark:` variants apply.
 */
export function useTheme() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => dispatch(themeToggled());

  return { theme, toggleTheme };
}
