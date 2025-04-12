export const calculateProductStatus = (
  quantity: number,
): "In Stock" | "Low Stock" | "Out of Stock" => {
  if (quantity <= 0) return "Out of Stock";
  if (quantity <= 10) return "Low Stock";
  return "In Stock";
};
