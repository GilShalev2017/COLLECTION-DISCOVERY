import { useEffect, useState } from "react";
import { injectCSS } from "./injectCss";
import {
  CSS_VARIABLES_DARK,
  CSS_VARIABLES_LIGHT,
  ANIMATIONS,
} from "./theme";

export function useTheme() {
  const [mode, setMode] = useState<"dark" | "light">(
    () => (localStorage.getItem("theme") as "dark" | "light") || "dark",
  );

  useEffect(() => {
    const css =
      (mode === "dark" ? CSS_VARIABLES_DARK : CSS_VARIABLES_LIGHT) + ANIMATIONS;

    injectCSS(css);
    localStorage.setItem("theme", mode);
  }, [mode]);

  return {
    mode,
    setMode,
    toggle: () => setMode(mode === "dark" ? "light" : "dark"),
    isLight: mode === "light",
    isDark: mode === "dark",
  };
}
