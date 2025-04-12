import { api } from "./config";

interface Product {
  _id: string;
  name: string;
  sku: string;
  quantity: number;
  category: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  lastUpdated: string;
  height: number;
  width: number;
  weight: number;
}

interface CreateProductInput {
  name: string;
  sku: string;
  quantity: number;
  category: string;
  height: number;
  width: number;
  weight: number;
}

export const productApi = {
  getAllProducts: () => api.get<Product[]>("/products/all"),
  getProductById: (id: string) => api.get<Product>(`/products/${id}`),
  createProduct: (data: CreateProductInput) =>
    api.post<Product>("/products/create", data),
  updateProduct: (id: string, data: Partial<CreateProductInput>) =>
    api.put<Product>(`/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
  updateProductStatus: (id: string, status: Product["status"]) =>
    api.patch(`/products/${id}/status`, { status }),
};
