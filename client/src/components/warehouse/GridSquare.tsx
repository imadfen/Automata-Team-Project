import React from 'react';
import styled from '@emotion/styled';
import { GridCell, Position, CellType } from '../../types/warehouse';
import { useRobotConfig } from '../../hooks/useRobotConfig';

interface SquareProps {
  cellType: CellType;
  isSelected?: boolean;
  isHighlighted?: boolean;
  isPath?: boolean;
  isObstacle?: boolean;
  isAisle?: boolean;
  isShelf?: boolean;
  isRobotHome?: boolean;
  hasBorderTop?: boolean;
  hasBorderRight?: boolean;
  hasBorderBottom?: boolean;
  hasBorderLeft?: boolean;
  shelfWidth?: number;
  shelfDepth?: number;
}

interface GridSquareProps {
  cell: GridCell & {
    isSelected?: boolean;
    isHighlighted?: boolean;
    isPath?: boolean;
  };
  position: Position;
  size: number;
  grid: GridCell[][];
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

const Square = styled.div<SquareProps>`
  width: 100%;
  height: 100%;
  background-color: ${props => props.isRobotHome ? '#fef08a' : getCellColor(props.cellType)};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => (props.cellType === 'SHELF' ? 'grab' : 'pointer')};
  transition: background-color 0.2s ease;
  user-select: none;
  border-top: ${props => props.hasBorderTop ? '1px solid #000000' : 'none'};
  border-right: ${props => props.hasBorderRight ? '1px solid #000000' : 'none'};
  border-bottom: ${props => props.hasBorderBottom ? '1px solid #000000' : 'none'};
  border-left: ${props => props.hasBorderLeft ? '1px solid #000000' : 'none'};
  margin: ${props => props.cellType === 'SHELF' ? '-1px' : '0'};
  position: relative;

  &:hover {
    background-color: ${props => {
      if (props.isSelected) return '#93c5fd';
      if (props.isHighlighted) return '#bfdbfe';
      if (props.isPath) return '#93c5fd';
      if (props.isObstacle) return '#f87171';
      if (props.isAisle) return '#d1d5db';
      if (props.isShelf) return '#fbbf24';
      if (props.isRobotHome) return '#fef08a';
      return '#e5e7eb';
    }};
  }

  &:active {
    filter: brightness(0.9);
  }
`;

const RobotIcon = styled.div<{ direction: number }>`
  width: 70%;
  height: 70%;
  background-color: #3b82f6;
  clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
  transform: rotate(${props => props.direction}deg);
  transition: transform 0.3s ease;
`;

const HomeIcon = styled.div`
  width: 70%;
  height: 70%;
  position: relative;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-bottom: 15px solid #3b82f6;
  }
  
  &:after {
    content: '';
    position: absolute;
    top: 15px;
    left: 0;
    width: 100%;
    height: 15px;
    background-color: #3b82f6;
    border-radius: 0 0 5px 5px;
  }
`;

const ShelfDimensions = styled.div<{ width: number; depth: number }>`
  position: absolute;
  bottom: 5px;
  right: 5px;
  font-size: 8px;
  color: #4b5563;
  text-align: right;
`;

function getCellColor(type: string): string {
  switch (type) {
    case 'SHELF':
      return '#94a3b8';
    case 'OBSTACLE':
      return '#ef4444';
    case 'AISLE':
      return '#f8fafc';
    case 'ROBOT':
      return 'transparent';
    default:
      return '#ffffff';
  }
}

export const GridSquare: React.FC<GridSquareProps> = ({
  cell,
  position,
  grid,
  onClick,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const { config: robotConfig } = useRobotConfig();

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(position));
    onDragStart?.(e);
  };

  // Determine if this cell needs borders based on adjacent cells
  const hasBorderTop = cell.type === 'SHELF' && position.y > 0 && 
    (cell.shelfId !== grid[position.y - 1][position.x].shelfId);
  
  const hasBorderRight = cell.type === 'SHELF' && position.x < grid[0].length - 1 && 
    (cell.shelfId !== grid[position.y][position.x + 1].shelfId);
  
  const hasBorderBottom = cell.type === 'SHELF' && position.y < grid.length - 1 && 
    (cell.shelfId !== grid[position.y + 1][position.x].shelfId);
  
  const hasBorderLeft = cell.type === 'SHELF' && position.x > 0 && 
    (cell.shelfId !== grid[position.y][position.x - 1].shelfId);

  // Check if this is the robot's home position (top left corner)
  const isRobotHome = position.x === 0 && position.y === 0 && cell.type === 'ROBOT';

  // Get shelf dimensions from robot config
  const shelfWidth = robotConfig?.shelfDimensions.width || 15;
  const shelfDepth = robotConfig?.shelfDimensions.depth || 30;

  return (
    <Square
      cellType={cell.type}
      isSelected={cell.isSelected}
      isHighlighted={cell.isHighlighted}
      isPath={cell.isPath}
      isObstacle={cell.type === 'OBSTACLE'}
      isAisle={cell.type === 'AISLE'}
      isShelf={cell.type === 'SHELF'}
      isRobotHome={isRobotHome}
      hasBorderTop={hasBorderTop}
      hasBorderRight={hasBorderRight}
      hasBorderBottom={hasBorderBottom}
      hasBorderLeft={hasBorderLeft}
      onClick={onClick}
      draggable={cell.type === 'SHELF' || isRobotHome}
      onDragStart={handleDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      data-x={position.x}
      data-y={position.y}
    >
      {cell.type === 'ROBOT' && isRobotHome && <HomeIcon />}
      {cell.type === 'ROBOT' && !isRobotHome && <RobotIcon direction={90} />}
      {cell.type === 'SHELF' && (
        <ShelfDimensions width={shelfWidth} depth={shelfDepth}>
          {shelfWidth}x{shelfDepth}
        </ShelfDimensions>
      )}
    </Square>
  );
}; 