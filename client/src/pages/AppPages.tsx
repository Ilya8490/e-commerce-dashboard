import { BarChart3, Users, Waypoints } from "lucide-react";

import { DashboardPage } from "./DashboardPage";
import { PlaceholderPage } from "./PlaceholderPage";
import { ProductsPage } from "./ProductsPage";
export { DashboardPage };
export { ProductsPage };

export function FunnelPage() {
  return (
    <PlaceholderPage
      description="Visit, product view, cart, checkout, and order conversion steps will be visualized here."
      icon={Waypoints}
      title="Funnel"
    />
  );
}

export function TrafficPage() {
  return (
    <PlaceholderPage
      description="Traffic source mix and visit share will be connected after the foundation is stable."
      icon={BarChart3}
      title="Traffic"
    />
  );
}

export function CustomersPage() {
  return (
    <PlaceholderPage
      description="New, returning, and top lifetime value customer views will live in this section."
      icon={Users}
      title="Customers"
    />
  );
}
