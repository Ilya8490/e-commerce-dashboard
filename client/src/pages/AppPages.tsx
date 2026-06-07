import { BarChart3, Boxes, Gauge, Users, Waypoints } from "lucide-react";

import { PlaceholderPage } from "./PlaceholderPage";

export function DashboardPage() {
  return (
    <PlaceholderPage
      description="Overview KPIs, revenue trend, and operating highlights will connect to the dashboard API here."
      icon={Gauge}
      title="Dashboard"
    />
  );
}

export function ProductsPage() {
  return (
    <PlaceholderPage
      description="Product search, pagination, and revenue or unit sorting will appear in this workspace."
      icon={Boxes}
      title="Products"
    />
  );
}

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
