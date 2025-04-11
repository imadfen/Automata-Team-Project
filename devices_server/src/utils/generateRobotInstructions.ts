import { Direction, Instruction, Position } from "../types/RobotGeometry";

const ROBOT_CONFIG = {
  ForwardTime: 1,
  TurnTime: 2,
};

const DIRECTION_VECTORS: Record<string, [number, number]> = {
  UP: [-1, 0],
  DOWN: [1, 0],
  LEFT: [0, -1],
  RIGHT: [0, 1],
  UP_LEFT: [-1, -1],
  UP_RIGHT: [-1, 1],
  DOWN_LEFT: [1, -1],
  DOWN_RIGHT: [1, 1],
};

const DIRECTION_ORDER = [
  "UP",
  "UP_RIGHT",
  "RIGHT",
  "DOWN_RIGHT",
  "DOWN",
  "DOWN_LEFT",
  "LEFT",
  "UP_LEFT",
];

function getDirectionIndex(direction: string): number {
  return DIRECTION_ORDER.indexOf(direction);
}

function rotationSteps(
  from: string,
  to: string
): { direction: "LEFT" | "RIGHT"; steps: number } {
  const fromIndex = getDirectionIndex(from);
  const toIndex = getDirectionIndex(to);
  let diff = (toIndex - fromIndex + 8) % 8;

  if (diff > 4) {
    return { direction: "LEFT", steps: 8 - diff };
  } else {
    return { direction: "RIGHT", steps: diff };
  }
}

export default function generateInstructions(
  path: Direction[],
  startDirection: Direction = "DOWN"
): Instruction[] {
  const instructions: Instruction[] = [];
  let currentDirection = startDirection;

  // Handle the first direction change if needed
  if (path.length > 0 && path[0] !== startDirection) {
    const { direction, steps } = rotationSteps(startDirection, path[0]);
    instructions.push({
      action: "TURN",
      direction,
      time: (ROBOT_CONFIG.TurnTime * steps) / 2,
    });
    currentDirection = path[0];
  }

  // Process consecutive steps in the same direction
  let i = 0;
  while (i < path.length) {
    const currentDir = path[i];
    let consecutiveSteps = 1;

    // Count consecutive steps in the same direction
    while (
      i + consecutiveSteps < path.length &&
      path[i + consecutiveSteps] === currentDir
    ) {
      consecutiveSteps++;
    }

    // Add forward instruction for the consecutive steps
    const isDiagonal = currentDir.includes("_");
    instructions.push({
      action: "FORWARD",
      time:
        ROBOT_CONFIG.ForwardTime *
        (isDiagonal ? Math.SQRT2 : 1) *
        consecutiveSteps,
    });

    // Move to the next different direction
    i += consecutiveSteps;

    // If there's a next direction, add a turn instruction
    if (i < path.length) {
      const nextDir = path[i];
      const { direction, steps } = rotationSteps(currentDir, nextDir);
      instructions.push({
        action: "TURN",
        direction,
        time: (ROBOT_CONFIG.TurnTime * steps) / 2,
      });
      currentDirection = nextDir;
    }
  }

  return instructions;
}
