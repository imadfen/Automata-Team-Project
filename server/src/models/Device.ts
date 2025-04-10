import mongoose, { Document, Schema } from "mongoose";

export interface IDevice extends Document {
  deviceName: string;
  batteryLevel: number;
  status: "idle" | "busy" | "offline" | "error";
  rfidTag?: string;
  type: "esp32" | "rfid" | "device" | "scanner";
  lastSeen: Date;
  location?: string;
  createdAt: Date;
}

const deviceSchema = new Schema<IDevice>({
  deviceName: {
    type: String,
    required: true,
    unique: true,
  },
  batteryLevel: {
    type: Number,
    min: 0,
    max: 100,
    default: 100,
  },
  status: {
    type: String,
    enum: ["idle", "busy", "offline", "error"],
    default: "offline",
  },
  rfidTag: {
    type: String,
    unique: true,
    sparse: true,
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
  location: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Update lastSeen timestamp before saving
deviceSchema.pre("save", function (next) {
  this.lastSeen = new Date();
  next();
});

export const Device = mongoose.model<IDevice>("Device", deviceSchema);
