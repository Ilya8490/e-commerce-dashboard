import {
  BarChart3,
  Boxes,
  Gauge,
  ShoppingBag,
  Users,
  Waypoints
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { cn } from "../utils/cn";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: Gauge },
  { to: "/products", label: "Products", icon: Boxes },
  { to: "/funnel", label: "Funnel", icon: Waypoints },
  { to: "/traffic", label: "Traffic", icon: BarChart3 },
  { to: "/customers", label: "Customers", icon: Users }
];

export function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-64 border-r border-border bg-card px-4 py-5 lg:block">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <ShoppingBag className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">Commerce IQ</p>
          <p className="text-xs text-muted-foreground">Analytics workspace</p>
        </div>
      </div>
      <nav className="space-y-1">
        {items.map((item) => (
          <NavLink
            className={({ isActive }) =>
              cn(
                "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                isActive && "bg-accent text-accent-foreground"
              )
            }
            key={item.to}
            to={item.to}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
