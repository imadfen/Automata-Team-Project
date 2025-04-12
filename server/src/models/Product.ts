import mongoose, { Document, Schema } from "mongoose";

export interface IProduct extends Document {
  name: string;
  sku: string;
  quantity: number;
  category: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  location: string | null;
  height: number;
  width: number;
  weight: number;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    quantity: { type: Number, required: true, default: 0 },
    category: { type: String, required: true },
    status: {
      type: String,
      enum: ["In Stock", "Low Stock", "Out of Stock"],
      required: true,
      default: "Out of Stock",
    },
    location: { type: String, default: null },
    height: { type: Number, required: true, default: 0 },
    width: { type: Number, required: true, default: 0 },
    weight: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
  },
);

export const Product = mongoose.model<IProduct>("Product", productSchema);
