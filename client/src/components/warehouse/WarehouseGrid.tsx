import React, { useCallback } from 'react';
import styled from '@emotion/styled';
import { GridCell, Position, GridConfig } from '../../types/warehouse';
import { GridSquare } from './GridSquare';
import { useRobotConfig } from '../../hooks/useRobotConfig';

interface Props {
  grid: GridCell[][];
  config: GridConfig;
  onCellClick?: (position: Position) => void;
  onCellDragStart?: (position: Position) => void;
  onCellDragOver?: (position: Position) => void;
  onCellDrop?: (position: Position) => void;
}

const GridContainer = styled.div<{ cellSize: number }>`
  display: grid;
  gap: 0;
  background-color: #e5e7eb;
  padding: 0;
  border: 1px solid #94a3b8;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  width: 100%;
  aspect-ratio: 1;
  margin: 0 auto;
  overflow: auto;

  & > * {
    width: 100%;
    height: 100%;
    border: 1px solid #94a3b8;
  }
`;

export const WarehouseGrid: React.FC<Props> = ({
  grid,
  config,
  onCellClick,
  onCellDragStart,
  onCellDragOver,
  onCellDrop,
}) => {
  const { config: robotConfig, loading } = useRobotConfig();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    const x = parseInt(target.getAttribute('data-x') || '0');
    const y = parseInt(target.getAttribute('data-y') || '0');
    onCellDragOver?.({ x, y });
  }, [onCellDragOver]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    const x = parseInt(target.getAttribute('data-x') || '0');
    const y = parseInt(target.getAttribute('data-y') || '0');
    onCellDrop?.({ x, y });
  }, [onCellDrop]);

  // Calculate dynamic cell size based on robot configuration
  const cellSize = robotConfig ? `${robotConfig.gridCellSize}px` : 'minmax(0, 1fr)';

  if (loading) {
    return <div>Loading robot configuration...</div>;
  }

  return (
    <GridContainer
      cellSize={robotConfig?.gridCellSize || config.cellSize}
      style={{
        gridTemplateColumns: `repeat(${config.cols}, ${cellSize})`,
        gridTemplateRows: `repeat(${config.rows}, ${cellSize})`,
      }}
    >
      {grid.map((row, y) =>
        row.map((cell, x) => (
          <GridSquare
            key={`${x}-${y}`}
            cell={cell}
            position={{ x, y }}
            size={robotConfig?.gridCellSize || config.cellSize}
            grid={grid}
            onClick={() => onCellClick?.({ x, y })}
            onDragStart={() => onCellDragStart?.({ x, y })}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        ))
      )}
    </GridContainer>
  );
}; 