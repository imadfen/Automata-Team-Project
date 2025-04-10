import express, { RequestHandler } from "express";
import { auth } from "../middlewares/auth.js";
import {
  createProductController,
  getAllProductsController,
  getProductByIdController,
  updateProductController,
  deleteProductController,
  getProductBySkuController,
  updateProductStatusController,
} from "../controllers/productController.js";

const router = express.Router();

// Protected routes - require authentication
router.post("/create", auth, createProductController as RequestHandler);
router.get("/all", auth, getAllProductsController as RequestHandler);
router.get("/:id", auth, getProductByIdController as RequestHandler);
router.put("/:id", auth, updateProductController as RequestHandler);
router.delete("/:id", auth, deleteProductController as RequestHandler);
router.get("/sku/:sku", auth, getProductBySkuController as RequestHandler);
router.patch(
  "/:id/status",
  auth,
  updateProductStatusController as RequestHandler,
);

export default router;
