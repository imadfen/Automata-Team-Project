import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import ProductFormModal from "@/components/products/ProductFormModal";
import DeleteConfirmDialog from "@/components/products/DeleteConfirmDialog";
import { productApi } from "@/api/product";

interface Product {
  _id: string;
  name: string;
  sku: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  quantity: number;
  category: string;
  lastUpdated: string;
  height: number;
  width: number;
  weight: number;
}

const statusColors = {
  "In Stock": "default",
  "Low Stock": "secondary",
  "Out of Stock": "destructive",
} as const;

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | undefined>(
    undefined
  );
  const [deleteProduct, setDeleteProduct] = useState<Product | undefined>(
    undefined
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProducts = async () => {
    try {
      const { data } = await productApi.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setModalOpen(true);
  };

  const handleAddNew = () => {
    setEditProduct(undefined);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditProduct(undefined);
  };

  const handleDelete = async () => {
    if (!deleteProduct) return;

    setIsDeleting(true);
    try {
      await productApi.deleteProduct(deleteProduct._id);
      fetchProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
    } finally {
      setIsDeleting(false);
      setDeleteProduct(undefined);
    }
  };

  const handleDeleteClick = (product: Product) => {
    setDeleteProduct(product);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus = !statusFilter || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {" "}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Inventory Management
        </h1>
        <Button onClick={handleAddNew}>Add Product</Button>
      </div>{" "}
      <ProductFormModal
        open={modalOpen}
        onClose={handleModalClose}
        onSuccess={fetchProducts}
        editProduct={editProduct}
      />
      <DeleteConfirmDialog
        open={!!deleteProduct}
        onClose={() => setDeleteProduct(undefined)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title={`Delete ${deleteProduct?.name}`}
        description="Are you sure you want to delete this product? This action cannot be undone."
      />
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">{statusFilter || "All Status"}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuItem onClick={() => setStatusFilter(null)}>
              All Status
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("In Stock")}>
              In Stock
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("Low Stock")}>
              Low Stock
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("Out of Stock")}>
              Out of Stock
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>{" "}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            {" "}
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Dimensions (cm)</TableHead>
              <TableHead>Weight (kg)</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-slate-500"
                >
                  Loading products...
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-slate-500"
                >
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product._id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[product.status]}>
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>{`${product.height} × ${product.width}`}</TableCell>
                  <TableCell>{product.weight}</TableCell>
                  <TableCell>
                    {new Date(
                      parseInt(product._id.substring(0, 8), 16) * 1000
                    ).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" onClick={() => handleEdit(product)}>
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(product)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
