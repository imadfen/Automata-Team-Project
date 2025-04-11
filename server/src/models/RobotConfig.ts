import { Schema, model } from 'mongoose';

interface IShelfDimensions {
  width: number;
  depth: number;
  height: number;
}

interface IRobotDimensions {
  width: number;
  length: number;
}

interface IRobotConfig {
  forwardTime: number;
  turnTime: number;
  gridSize: number;
  gridCellSize: number;
  shelfDimensions: IShelfDimensions;
  robotDimensions: IRobotDimensions;
  aisleWidth: number;
}

const shelfDimensionsSchema = new Schema<IShelfDimensions>({
  width: { type: Number, required: true },
  depth: { type: Number, required: true },
  height: { type: Number, required: true }
});

const robotDimensionsSchema = new Schema<IRobotDimensions>({
  width: { type: Number, required: true },
  length: { type: Number, required: true }
});

const robotConfigSchema = new Schema<IRobotConfig>({
  forwardTime: { type: Number, required: true },
  turnTime: { type: Number, required: true },
  gridSize: { type: Number, required: true },
  gridCellSize: { type: Number, required: true },
  shelfDimensions: { type: shelfDimensionsSchema, required: true },
  robotDimensions: { type: robotDimensionsSchema, required: true },
  aisleWidth: { type: Number, required: true }
});

export const RobotConfig = model<IRobotConfig>('RobotConfig', robotConfigSchema);
export type { IRobotConfig, IShelfDimensions, IRobotDimensions }; 