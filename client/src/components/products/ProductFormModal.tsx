import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { productApi } from "@/api/product";

interface Product {
  _id: string;
  name: string;
  sku: string;
  quantity: number;
  category: string;
  height: number;
  width: number;
  weight: number;
}

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editProduct?: Product;
}

export default function ProductFormModal({
  open,
  onClose,
  onSuccess,
  editProduct,
}: ProductFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: editProduct?.name || "",
    sku: editProduct?.sku || "",
    quantity: editProduct?.quantity || 0,
    category: editProduct?.category || "",
    height: editProduct?.height || 0,
    width: editProduct?.width || 0,
    weight: editProduct?.weight || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editProduct) {
        await productApi.updateProduct(editProduct._id, formData);
      } else {
        await productApi.createProduct(formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to save product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {editProduct ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter product name"
              className="w-full"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={formData.sku}
              onChange={(e) =>
                setFormData({ ...formData, sku: e.target.value })
              }
              placeholder="Enter SKU number"
              className="w-full"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              placeholder="Enter product category"
              className="w-full"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: Number(e.target.value) })
                }
                placeholder="0"
                min="0"
                className="w-full"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight}
                onChange={(e) =>
                  setFormData({ ...formData, weight: Number(e.target.value) })
                }
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                value={formData.height}
                onChange={(e) =>
                  setFormData({ ...formData, height: Number(e.target.value) })
                }
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="width">Width (cm)</Label>
              <Input
                id="width"
                type="number"
                value={formData.width}
                onChange={(e) =>
                  setFormData({ ...formData, width: Number(e.target.value) })
                }
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full"
                required
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : editProduct
                ? "Save Changes"
                : "Add Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
