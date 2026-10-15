import logoWhite from "@/assets/afl-logo-white.png";

export const BRAND = {
  name: "AFL Imports",
  studio: "AFL Imports Studio",
  logo: logoWhite,
  logoAspect: 1000 / 797, // width / height
  // Colors used only inside exported artwork (canvas), not UI.
  art: {
    blue: "#2f7bff",
    blueGlow: "#4fb6ff",
    ink: "#05070c",
    white: "#ffffff",
    whatsapp: "#25d366",
  },
};

export type Corner = "tl" | "tr" | "bl" | "br";
export type LogoSizeKey = "sm" | "md";

export type Settings = {
  autoLogo: boolean;
  defaultCorner: Corner | "auto";
  defaultSize: LogoSizeKey;
};

const KEY = "afl-studio-settings";
export const DEFAULT_SETTINGS: Settings = { autoLogo: true, defaultCorner: "auto", defaultSize: "sm" };

export function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: Settings) {
  localStorage.setItem(KEY, JSON.stringify(s));
}
