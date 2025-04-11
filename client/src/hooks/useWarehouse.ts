import { useState, useCallback, useEffect } from 'react';
import { Position, ShelfData, GridCell, WarehouseState, CellType } from '../types/warehouse';

const INITIAL_GRID_SIZE = 30;

export function useWarehouse() {
  const [state, setState] = useState<WarehouseState>({
    grid: Array(INITIAL_GRID_SIZE).fill(null).map(() =>
      Array(INITIAL_GRID_SIZE).fill({ type: 'EMPTY' as CellType })
    ),
    shelves: new Map(),
    robotPosition: { x: 0, y: 0 },
    robotDirection: 90, // facing right
    selectedShelf: null,
    isDragging: false,
  });

  // Initialize the robot's home position
  useEffect(() => {
    setState(prev => {
      const newGrid = [...prev.grid];
      newGrid[0][0] = { type: 'ROBOT' };
      return {
        ...prev,
        grid: newGrid,
        robotPosition: { x: 0, y: 0 },
      };
    });
  }, []);

  // Helper function to check if a shelf placement would make any existing shelves inaccessible
  const wouldMakeShelvesInaccessible = (
    position: Position,
    orientation: 'HORIZONTAL' | 'VERTICAL',
    width: number,
    height: number,
    grid: GridCell[][],
    shelves: Map<string, ShelfData>,
    excludeShelfId?: string
  ): boolean => {
    // Create a temporary grid to simulate the placement
    const tempGrid = grid.map(row => [...row]);
    const { x, y } = position;
    
    // Mark the new shelf cells in the temporary grid
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        if (y + i < INITIAL_GRID_SIZE && x + j < INITIAL_GRID_SIZE) {
          tempGrid[y + i][x + j] = { type: 'SHELF', shelfId: 'temp' };
        }
      }
    }
    
    // Check each existing shelf to see if it would become inaccessible
    for (const [shelfId, shelf] of shelves.entries()) {
      // Skip the shelf being moved (if any)
      if (shelfId === excludeShelfId) continue;
      
      const { position: shelfPos, orientation: shelfOrientation, width: shelfWidth, height: shelfHeight } = shelf;
      const { x: sx, y: sy } = shelfPos;
      
      // Check if the shelf has at least one accessible side
      let hasAccessibleSide = false;
      
      if (shelfOrientation === 'HORIZONTAL') {
        // Check if there's an aisle above or below
        for (let j = 0; j < shelfWidth; j++) {
          if (sy > 0 && tempGrid[sy - 1][sx + j].type !== 'SHELF') {
            hasAccessibleSide = true;
            break;
          }
          if (sy < INITIAL_GRID_SIZE - 1 && tempGrid[sy + 1][sx + j].type !== 'SHELF') {
            hasAccessibleSide = true;
            break;
          }
        }
      } else {
        // Check if there's an aisle to the left or right
        for (let i = 0; i < shelfHeight; i++) {
          if (sx > 0 && tempGrid[sy + i][sx - 1].type !== 'SHELF') {
            hasAccessibleSide = true;
            break;
          }
          if (sx < INITIAL_GRID_SIZE - 1 && tempGrid[sy + i][sx + 1].type !== 'SHELF') {
            hasAccessibleSide = true;
            break;
          }
        }
      }
      
      // If no accessible side is found, the placement would make this shelf inaccessible
      if (!hasAccessibleSide) {
        return true;
      }
    }
    
    return false;
  };

  const addShelf = useCallback((position: Position, orientation: 'HORIZONTAL' | 'VERTICAL') => {
    const shelfId = `shelf_${Date.now()}`;
    const shelfData: ShelfData = {
      id: shelfId,
      position,
      orientation,
      width: orientation === 'HORIZONTAL' ? 3 : 1,
      height: orientation === 'HORIZONTAL' ? 1 : 3,
    };

    // Check if this placement would make any existing shelves inaccessible
    if (wouldMakeShelvesInaccessible(
      position,
      orientation,
      shelfData.width,
      shelfData.height,
      state.grid,
      state.shelves
    )) {
      console.warn('Cannot place shelf: would make existing shelves inaccessible');
      return null;
    }

    setState(prev => {
      const newShelves = new Map(prev.shelves);
      newShelves.set(shelfId, shelfData);

      const newGrid = [...prev.grid];
      const { x, y } = position;
      
      // Update grid cells for shelf
      for (let i = 0; i < shelfData.height; i++) {
        for (let j = 0; j < shelfData.width; j++) {
          if (y + i < INITIAL_GRID_SIZE && x + j < INITIAL_GRID_SIZE) {
            newGrid[y + i][x + j] = { type: 'SHELF', shelfId };
          }
        }
      }

      // Add aisle cells only where needed (not adjacent to other shelves)
      if (orientation === 'HORIZONTAL') {
        for (let j = 0; j < shelfData.width; j++) {
          // Check if there's space above and no shelf there
          if (y > 0 && newGrid[y - 1][x + j].type !== 'SHELF') {
            newGrid[y - 1][x + j] = { type: 'AISLE' };
          }
          // Check if there's space below and no shelf there
          if (y < INITIAL_GRID_SIZE - 1 && newGrid[y + 1][x + j].type !== 'SHELF') {
            newGrid[y + 1][x + j] = { type: 'AISLE' };
          }
        }
      } else {
        for (let i = 0; i < shelfData.height; i++) {
          // Check if there's space to the left and no shelf there
          if (x > 0 && newGrid[y + i][x - 1].type !== 'SHELF') {
            newGrid[y + i][x - 1] = { type: 'AISLE' };
          }
          // Check if there's space to the right and no shelf there
          if (x < INITIAL_GRID_SIZE - 1 && newGrid[y + i][x + 1].type !== 'SHELF') {
            newGrid[y + i][x + 1] = { type: 'AISLE' };
          }
        }
      }

      return {
        ...prev,
        grid: newGrid,
        shelves: newShelves,
      };
    });

    return shelfId;
  }, [state.grid, state.shelves]);

  const removeShelf = useCallback((shelfId: string) => {
    setState(prev => {
      const shelf = prev.shelves.get(shelfId);
      if (!shelf) return prev;

      const newShelves = new Map(prev.shelves);
      newShelves.delete(shelfId);

      const newGrid = prev.grid.map(row =>
        row.map(cell =>
          cell.shelfId === shelfId ? { type: 'EMPTY' } : cell
        )
      );

      return {
        ...prev,
        grid: newGrid,
        shelves: newShelves,
        selectedShelf: prev.selectedShelf === shelfId ? null : prev.selectedShelf,
      };
    });
  }, []);

  const moveShelf = useCallback((shelfId: string, newPosition: Position) => {
    setState(prev => {
      const shelf = prev.shelves.get(shelfId);
      if (!shelf) return prev;

      // Check if this placement would make any existing shelves inaccessible
      if (wouldMakeShelvesInaccessible(
        newPosition,
        shelf.orientation,
        shelf.width,
        shelf.height,
        prev.grid,
        prev.shelves,
        shelfId // Exclude the shelf being moved from the check
      )) {
        console.warn('Cannot move shelf: would make existing shelves inaccessible');
        return prev;
      }

      // First remove shelf and aisles from old position
      const newGrid = prev.grid.map(row =>
        row.map(cell => {
          if (cell.shelfId === shelfId || 
              (cell.type === 'AISLE' && isAdjacentToShelf(cell, shelf, prev.grid))) {
            return { type: 'EMPTY' };
          }
          return cell;
        })
      );

      // Update shelf position
      const newShelves = new Map(prev.shelves);
      const updatedShelf = { ...shelf, position: newPosition };
      newShelves.set(shelfId, updatedShelf);

      // Add shelf to new position
      const { x, y } = newPosition;
      for (let i = 0; i < updatedShelf.height; i++) {
        for (let j = 0; j < updatedShelf.width; j++) {
          if (y + i < INITIAL_GRID_SIZE && x + j < INITIAL_GRID_SIZE) {
            newGrid[y + i][x + j] = { type: 'SHELF', shelfId };
          }
        }
      }

      // Add new aisles only where needed (not adjacent to other shelves)
      if (updatedShelf.orientation === 'HORIZONTAL') {
        for (let j = 0; j < updatedShelf.width; j++) {
          // Check if there's space above and no shelf there
          if (y > 0 && newGrid[y - 1][x + j].type !== 'SHELF') {
            newGrid[y - 1][x + j] = { type: 'AISLE' };
          }
          // Check if there's space below and no shelf there
          if (y < INITIAL_GRID_SIZE - 1 && newGrid[y + 1][x + j].type !== 'SHELF') {
            newGrid[y + 1][x + j] = { type: 'AISLE' };
          }
        }
      } else {
        for (let i = 0; i < updatedShelf.height; i++) {
          // Check if there's space to the left and no shelf there
          if (x > 0 && newGrid[y + i][x - 1].type !== 'SHELF') {
            newGrid[y + i][x - 1] = { type: 'AISLE' };
          }
          // Check if there's space to the right and no shelf there
          if (x < INITIAL_GRID_SIZE - 1 && newGrid[y + i][x + 1].type !== 'SHELF') {
            newGrid[y + i][x + 1] = { type: 'AISLE' };
          }
        }
      }

      return {
        ...prev,
        grid: newGrid,
        shelves: newShelves,
      };
    });
  }, []);

  // Helper function to check if a cell is adjacent to a shelf
  const isAdjacentToShelf = (
    cell: GridCell, 
    shelf: ShelfData, 
    grid: GridCell[][]
  ): boolean => {
    const { position: { x, y }, orientation, width, height } = shelf;
    
    if (orientation === 'HORIZONTAL') {
      // Check cells above and below the shelf
      for (let j = 0; j < width; j++) {
        if (y > 0 && grid[y - 1][x + j] === cell) return true;
        if (y < grid.length - 1 && grid[y + 1][x + j] === cell) return true;
      }
    } else {
      // Check cells to the left and right of the shelf
      for (let i = 0; i < height; i++) {
        if (x > 0 && grid[y + i][x - 1] === cell) return true;
        if (x < grid[0].length - 1 && grid[y + i][x + 1] === cell) return true;
      }
    }
    return false;
  };

  const addObstacle = useCallback((position: Position) => {
    setState(prev => {
      const newGrid = [...prev.grid];
      newGrid[position.y][position.x] = { type: 'OBSTACLE' };
      return { ...prev, grid: newGrid };
    });
  }, []);

  const removeObstacle = useCallback((position: Position) => {
    setState(prev => {
      const newGrid = [...prev.grid];
      newGrid[position.y][position.x] = { type: 'EMPTY' };
      return { ...prev, grid: newGrid };
    });
  }, []);

  const moveRobotHome = useCallback((newPosition: Position) => {
    setState(prev => {
      // Find the current robot home position
      let currentHomePos: Position | null = null;
      for (let y = 0; y < prev.grid.length; y++) {
        for (let x = 0; x < prev.grid[y].length; x++) {
          if (prev.grid[y][x].type === 'ROBOT') {
            currentHomePos = { x, y };
            break;
          }
        }
        if (currentHomePos) break;
      }

      if (!currentHomePos) return prev;

      // Create a new grid
      const newGrid = prev.grid.map(row => [...row]);

      // Clear the old home position
      newGrid[currentHomePos.y][currentHomePos.x] = { type: 'EMPTY' };

      // Set the new home position
      newGrid[newPosition.y][newPosition.x] = { type: 'ROBOT' };

      return {
        ...prev,
        grid: newGrid,
        robotPosition: newPosition,
      };
    });
  }, []);

  return {
    state,
    addShelf,
    removeShelf,
    moveShelf,
    addObstacle,
    removeObstacle,
    moveRobotHome,
  };
} 