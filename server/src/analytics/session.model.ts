import { Schema, model } from "mongoose";

import { devices, trafficSources, type Device, type TrafficSource } from "./analytics.enums";

export interface SessionDocument {
  userId: Schema.Types.ObjectId;
  date: Date;
  visits: number;
  source: TrafficSource;
  device: Device;
  bounced: boolean;
}

const sessionSchema = new Schema<SessionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User"
    },
    date: {
      type: Date,
      required: true
    },
    visits: {
      type: Number,
      required: true,
      min: 0
    },
    source: {
      type: String,
      required: true,
      enum: trafficSources
    },
    device: {
      type: String,
      required: true,
      enum: devices
    },
    bounced: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  {
    versionKey: false
  }
);

sessionSchema.index({ userId: 1 });
sessionSchema.index({ date: -1 });

export const SessionModel = model<SessionDocument>("Session", sessionSchema);
