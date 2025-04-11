import config from "../robotConfig.json" assert { type: "json" };
import { Direction, Point } from "../types/RobotGeometry";
import {
  Shelf,
  StorageSlot,
  Package,
  WarehouseGrid,
  ShelfPosition,
  Position2D,
  ShelfSide,
} from "../types/Warehouse";
import getShortestPath from "../utils/getShortestPath";
import generateInstructions from "../utils/generateRobotInstructions";

export class WarehouseService {
  private grid: WarehouseGrid;
  private shelves: Map<string, Shelf>;
  private slots: Map<string, StorageSlot>;
  private packages: Map<string, Package>;

  constructor() {
    this.shelves = new Map();
    this.slots = new Map();
    this.packages = new Map();
    this.grid = this.initializeGrid();
  }

  private initializeGrid(): WarehouseGrid {
    // Initialize with default size - can be adjusted based on actual warehouse dimensions
    const width = config.GridSize;
    const height = config.GridSize;

    return {
      dimensions: { width, height },
      cells: Array(height)
        .fill(null)
        .map(() => Array(width).fill("EMPTY")),
    };
  }

  public addShelf(position: ShelfPosition): string {
    const shelfId = `shelf_${Date.now()}`;
    const shelf: Shelf = {
      id: shelfId,
      position,
      levels: 3, // Default 3 levels as shown in the technical drawing
      slotsPerLevel: Math.floor(30 / config.GridCellSize), // Based on shelf length
    };

    // Update grid with shelf and required aisle space
    this.updateGridWithShelf(shelf);

    // Create storage slots for both sides of the shelf
    this.createStorageSlots(shelf);

    this.shelves.set(shelfId, shelf);
    return shelfId;
  }

  private updateGridWithShelf(shelf: Shelf) {
    const { x, y, orientation } = shelf.position;
    const shelfDepthCells = Math.ceil(
      config.ShelfDimensions.depth / config.GridCellSize
    );
    const shelfWidthCells = Math.ceil(
      config.ShelfDimensions.width / config.GridCellSize
    );

    if (orientation === "HORIZONTAL") {
      // Mark shelf cells
      for (let i = 0; i < shelfWidthCells; i++) {
        this.grid.cells[y][x + i] = "SHELF";
      }

      // Mark aisle cells
      const aisleWidth = Math.ceil(config.AisleWidth / config.GridCellSize);
      for (let i = 0; i < shelfWidthCells; i++) {
        if (y > 0) this.grid.cells[y - 1][x + i] = "AISLE"; // Front aisle
        if (y < this.grid.dimensions.height - 1) {
          this.grid.cells[y + 1][x + i] = "AISLE"; // Back aisle
        }
      }
    } else {
      // Similar logic for vertical orientation
      for (let i = 0; i < shelfDepthCells; i++) {
        this.grid.cells[y + i][x] = "SHELF";
      }

      const aisleWidth = Math.ceil(config.AisleWidth / config.GridCellSize);
      for (let i = 0; i < shelfDepthCells; i++) {
        if (x > 0) this.grid.cells[y + i][x - 1] = "AISLE"; // Left aisle
        if (x < this.grid.dimensions.width - 1) {
          this.grid.cells[y + i][x + 1] = "AISLE"; // Right aisle
        }
      }
    }
  }

  private createStorageSlots(shelf: Shelf) {
    for (let level = 0; level < shelf.levels; level++) {
      for (let pos = 0; pos < shelf.slotsPerLevel; pos++) {
        // Create front side slot
        const frontSlotId = `slot_${shelf.id}_${level}_${pos}_FRONT`;
        this.slots.set(frontSlotId, {
          id: frontSlotId,
          shelfId: shelf.id,
          level,
          position: pos,
          side: "FRONT",
          isOccupied: false,
        });

        // Create back side slot
        const backSlotId = `slot_${shelf.id}_${level}_${pos}_BACK`;
        this.slots.set(backSlotId, {
          id: backSlotId,
          shelfId: shelf.id,
          level,
          position: pos,
          side: "BACK",
          isOccupied: false,
        });
      }
    }
  }

  public findPathToSlot(slotId: string): Direction[] | null {
    const slot = this.slots.get(slotId);
    if (!slot) return null;

    const shelf = this.shelves.get(slot.shelfId);
    if (!shelf) return null;

    // Convert shelf position to appropriate aisle position based on slot side
    const targetPosition = this.getAislePositionForSlot(
      shelf.position,
      slot.side
    );

    // Get path from robot home (0,0) to target position
    return getShortestPath(
      this.convertGridToPathfinding(),
      [0, 0],
      [targetPosition.y, targetPosition.x]
    );
  }

  private getAislePositionForSlot(
    shelfPos: ShelfPosition,
    side: ShelfSide
  ): Position2D {
    if (shelfPos.orientation === "HORIZONTAL") {
      return {
        x: shelfPos.x,
        y: shelfPos.y + (side === "FRONT" ? -1 : 1),
      };
    } else {
      return {
        x: shelfPos.x + (side === "FRONT" ? -1 : 1),
        y: shelfPos.y,
      };
    }
  }

  private convertGridToPathfinding(): string[][] {
    return this.grid.cells.map((row) =>
      row.map((cell) => {
        switch (cell) {
          case "EMPTY":
          case "AISLE":
            return ".";
          case "SHELF":
          case "OBSTACLE":
            return "X";
          default:
            return "X";
        }
      })
    );
  }

  public getGridVisualization(): string {
    const symbols = {
      EMPTY: ".",
      SHELF: "█",
      OBSTACLE: "X",
      AISLE: "·",
      HOME: "H", // Robot's home position
    };

    // Create a copy of the grid for visualization
    const visualGrid = this.grid.cells.map((row) => [...row]);

    // Mark home position
    visualGrid[0][0] = "HOME";

    // Convert to string representation
    return visualGrid
      .map((row) =>
        row.map((cell) => symbols[cell as keyof typeof symbols]).join(" ")
      )
      .join("\n");
  }
}
