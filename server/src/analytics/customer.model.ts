import { Schema, model } from "mongoose";

export interface CustomerDocument {
  userId: Schema.Types.ObjectId;
  externalId?: string;
  name: string;
  email: string;
  totalOrders: number;
  lifetimeValue: number;
  createdAt: Date;
}

const customerSchema = new Schema<CustomerDocument>(
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
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    totalOrders: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    lifetimeValue: {
      type: Number,
      required: true,
      min: 0,
      default: 0
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

customerSchema.index({ userId: 1 });
customerSchema.index({ createdAt: -1 });
customerSchema.index({ userId: 1, externalId: 1 }, { sparse: true });

export const CustomerModel = model<CustomerDocument>("Customer", customerSchema);
