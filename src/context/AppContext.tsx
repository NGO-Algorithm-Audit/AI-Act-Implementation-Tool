import { createContext, useContext } from "react";

export type AppContextValue = {
  // Single source of truth for the user's role. null when Role-and-status
  // has not been filled in yet. Drives the role badge + role-aware copy on
  // the Risk-category start page and the NextSteps/Obligations sections on
  // the result page.
  role: string | null;
  onStartQuestionnaire?: (key: string, fieldKey?: string) => void;
};

export const AppContext = createContext<AppContextValue>({
  role: null,
});

export function useAppContext() {
  return useContext(AppContext);
}
