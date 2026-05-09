import { createContext, useContext } from "react";

export interface AppSettings {
  hideSourceBadges: boolean;
  identifyAlgorithms: boolean;
  sector: string;
}

export const SettingsContext = createContext<AppSettings>({
  hideSourceBadges: false,
  identifyAlgorithms: true,
  sector: "general",
});

export function useSettings() {
  return useContext(SettingsContext);
}
