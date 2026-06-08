import type { TrafficSource } from "../analytics/analytics.enums";

export interface DateRange {
  from: Date;
  to: Date;
}

export interface RevenuePoint {
  date: string;
  revenue: number;
}

export interface OrderStatusPoint {
  status: string;
  count: number;
}

export interface DashboardProduct {
  id: string;
  userId: string;
  externalId?: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  soldUnits: number;
  createdAt: string;
  revenue: number;
  unitsSold: number;
}

export interface ProductQuery {
  sort: "revenue" | "units";
  order: "asc" | "desc";
  search: string;
  page: number;
  limit: number;
}

export interface ProductPage {
  products: DashboardProduct[];
  total: number;
  page: number;
}

export interface FunnelStepResult {
  label: string;
  count: number;
  rate: number;
}

export interface TrafficSourceResult {
  source: TrafficSource;
  visits: number;
  percentage: number;
}

export interface TopCustomer {
  name: string;
  email: string;
  ltv: number;
}
