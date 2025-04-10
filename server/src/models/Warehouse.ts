import mongoose from "mongoose";
import { ShelfPosition, StorageSlot, Package } from "../types/Warehouse.ts";

const shelfSchema = new mongoose.Schema({
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    orientation: { 
      type: String, 
      enum: ["HORIZONTAL", "VERTICAL"], 
      required: true 
    }
  },
  levels: { type: Number, required: true },
  slotsPerLevel: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const storageSlotSchema = new mongoose.Schema({
  shelfId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Shelf', 
    required: true 
  },
  level: { type: Number, required: true },
  position: { type: Number, required: true },
  side: { 
    type: String, 
    enum: ["FRONT", "BACK"], 
    required: true 
  },
  isOccupied: { type: Boolean, default: false }
});

const packageSchema = new mongoose.Schema({
  slotId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'StorageSlot', 
    default: null 
  },
  dimensions: {
    width: { type: Number, required: true },
    depth: { type: Number, required: true },
    height: { type: Number, required: true }
  },
  weight: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ["STORED", "IN_TRANSIT", "DELIVERED"], 
    required: true 
  },
  lastModified: { type: Date, default: Date.now }
});

// Indexes for better query performance
shelfSchema.index({ "position.x": 1, "position.y": 1 }, { unique: true });
storageSlotSchema.index({ shelfId: 1, level: 1, position: 1, side: 1 }, { unique: true });
packageSchema.index({ slotId: 1 });
packageSchema.index({ status: 1 });

export const ShelfModel = mongoose.model('Shelf', shelfSchema);
export const StorageSlotModel = mongoose.model('StorageSlot', storageSlotSchema);
export const PackageModel = mongoose.model('Package', packageSchema); 