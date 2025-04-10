export type Point = [number, number];
export type DirectionWithOfset = {
  name: string;
  offset: Point;
};

export type Position = { x: number; y: number };

export type Direction =
  | "UP"
  | "UP_RIGHT"
  | "RIGHT"
  | "DOWN_RIGHT"
  | "DOWN"
  | "DOWN_LEFT"
  | "LEFT"
  | "UP_LEFT";

export type Instruction =
  | { action: "FORWARD"; time: number }
  | { action: "TURN"; direction: "LEFT" | "RIGHT"; time: number };
