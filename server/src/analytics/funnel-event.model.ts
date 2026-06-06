import { Schema, model } from "mongoose";

import { funnelSteps, type FunnelStep } from "./analytics.enums";

export interface FunnelEventDocument {
  userId: Schema.Types.ObjectId;
  step: FunnelStep;
  count: number;
  date: Date;
}

const funnelEventSchema = new Schema<FunnelEventDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User"
    },
    step: {
      type: String,
      required: true,
      enum: funnelSteps
    },
    count: {
      type: Number,
      required: true,
      min: 0
    },
    date: {
      type: Date,
      required: true
    }
  },
  {
    versionKey: false
  }
);

funnelEventSchema.index({ userId: 1 });
funnelEventSchema.index({ date: -1 });

export const FunnelEventModel = model<FunnelEventDocument>("FunnelEvent", funnelEventSchema);
