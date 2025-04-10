import mongoose, { Document, Schema } from "mongoose";

export interface IProduct extends Document {
  name: string;
  type: string;
  height: number;
  width: number;
  weight: number;
  sku: string;
  status: "in" | "out";
  location: string | null;
  qrCode: string;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    height: { type: Number, required: true },
    width: { type: Number, required: true },
    weight: { type: Number, required: true },
    sku: { type: String, required: true, unique: true },
    status: { type: String, enum: ["in", "out"], required: true },
    location: { type: String, default: null },
    qrCode: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

export const Product = mongoose.model<IProduct>("Product", productSchema);
