import { useState, useCallback, useEffect } from 'react';
import { Position, ShelfData, GridCell, WarehouseState, CellType } from '../types/warehouse';
import { useRobotConfig } from './useRobotConfig';

// Default grid size if robot config is not available
const DEFAULT_GRID_SIZE = 12; // Default to 12x12 grid

export function useWarehouse() {
  const { config: robotConfig, loading: robotConfigLoading } = useRobotConfig();
  
  // Initialize state without a grid first
  const [state, setState] = useState<WarehouseState>({
    grid: [],
    shelves: new Map(),
    robotPosition: { x: 0, y: 0 },
    robotDirection: 90, // facing right
    selectedShelf: null,
    isDragging: false,
    isDirty: false,
    currentLayoutId: null,
    currentLayoutName: 'New Layout',
  });

  // Initialize or update the grid when robot configuration changes
  useEffect(() => {
    if (!robotConfigLoading) {
      // If robotConfig is available, use it, otherwise use default
      const gridSize = robotConfig 
        ? Math.floor(robotConfig.gridSize / robotConfig.gridCellSize) 
        : DEFAULT_GRID_SIZE;
      
      console.log('Creating grid with size:', gridSize, 'Robot config:', robotConfig);
      
      // Create a new grid with the correct size
      const newGrid = Array(gridSize).fill(null).map(() =>
        Array(gridSize).fill({ type: 'EMPTY' as CellType })
      );
      
      // Set robot position in the new grid
      newGrid[0][0] = { type: 'ROBOT' };
      
      // Update state with the new grid
      setState(prev => ({
        ...prev,
        grid: newGrid,
        robotPosition: { x: 0, y: 0 },
      }));
    }
  }, [robotConfig, robotConfigLoading]);

  // Check if a shelf placement is within grid boundaries
  const isWithinGridBoundaries = (
    position: Position,
    width: number,
    height: number,
    gridSize: number
  ): boolean => {
    const { x, y } = position;
    
    // Check if the shelf would extend beyond the grid boundaries
    if (x < 0 || y < 0 || x + width > gridSize || y + height > gridSize) {
      return false;
    }
    
    return true;
  };

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
    const gridSize = grid.length;
    
    // Mark the new shelf cells in the temporary grid
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        if (y + i < gridSize && x + j < gridSize) {
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
          if (sy < gridSize - 1 && tempGrid[sy + 1][sx + j].type !== 'SHELF') {
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
          if (sx < gridSize - 1 && tempGrid[sy + i][sx + 1].type !== 'SHELF') {
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

  // Helper function to check if a cell is adjacent to a shelf
  const isAdjacentToShelf = useCallback((
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
  }, []);

  // Helper to mark the state as dirty
  const markAsDirty = useCallback(() => {
    setState(prev => ({
      ...prev,
      isDirty: true
    }));
  }, []);

  const addShelf = useCallback((position: Position, orientation: 'HORIZONTAL' | 'VERTICAL') => {
    // Calculate shelf dimensions based on orientation
    const shelfWidth = orientation === 'HORIZONTAL' ? 3 : 1;
    const shelfHeight = orientation === 'HORIZONTAL' ? 1 : 3;
    const gridSize = state.grid.length;
    
    // Check if the shelf would fit within the grid boundaries
    if (!isWithinGridBoundaries(position, shelfWidth, shelfHeight, gridSize)) {
      console.warn('Cannot place shelf: would extend beyond grid boundaries');
      return null;
    }
    
    const shelfId = `shelf_${Date.now()}`;
    const shelfData: ShelfData = {
      id: shelfId,
      position,
      orientation,
      width: shelfWidth,
      height: shelfHeight,
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
          newGrid[y + i][x + j] = { type: 'SHELF', shelfId };
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
          if (y < gridSize - 1 && newGrid[y + 1][x + j].type !== 'SHELF') {
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
          if (x < gridSize - 1 && newGrid[y + i][x + 1].type !== 'SHELF') {
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

    // Mark as dirty after the state change
    markAsDirty();

    return shelfId;
  }, [state.grid, state.shelves, markAsDirty]);

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
      
      const gridSize = prev.grid.length;
      
      // Check if the shelf would fit within the grid boundaries at the new position
      if (!isWithinGridBoundaries(newPosition, shelf.width, shelf.height, gridSize)) {
        console.warn('Cannot move shelf: would extend beyond grid boundaries');
        return prev;
      }

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
          newGrid[y + i][x + j] = { type: 'SHELF', shelfId };
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
          if (y < gridSize - 1 && newGrid[y + 1][x + j].type !== 'SHELF') {
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
          if (x < gridSize - 1 && newGrid[y + i][x + 1].type !== 'SHELF') {
            newGrid[y + i][x + 1] = { type: 'AISLE' };
          }
        }
      }

      return {
        ...prev,
        grid: newGrid,
        shelves: newShelves,
        isDirty: true // Mark as dirty
      };
    });
  }, [isWithinGridBoundaries, wouldMakeShelvesInaccessible, isAdjacentToShelf]);

  // Update addObstacle to mark state as dirty
  const addObstacle = useCallback((position: Position) => {
    setState(prev => {
      const newGrid = [...prev.grid];
      const { x, y } = position;
      
      // Only add obstacle if the cell is empty
      if (newGrid[y][x].type !== 'EMPTY') {
        return prev;
      }
      
      newGrid[y][x] = { type: 'OBSTACLE' };
      
      return {
        ...prev,
        grid: newGrid,
        isDirty: true // Mark as dirty
      };
    });
  }, []);
  
  // Update removeObstacle to mark state as dirty
  const removeObstacle = useCallback((position: Position) => {
    setState(prev => {
      const newGrid = [...prev.grid];
      const { x, y } = position;
      
      // Only remove if it's an obstacle
      if (newGrid[y][x].type !== 'OBSTACLE') {
        return prev;
      }
      
      newGrid[y][x] = { type: 'EMPTY' };
      
      return {
        ...prev,
        grid: newGrid,
        isDirty: true // Mark as dirty
      };
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

  const deleteShelf = useCallback((shelfId: string) => {
    setState(prev => {
      // Check if the shelf exists
      const shelf = prev.shelves.get(shelfId);
      if (!shelf) return prev;

      // Create a new map without the shelf to be deleted
      const newShelves = new Map(prev.shelves);
      newShelves.delete(shelfId);

      // Create a new grid with the shelf and its aisles removed
      const newGrid = prev.grid.map(row =>
        row.map(cell => {
          if (cell.shelfId === shelfId || 
              (cell.type === 'AISLE' && shelf && isAdjacentToShelf(cell, shelf, prev.grid))) {
            return { type: 'EMPTY' };
          }
          return cell;
        })
      );

      return {
        ...prev,
        grid: newGrid,
        shelves: newShelves,
        isDirty: true // Mark as dirty
      };
    });
  }, [isAdjacentToShelf]);

  // Add a method to reset the dirty state (call this after saving)
  const markAsClean = useCallback(() => {
    setState(prev => ({
      ...prev,
      isDirty: false
    }));
  }, []);

  // Add methods to set and clear the current layout information
  const setCurrentLayout = useCallback((id: string | null, name: string) => {
    setState(prev => ({
      ...prev,
      currentLayoutId: id,
      currentLayoutName: name,
      isDirty: false
    }));
  }, []);

  // Add a method to load a layout from data
  const loadLayout = useCallback((layoutData: any) => {
    if (!layoutData) return;
    
    // If we have robot config, calculate gridSize based on that, otherwise use default
    const gridSize = robotConfig 
      ? Math.floor(robotConfig.gridSize / robotConfig.gridCellSize) 
      : DEFAULT_GRID_SIZE;
      
    // Create a new empty grid
    const newGrid = Array(gridSize).fill(null).map(() =>
      Array(gridSize).fill(null).map(() => ({ type: 'EMPTY' as CellType }))
    );
    
    // Place the robot
    const robotPos = layoutData.robotPosition || { x: 0, y: 0 };
    if (robotPos.y < gridSize && robotPos.x < gridSize) {
      newGrid[robotPos.y][robotPos.x] = { type: 'ROBOT' };
    } else {
      newGrid[0][0] = { type: 'ROBOT' };
    }
    
    // Create a Map for shelves
    const newShelves = new Map();
    
    // Load the grid data from the layout
    if (layoutData.grid && Array.isArray(layoutData.grid)) {
      for (let y = 0; y < Math.min(layoutData.grid.length, gridSize); y++) {
        const row = layoutData.grid[y];
        if (row && Array.isArray(row)) {
          for (let x = 0; x < Math.min(row.length, gridSize); x++) {
            const cell = row[x];
            if (cell && cell.type === 'OBSTACLE') {
              // Restore obstacle cells
              newGrid[y][x] = { type: 'OBSTACLE' };
            }
          }
        }
      }
    }
    
    // Add shelves to the grid
    if (layoutData.shelves && typeof layoutData.shelves === 'object') {
      for (const [shelfId, shelfData] of Object.entries(layoutData.shelves)) {
        const shelf = shelfData as ShelfData;
        if (!shelf || !shelf.position) continue;
        
        const { position, orientation, width, height } = shelf;
        const { x, y } = position;
        
        // Skip shelves that would be outside the grid
        if (x + width > gridSize || y + height > gridSize) continue;
        
        // Add shelf to the map
        newShelves.set(shelfId, {
          id: shelfId,
          position,
          orientation,
          width,
          height
        });
        
        // Update grid cells for shelf
        for (let i = 0; i < height; i++) {
          for (let j = 0; j < width; j++) {
            if (y + i < gridSize && x + j < gridSize) {
              newGrid[y + i][x + j] = { type: 'SHELF', shelfId };
            }
          }
        }
        
        // Add aisle cells around the shelf
        if (orientation === 'HORIZONTAL') {
          for (let j = 0; j < width; j++) {
            // Add aisle above if within grid and not a shelf
            if (y > 0 && newGrid[y - 1][x + j].type !== 'SHELF') {
              newGrid[y - 1][x + j] = { type: 'AISLE' };
            }
            // Add aisle below if within grid and not a shelf
            if (y + 1 < gridSize && newGrid[y + 1][x + j].type !== 'SHELF') {
              newGrid[y + 1][x + j] = { type: 'AISLE' };
            }
          }
        } else {
          for (let i = 0; i < height; i++) {
            // Add aisle to the left if within grid and not a shelf
            if (x > 0 && newGrid[y + i][x - 1].type !== 'SHELF') {
              newGrid[y + i][x - 1] = { type: 'AISLE' };
            }
            // Add aisle to the right if within grid and not a shelf
            if (x + 1 < gridSize && newGrid[y + i][x + 1].type !== 'SHELF') {
              newGrid[y + i][x + 1] = { type: 'AISLE' };
            }
          }
        }
      }
    }
    
    // Update state with the loaded layout
    setState({
      grid: newGrid,
      shelves: newShelves,
      robotPosition: layoutData.robotPosition || { x: 0, y: 0 },
      robotDirection: layoutData.robotDirection || 90,
      selectedShelf: null,
      isDragging: false,
      isDirty: false,
      currentLayoutId: layoutData._id || null,
      currentLayoutName: layoutData.name || 'Loaded Layout'
    });
  }, [robotConfig]);

  // Add a new function to toggle obstacles (add or remove)
  const toggleObstacle = useCallback((position: Position) => {
    setState(prev => {
      const newGrid = [...prev.grid].map(row => [...row]);
      const { x, y } = position;
      
      // Skip if position is out of bounds
      if (y < 0 || y >= newGrid.length || x < 0 || x >= newGrid[0].length) {
        return prev;
      }
      
      const cell = newGrid[y][x];
      
      // Only toggle if the cell is EMPTY or OBSTACLE
      if (cell.type === 'OBSTACLE') {
        // Remove obstacle
        newGrid[y][x] = { type: 'EMPTY' };
      } else if (cell.type === 'EMPTY') {
        // Add obstacle
        newGrid[y][x] = { type: 'OBSTACLE' };
      } else {
        // Cell is another type, don't change
        return prev;
      }
      
      return {
        ...prev,
        grid: newGrid,
        isDirty: true
      };
    });
  }, []);

  return {
    state,
    addShelf,
    removeShelf,
    moveShelf,
    deleteShelf,
    addObstacle,
    removeObstacle,
    moveRobotHome,
    markAsClean,
    setCurrentLayout,
    loadLayout,
    markAsDirty,
    toggleObstacle
  };
} 