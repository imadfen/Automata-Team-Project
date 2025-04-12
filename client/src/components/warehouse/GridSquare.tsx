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
  onContextMenu?: (e: React.MouseEvent) => void;
  onDeleteClick?: (shelfId: string) => void;
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
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
`;

const ShelfDimensions = styled.div<{ width: number; depth: number }>`
  position: absolute;
  bottom: 5px;
  right: 5px;
  font-size: 8px;
  color: #4b5563;
  text-align: right;
`;

const ShelfLabel = styled.div`
  position: absolute;
  top: 5px;
  left: 5px;
  font-size: 10px;
  font-weight: 600;
  color: #1e293b;
  background-color: rgba(255, 255, 255, 0.6);
  padding: 2px 4px;
  border-radius: 2px;
  z-index: 5;
`;

// Add a trash icon for visual feedback on shelf cells
const DeleteIcon = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  opacity: 0;
  color: #dc2626;
  font-size: 10px;
  transition: opacity 0.2s;
  background: transparent;
  border: none;
  padding: 2px;
  cursor: pointer;
  border-radius: 3px;
  
  ${Square}:hover & {
    opacity: 0.8;
  }
  
  &:hover {
    background-color: rgba(220, 38, 38, 0.1);
    opacity: 1 !important;
  }
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

// Function to extract shelf number from ID
function getShelfNumber(shelfId: string): string {
  if (!shelfId) return '';
  
  // Try to extract the timestamp from shelf_1234567890
  const match = shelfId.match(/shelf_(\d+)/);
  if (match && match[1]) {
    // Use the last 3 digits of the timestamp to create a sequential-looking ID
    const timestamp = match[1];
    const shortNumber = timestamp.slice(-3);
    return `Shelf ${parseInt(shortNumber, 10)}`;
  }
  
  return `Shelf ${shelfId.split('_')[1] || ''}`;
}

export const GridSquare: React.FC<GridSquareProps> = ({
  cell,
  position,
  grid,
  onClick,
  onDragStart,
  onDragOver,
  onDrop,
  onContextMenu,
  onDeleteClick,
}) => {
  const { config: robotConfig } = useRobotConfig();

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(position));
    onDragStart?.(e);
  };
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the cell's onClick
    if (cell.shelfId && onDeleteClick) {
      onDeleteClick(cell.shelfId);
    }
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

  // Check if this cell is the top-left corner of a shelf
  const isShelfCorner = cell.type === 'SHELF' && 
    (position.y === 0 || cell.shelfId !== grid[position.y - 1][position.x].shelfId) &&
    (position.x === 0 || cell.shelfId !== grid[position.y][position.x - 1].shelfId);

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
      onContextMenu={onContextMenu}
      data-x={position.x}
      data-y={position.y}
    >
      {cell.type === 'ROBOT' && isRobotHome && (
        <HomeIcon>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            width="100%" 
            height="100%"
          >
            <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
            <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
          </svg>
        </HomeIcon>
      )}
      {cell.type === 'ROBOT' && !isRobotHome && <RobotIcon direction={90} />}
      {cell.type === 'SHELF' && (
        <>
          <ShelfDimensions width={shelfWidth} depth={shelfDepth}>
            {shelfWidth}x{shelfDepth}
          </ShelfDimensions>
          <DeleteIcon onClick={handleDeleteClick} title="Delete shelf">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor" 
              width="12px" 
              height="12px"
            >
              <path 
                fillRule="evenodd" 
                d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" 
                clipRule="evenodd" 
              />
            </svg>
          </DeleteIcon>
          {/* Only show the label on the top-left corner of each shelf */}
          {isShelfCorner && cell.shelfId && (
            <ShelfLabel>{getShelfNumber(cell.shelfId)}</ShelfLabel>
          )}
        </>
      )}
    </Square>
  );
}; 