export type CellType = 'EMPTY' | 'SHELF' | 'ROBOT' | 'OBSTACLE' | 'AISLE';

export interface Position {
  x: number;
  y: number;
}

export interface ShelfData {
  id: string;
  position: Position;
  orientation: 'HORIZONTAL' | 'VERTICAL';
  width: number;
  height: number;
}

export interface GridCell {
  type: CellType;
  shelfId?: string;
}

export interface WarehouseState {
  grid: GridCell[][];
  shelves: Map<string, ShelfData>;
  robotPosition: Position;
  robotDirection: number; // 0-359 degrees
  selectedShelf: string | null;
  isDragging: boolean;
}

export interface GridConfig {
  cellSize: number; // pixels
  rows: number;
  cols: number;
} 