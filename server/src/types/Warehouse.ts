export type ShelfSide = "FRONT" | "BACK";

export interface Position2D {
  x: number;  // grid coordinates
  y: number;
}

export interface ShelfPosition extends Position2D {
  orientation: "HORIZONTAL" | "VERTICAL";  // determines which sides are accessible
}

export interface Shelf {
  id: string;
  position: ShelfPosition;
  levels: number;  // number of vertical storage levels
  slotsPerLevel: number;  // number of storage slots per level on each side
}

export interface StorageSlot {
  id: string;
  shelfId: string;
  level: number;  // vertical level starting from 0
  position: number;  // horizontal position in the shelf
  side: ShelfSide;
  isOccupied: boolean;
}

export interface Package {
  id: string;
  slotId: string | null;  // null if package is not stored
  dimensions: {
    width: number;
    depth: number;
    height: number;
  };
  weight: number;
  status: "STORED" | "IN_TRANSIT" | "DELIVERED";
  lastModified: Date;
}

export interface WarehouseGrid {
  dimensions: {
    width: number;  // number of cells
    height: number;
  };
  cells: ("EMPTY" | "SHELF" | "OBSTACLE" | "AISLE" | "HOME")[][];
} 