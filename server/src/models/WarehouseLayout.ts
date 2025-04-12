import { Schema, model } from 'mongoose';
import { Position } from '../types/warehouse';

interface IShelfData {
  id: string;
  position: Position;
  orientation: 'HORIZONTAL' | 'VERTICAL';
  width: number;
  height: number;
}

interface ICellData {
  type: string;
  shelfId?: string;
}

interface IWarehouseLayout {
  name: string;
  gridSize: number;
  grid: ICellData[][];
  shelves: Map<string, IShelfData>;
  robotPosition: Position;
  robotDirection: number;
  createdAt: Date;
  updatedAt: Date;
  isDefault?: boolean;
}

// Convert Map to Object for MongoDB storage
const shelfDataSchema = new Schema({
  id: { type: String, required: true },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  orientation: { 
    type: String, 
    required: true, 
    enum: ['HORIZONTAL', 'VERTICAL'] 
  },
  width: { type: Number, required: true },
  height: { type: Number, required: true }
});

const cellDataSchema = new Schema({
  type: { type: String, required: true },
  shelfId: { type: String }
});

const warehouseLayoutSchema = new Schema<IWarehouseLayout>({
  name: { type: String, required: true, unique: true },
  gridSize: { type: Number, required: true },
  grid: [[cellDataSchema]],
  shelves: { 
    type: Map,
    of: shelfDataSchema
  },
  robotPosition: {
    x: { type: Number, required: true, default: 0 },
    y: { type: Number, required: true, default: 0 }
  },
  robotDirection: { type: Number, required: true, default: 90 },
  isDefault: { type: Boolean, default: false },
}, { 
  timestamps: true,
  toJSON: { 
    transform: (doc, ret) => {
      // Convert shelves Map to Object for JSON serialization
      if (ret.shelves instanceof Map) {
        ret.shelves = Object.fromEntries(ret.shelves);
      }
      return ret;
    } 
  }
});

// Convert Object back to Map when retrieving from MongoDB
warehouseLayoutSchema.post('find', function(docs) {
  for (const doc of docs) {
    if (!(doc.shelves instanceof Map) && typeof doc.shelves === 'object') {
      doc.shelves = new Map(Object.entries(doc.shelves));
    }
  }
});

warehouseLayoutSchema.post('findOne', function(doc) {
  if (doc && !(doc.shelves instanceof Map) && typeof doc.shelves === 'object') {
    doc.shelves = new Map(Object.entries(doc.shelves));
  }
});

export const WarehouseLayout = model<IWarehouseLayout>('WarehouseLayout', warehouseLayoutSchema);
export type { IWarehouseLayout, IShelfData, ICellData }; 