import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Theme = "light" | "dark";
export type ActiveTab = "editor" | "history";

interface UiState {
  theme: Theme;
  sidebarOpen: boolean;
  activeTab: ActiveTab;
}

const initialState: UiState = {
  theme: "dark",
  sidebarOpen: false,
  activeTab: "editor",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    themeSet(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
    },
    themeToggled(state) {
      state.theme = state.theme === "light" ? "dark" : "light";
    },
    sidebarToggled(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    sidebarSet(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    activeTabSet(state, action: PayloadAction<ActiveTab>) {
      state.activeTab = action.payload;
    },
  },
});

export const { themeSet, themeToggled, sidebarToggled, sidebarSet, activeTabSet } = uiSlice.actions;

export default uiSlice.reducer;
