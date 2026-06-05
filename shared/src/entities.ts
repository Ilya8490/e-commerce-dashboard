export type EntityId = string;

export type CurrencyCode = "USD" | "EUR" | "GBP";

export type OrderStatus = "pending" | "paid" | "fulfilled" | "cancelled" | "refunded";

export type TrafficSource = "organic" | "paid" | "direct" | "social" | "email";

export type FunnelEventType =
  | "visit"
  | "product_view"
  | "add_to_cart"
  | "checkout"
  | "order";

export interface Product {
  id: EntityId;
  name: string;
  sku: string;
  price: number;
  currency: CurrencyCode;
  inventoryQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: EntityId;
  email: string;
  firstName: string;
  lastName: string;
  totalOrders: number;
  lifetimeValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderLineItem {
  productId: EntityId;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: EntityId;
  customerId: EntityId;
  status: OrderStatus;
  items: OrderLineItem[];
  subtotal: number;
  total: number;
  currency: CurrencyCode;
  placedAt: string;
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
  customerId?: EntityId;
  source: TrafficSource;
  startedAt: string;
  endedAt?: string;
}

export interface FunnelEvent {
  id: EntityId;
  sessionId: EntityId;
  customerId?: EntityId;
  productId?: EntityId;
  orderId?: EntityId;
  type: FunnelEventType;
  occurredAt: string;
}
