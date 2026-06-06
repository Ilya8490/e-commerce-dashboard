import { Schema, model } from "mongoose";

import { orderStatuses, trafficSources, type OrderStatus, type TrafficSource } from "./analytics.enums";

export interface OrderItemDocument {
  productId: Schema.Types.ObjectId;
  qty: number;
  price: number;
}

export interface OrderDocument {
  userId: Schema.Types.ObjectId;
  externalId?: string;
  customerId: Schema.Types.ObjectId;
  status: OrderStatus;
  total: number;
  items: OrderItemDocument[];
  source: TrafficSource;
  createdAt: Date;
}

const orderItemSchema = new Schema<OrderItemDocument>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Product"
    },
    qty: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    _id: false
  }
);

const orderSchema = new Schema<OrderDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User"
    },
    externalId: {
      type: String,
      trim: true
    },
    customerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Customer"
    },
    status: {
      type: String,
      required: true,
      enum: orderStatuses
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    items: {
      type: [orderItemSchema],
      required: true,
      default: []
    },
    source: {
      type: String,
      required: true,
      enum: trafficSources
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    versionKey: false
  }
);

orderSchema.index({ userId: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ userId: 1, externalId: 1 }, { sparse: true });

export const OrderModel = model<OrderDocument>("Order", orderSchema);
