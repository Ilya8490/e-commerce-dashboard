import { LogOut, Moon, Sun, UserCircle } from "lucide-react";

import { useAuth } from "../auth/AuthContext";
import { Button } from "../components/ui/button";
import { useAppStore } from "../store/app-store";

export function Topbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useAppStore();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 lg:px-6">
      <div>
        <p className="text-sm font-semibold">{user?.storeName ?? "Store"}</p>
        <p className="text-xs text-muted-foreground">Demo analytics dataset</p>
      </div>
      <div className="flex items-center gap-2">
        <Button aria-label="Toggle theme" onClick={toggleTheme} size="icon" title="Toggle theme" variant="ghost">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <div className="hidden items-center gap-2 rounded-md border border-border px-3 py-2 text-sm md:flex">
          <UserCircle className="h-4 w-4 text-muted-foreground" />
          <span>{user?.email}</span>
        </div>
        <Button onClick={() => void logout()} variant="outline">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}
