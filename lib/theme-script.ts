/**
 * Source for the inline script injected into `<head>` that applies the
 * persisted theme before first paint, avoiding a flash of the wrong
 * theme while the Redux store rehydrates. Defaults to dark when nothing
 * is persisted yet, matching `uiSlice`'s initial state.
 */
export const THEME_SCRIPT = `
(function () {
  try {
    var persisted = localStorage.getItem("persist:ai-code-review");
    var theme = "dark";
    if (persisted) {
      var ui = JSON.parse(JSON.parse(persisted).ui);
      if (ui && (ui.theme === "light" || ui.theme === "dark")) {
        theme = ui.theme;
      }
    }
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    }
  } catch (e) {
    document.documentElement.classList.add("dark");
  }
})();
`;
