import { Schema, model } from "mongoose";

export interface ProductDocument {
  userId: Schema.Types.ObjectId;
  externalId?: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  soldUnits: number;
  createdAt: Date;
}

const productSchema = new Schema<ProductDocument>(
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
    category: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    stock: {
      type: Number,
      required: true,
      min: 0
    },
    soldUnits: {
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

productSchema.index({ userId: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ userId: 1, externalId: 1 }, { sparse: true });

export const ProductModel = model<ProductDocument>("Product", productSchema);
