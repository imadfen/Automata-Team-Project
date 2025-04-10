import { Request, Response } from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductBySku,
  updateProductStatus,
} from "../services/productService.js";

export const createProductController = async (req: Request, res: Response) => {
  try {
    const product = await createProduct(req.body);
    res.status(201).json(product);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ error: "SKU already exists" });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

export const getAllProductsController = async (req: Request, res: Response) => {
  try {
    const products = await getAllProducts();
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductByIdController = async (req: Request, res: Response) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProductController = async (req: Request, res: Response) => {
  try {
    const product = await updateProduct(req.params.id, req.body);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ error: "SKU already exists" });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

export const deleteProductController = async (req: Request, res: Response) => {
  try {
    const product = await deleteProduct(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductBySkuController = async (
  req: Request,
  res: Response,
) => {
  try {
    const product = await getProductBySku(req.params.sku);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProductStatusController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { status, location } = req.body;
    const product = await updateProductStatus(req.params.id, status, location);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
