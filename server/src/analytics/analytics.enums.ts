export const orderStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;

export const trafficSources = ["organic", "paid", "direct", "social", "email"] as const;

export const devices = ["desktop", "mobile", "tablet"] as const;

export const funnelSteps = ["visit", "product_view", "add_to_cart", "checkout", "order"] as const;

export type OrderStatus = (typeof orderStatuses)[number];
export type TrafficSource = (typeof trafficSources)[number];
export type Device = (typeof devices)[number];
export type FunnelStep = (typeof funnelSteps)[number];
