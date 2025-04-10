import { Product, IProduct } from "../models/Product.js";

export const createProduct = async (
  productData: Omit<IProduct, keyof Document>,
) => {
  const product = new Product(productData);
  return await product.save();
};

export const getAllProducts = async () => {
  return await Product.find({});
};

export const getProductById = async (id: string) => {
  return await Product.findById(id);
};

export const updateProduct = async (
  id: string,
  productData: Partial<IProduct>,
) => {
  return await Product.findByIdAndUpdate(id, productData, { new: true });
};

export const deleteProduct = async (id: string) => {
  return await Product.findByIdAndDelete(id);
};

export const getProductBySku = async (sku: string) => {
  return await Product.findOne({ sku });
};

export const updateProductStatus = async (
  id: string,
  status: "in" | "out",
  location: string | null = null,
) => {
  return await Product.findByIdAndUpdate(
    id,
    { status, location },
    { new: true },
  );
};
