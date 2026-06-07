import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark";

interface DateRangeState {
  from: string;
  to: string;
}

interface AppState {
  theme: Theme;
  dateRange: DateRangeState;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setDateRange: (dateRange: DateRangeState) => void;
}

function defaultDateRange(): DateRangeState {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 29);

  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10)
  };
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: "light",
      dateRange: defaultDateRange(),
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      toggleTheme: () => {
        const nextTheme = get().theme === "dark" ? "light" : "dark";
        applyTheme(nextTheme);
        set({ theme: nextTheme });
      },
      setDateRange: (dateRange) => set({ dateRange })
    }),
    {
      name: "ecommerce-dashboard-ui",
      partialize: (state) => ({ theme: state.theme })
    }
  )
);

useAppStore.persist.onFinishHydration((state) => {
  applyTheme(state.theme);
});

applyTheme(useAppStore.getState().theme);
