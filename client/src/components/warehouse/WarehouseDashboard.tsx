import React, { useState } from "react";
import styled from "@emotion/styled";
import { WarehouseGrid } from "./WarehouseGrid";
import { useWarehouse } from "../../hooks/useWarehouse";
import { Position } from "../../types/warehouse";
import { useRobotConfig } from "../../hooks/useRobotConfig";

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background-color: #f8fafc;
  min-height: 100vh;
  gap: 1rem;
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
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  overflow-x: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 0;
`;

const Button = styled.button<{
  isActive?: boolean;
  variant?: "primary" | "danger";
}>`
  background-color: ${(props) => {
    if (props.variant === "danger")
      return props.isActive ? "#dc2626" : "#ef4444";
    return props.isActive ? "#1d4ed8" : "#3b82f6";
  }};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
  white-space: nowrap;

  &:hover {
    filter: brightness(0.95);
  }

  &:active {
    filter: brightness(0.9);
  }
`;

const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-right: auto;
`;

const LoadingIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 1.25rem;
  color: #6b7280;
`;

const WarehouseDashboard: React.FC = () => {
  const { state, addShelf, moveShelf, addObstacle, removeObstacle } =
    useWarehouse();

  const { config: robotConfig, loading: robotConfigLoading } = useRobotConfig();

  const [selectedTool, setSelectedTool] = useState<"SHELF" | "OBSTACLE" | null>(
    null
  );
  const [shelfOrientation, setShelfOrientation] = useState<
    "HORIZONTAL" | "VERTICAL"
  >("HORIZONTAL");

  const handleCellClick = (position: Position) => {
    if (selectedTool === "SHELF") {
      addShelf(position, shelfOrientation);
    } else if (selectedTool === "OBSTACLE") {
      const cell = state.grid[position.y][position.x];
      if (cell.type === "OBSTACLE") {
        removeObstacle(position);
      } else {
        addObstacle(position);
      }
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

  if (robotConfigLoading) {
    return (
      <DashboardContainer>
        <LoadingIndicator>Loading robot configuration...</LoadingIndicator>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Toolbar>
        <Title>Warehouse Layout Editor</Title>
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
        />
      </GridContainer>
    </DashboardContainer>
  );
};

export default WarehouseDashboard;
