import React, { useState, useCallback, useEffect } from "react";
import styled from "@emotion/styled";
import { WarehouseGrid } from "./WarehouseGrid";
import { useWarehouse } from "../../hooks/useWarehouse";
import { Position } from "../../types/warehouse";
import { useRobotConfig } from "../../hooks/useRobotConfig";
import { warehouseLayoutService } from "../../services/warehouseLayoutService";
import { SaveLayoutDialog } from "./SaveLayoutDialog";

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  background-color: #f8fafc;
  min-height: 100vh;
  height: auto;
  gap: 1.5rem;
  overflow: visible;
`;

const Toolbar = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  align-items: center;
`;

const GridContainer = styled.div`
  flex: 1;
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  height: auto;
  width: 100%;
  overflow: visible;
  min-height: 500px;
  position: relative;
`;

const ContextMenu = styled.div`
  position: fixed;
  width: 150px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  overflow: hidden;
`;

const MenuItem = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f3f4f6;
  }
  
  &.delete {
    color: #dc2626;
  }
`;

const Button = styled.button<{
  isActive?: boolean;
  variant?: "primary" | "danger" | "success";
}>`
  background-color: ${(props) => {
    if (props.variant === "danger")
      return props.isActive ? "#dc2626" : "#ef4444";
    if (props.variant === "success")
      return props.isActive ? "#15803d" : "#22c55e";
    return props.isActive ? "#1d4ed8" : "#3b82f6";
  }};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-weight: 500;
  transition: background-color 0.2s;
  white-space: nowrap;
  opacity: ${props => props.disabled ? 0.6 : 1};

  &:hover {
    filter: ${props => props.disabled ? 'none' : 'brightness(0.95)'};
  }

  &:active {
    filter: ${props => props.disabled ? 'none' : 'brightness(0.9)'};
  }
`;

const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-right: auto;
`;

const LayoutTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  .layout-name {
    font-weight: 600;
  }
  
  .dirty-indicator {
    color: #f59e0b;
    font-size: 1.25rem;
  }
`;

const LoadingIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 1.25rem;
  color: #6b7280;
`;

// Add a new styled component for the scale key
const ScaleKey = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 10px 14px;
  border-radius: 4px;
  border: 1px solid #94a3b8;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
`;

const ScaleTitle = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
  color: #1e293b;
`;

const ScaleBar = styled.div`
  display: flex;
  flex-direction: column;
  margin: 4px 0;
`;

const ScaleRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 6px;
`;

const ScaleCell = styled.div<{isActive?: boolean}>`
  width: 24px;
  height: 24px;
  border: 1px solid #94a3b8;
  background-color: ${props => props.isActive ? '#e5e7eb' : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #4b5563;
`;

const ScaleLine = styled.div`
  height: 2px;
  background-color: #1e293b;
  width: 100%;
  margin: 4px 0;
  position: relative;
  
  &::before, &::after {
    content: '';
    position: absolute;
    height: 6px;
    width: 1px;
    background-color: #1e293b;
  }
  
  &::before {
    left: 0;
    top: -2px;
  }
  
  &::after {
    right: 0;
    top: -2px;
  }
`;

const ScaleLabel = styled.div`
  font-size: 10px;
  color: #4b5563;
  text-align: center;
  margin-top: 4px;
  line-height: 1.2;
`;

// Add scale key component
const GridScaleKey: React.FC<{ cellSize: number; gridSize: number }> = ({ cellSize, gridSize }) => {
  return (
    <ScaleKey>
      <ScaleTitle>Scale Key</ScaleTitle>
      <ScaleBar>
        <ScaleRow>
          <ScaleCell isActive={true}>1</ScaleCell>
          <ScaleCell>2</ScaleCell>
          <ScaleCell>3</ScaleCell>
        </ScaleRow>
        <ScaleLine />
        <ScaleLabel>
          1 cell = {cellSize} cm
          <br />
          Grid size: {gridSize} cm × {gridSize} cm
        </ScaleLabel>
      </ScaleBar>
    </ScaleKey>
  );
};

const WarehouseDashboard: React.FC = () => {
  const { 
    state, 
    addShelf, 
    moveShelf, 
    deleteShelf, 
    addObstacle, 
    removeObstacle,
    markAsClean,
    setCurrentLayout,
    toggleObstacle,
    loadLayout
  } = useWarehouse();

  const { config: robotConfig, loading: robotConfigLoading } = useRobotConfig();

  const [selectedTool, setSelectedTool] = useState<"SHELF" | "OBSTACLE" | null>(null);
  const [shelfOrientation, setShelfOrientation] = useState<"HORIZONTAL" | "VERTICAL">("HORIZONTAL");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [layoutLoaded, setLayoutLoaded] = useState(false);
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    shelfId: string | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    shelfId: null,
  });

  // Load the layout when the dashboard initializes
  useEffect(() => {
    async function loadSavedLayout() {
      if (!layoutLoaded && !state.isDirty) {
        try {
          // First try to load any existing layout
          const layouts = await warehouseLayoutService.getAllLayouts();
          
          if (layouts && layouts.length > 0) {
            // Use the first layout (there should only be one)
            const layout = layouts[0];
            loadLayout(layout);
            setLayoutLoaded(true);
          }
        } catch (error) {
          console.error('Error loading warehouse layout:', error);
        }
      }
    }
    
    if (!robotConfigLoading && state.grid.length > 0) {
      loadSavedLayout();
    }
  }, [robotConfigLoading, state.grid.length, state.isDirty, layoutLoaded, loadLayout]);

  const handleCellClick = (position: Position) => {
    if (selectedTool === "SHELF") {
      addShelf(position, shelfOrientation);
    } else if (selectedTool === "OBSTACLE") {
      toggleObstacle(position);
    }
  };

  const handleDragStart = (position: Position) => {
    const cell = state.grid[position.y][position.x];
    if (cell.shelfId) {
      state.selectedShelf = cell.shelfId;
    }
  };

  const handleDrop = (position: Position) => {
    if (state.selectedShelf) {
      moveShelf(state.selectedShelf, position);
      state.selectedShelf = null;
    }
  };
  
  const handleContextMenu = useCallback((e: React.MouseEvent, position: Position) => {
    e.preventDefault();
    
    const cell = state.grid[position.y][position.x];
    if (cell.type === 'SHELF' && cell.shelfId) {
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        shelfId: cell.shelfId,
      });
    }
  }, [state.grid]);
  
  const handleDeleteShelf = useCallback((shelfId: string) => {
    deleteShelf(shelfId);
    // Also close context menu if it's open
    setContextMenu(prev => ({ ...prev, visible: false }));
  }, [deleteShelf]);
  
  const handleContextMenuDelete = useCallback(() => {
    if (contextMenu.shelfId) {
      deleteShelf(contextMenu.shelfId);
      setContextMenu({ ...contextMenu, visible: false });
    }
  }, [contextMenu, deleteShelf]);
  
  // Close context menu when clicking elsewhere
  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  }, []);
  
  // Event listener to close context menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(prev => ({ ...prev, visible: false }));
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Handle opening the save dialog
  const handleSaveClick = useCallback(() => {
    setSaveDialogOpen(true);
  }, []);

  // Handle saving the layout
  const handleSave = useCallback(async (name: string, isDefault: boolean) => {
    setIsSaving(true);
    try {
      if (state.currentLayoutId) {
        // Update existing layout
        const updatedLayout = await warehouseLayoutService.updateLayout(
          state.currentLayoutId,
          state,
          name,
          isDefault
        );
        setCurrentLayout(updatedLayout._id ?? null, updatedLayout.name);
      } else {
        // Create new layout
        const newLayout = await warehouseLayoutService.createLayout(
          state,
          name,
          isDefault
        );
        setCurrentLayout(newLayout._id ?? null, newLayout.name);
      }
      markAsClean();
      setSaveDialogOpen(false);
    } catch (error) {
      console.error('Error saving warehouse layout:', error);
      alert('Failed to save warehouse layout. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [state, state.currentLayoutId, setCurrentLayout, markAsClean]);

  // Handle canceling the save dialog
  const handleCancelSave = useCallback(() => {
    setSaveDialogOpen(false);
  }, []);

  // Check if data is ready to render
  const isLoading = robotConfigLoading || !state.grid.length;
  
  if (isLoading) {
    return (
      <DashboardContainer>
        <LoadingIndicator>Loading warehouse grid...</LoadingIndicator>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer onClick={handleCloseContextMenu}>
      <Toolbar>
        <LayoutTitle>
          <span className="layout-name">{state.currentLayoutName}</span>
          {state.isDirty && <span className="dirty-indicator">*</span>}
        </LayoutTitle>

        <Button
          variant="success"
          onClick={handleSaveClick}
          disabled={!state.isDirty}
        >
          Save Layout
        </Button>

        <Button
          isActive={selectedTool === "SHELF"}
          onClick={() =>
            setSelectedTool((tool) => (tool === "SHELF" ? null : "SHELF"))
          }
        >
          {selectedTool === "SHELF" ? "Cancel Shelf" : "Add Shelf"}
        </Button>

        {selectedTool === "SHELF" && (
          <Button
            onClick={() =>
              setShelfOrientation((orient) =>
                orient === "HORIZONTAL" ? "VERTICAL" : "HORIZONTAL"
              )
            }
          >
            {shelfOrientation === "HORIZONTAL"
              ? "Switch to Vertical"
              : "Switch to Horizontal"}
          </Button>
        )}

        <Button
          variant="danger"
          isActive={selectedTool === "OBSTACLE"}
          onClick={() =>
            setSelectedTool((tool) => (tool === "OBSTACLE" ? null : "OBSTACLE"))
          }
        >
          {selectedTool === "OBSTACLE" ? "Cancel Obstacle" : "Add Obstacle"}
        </Button>
      </Toolbar>

      <GridContainer>
        <WarehouseGrid
          grid={state.grid}
          config={{
            cellSize: robotConfig?.gridCellSize || 25,
            rows: state.grid.length,
            cols: state.grid[0].length,
          }}
          onCellClick={handleCellClick}
          onCellDragStart={handleDragStart}
          onCellDrop={handleDrop}
          onCellContextMenu={handleContextMenu}
          onDeleteShelf={handleDeleteShelf}
        />
      </GridContainer>
      
      {/* Context Menu */}
      {contextMenu.visible && (
        <ContextMenu
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={e => e.stopPropagation()}
        >
          <MenuItem className="delete" onClick={handleContextMenuDelete}>
            Delete Shelf
          </MenuItem>
        </ContextMenu>
      )}

      {/* Save Layout Dialog */}
      <SaveLayoutDialog
        isOpen={saveDialogOpen}
        initialName={state.currentLayoutName}
        onSave={handleSave}
        onCancel={handleCancelSave}
      />

      {/* Scale Key */}
      <GridScaleKey cellSize={robotConfig?.gridCellSize || 25} gridSize={robotConfig?.gridSize || 120} />
    </DashboardContainer>
  );
}; 

export default WarehouseDashboard;
