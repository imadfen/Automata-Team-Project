export interface IShelfDimensions {
  width: number;
  depth: number;
  height: number;
}

export interface IRobotDimensions {
  width: number;
  length: number;
}

export interface IRobotConfig {
  forwardTime: number;
  turnTime: number;
  gridSize: number;
  gridCellSize: number;
  shelfDimensions: IShelfDimensions;
  robotDimensions: IRobotDimensions;
  aisleWidth: number;
} 