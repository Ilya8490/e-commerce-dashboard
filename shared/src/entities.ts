export type EntityId = string;

export type CurrencyCode = "USD" | "EUR" | "GBP";

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export type TrafficSource = "organic" | "paid" | "direct" | "social" | "email";

export type Device = "desktop" | "mobile" | "tablet";

export type FunnelStep =
  | "visit"
  | "product_view"
  | "add_to_cart"
  | "checkout"
  | "order";

export interface Product {
  id: EntityId;
  userId: EntityId;
  externalId?: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  soldUnits: number;
  createdAt: string;
}

export interface Customer {
  id: EntityId;
  userId: EntityId;
  externalId?: string;
  name: string;
  email: string;
  totalOrders: number;
  lifetimeValue: number;
  createdAt: string;
}

export interface OrderLineItem {
  productId: EntityId;
  qty: number;
  price: number;
}

export interface Order {
  id: EntityId;
  userId: EntityId;
  externalId?: string;
  customerId: EntityId;
  status: OrderStatus;
  items: OrderLineItem[];
  total: number;
  source: TrafficSource;
  createdAt: string;
}

export interface User {
  id: EntityId;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: EntityId;
  userId: EntityId;
  date: string;
  visits: number;
  source: TrafficSource;
  device: Device;
  bounced: boolean;
}

export interface FunnelEvent {
  id: EntityId;
  userId: EntityId;
  step: FunnelStep;
  count: number;
  date: string;
}
