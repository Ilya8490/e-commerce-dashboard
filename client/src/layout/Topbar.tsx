import { LogOut, Moon, Sun, UserCircle } from "lucide-react";

import { useAuth } from "../auth/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAppStore } from "../store/app-store";

export function Topbar() {
  const { user, logout } = useAuth();
  const { dateRange, setDateRange, theme, toggleTheme } = useAppStore();

  return (
    <header className="flex min-h-16 flex-col gap-3 border-b border-border bg-background px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-6">
      <div>
        <p className="text-sm font-semibold">{user?.storeName ?? "Store"}</p>
        <p className="text-xs text-muted-foreground">Demo analytics dataset</p>
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground" htmlFor="date-from">
              From
            </Label>
            <Input
              className="h-9 min-w-36"
              id="date-from"
              max={dateRange.to}
              onChange={(event) => setDateRange({ ...dateRange, from: event.target.value })}
              type="date"
              value={dateRange.from}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground" htmlFor="date-to">
              To
            </Label>
            <Input
              className="h-9 min-w-36"
              id="date-to"
              min={dateRange.from}
              onChange={(event) => setDateRange({ ...dateRange, to: event.target.value })}
              type="date"
              value={dateRange.to}
            />
          </div>
        </div>
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
