import config from "../robotConfig.json" assert { type: "json" };
import { Direction, Instruction, Position } from "../types/RobotGeometry";

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

function getDirectionFromDelta(dx: number, dy: number): string | null {
  for (const [dir, [vx, vy]] of Object.entries(DIRECTION_VECTORS)) {
    if (vx === dx && vy === dy) return dir;
  }
  return null;
}

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
  shelfPosition: Position | null = null,
  startDirection: Direction = "DOWN"
): Instruction[] {
  const instructions: Instruction[] = [];
  let currentDirection = startDirection;
  let currentPosition: Position = { x: 0, y: 0 };

  // Handle the first direction change if needed
  if (path.length > 0 && path[0] !== startDirection) {
    const { direction, steps } = rotationSteps(startDirection, path[0]);
    instructions.push({
      action: "TURN",
      direction,
      time: (config.TurnTime * steps) / 2,
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
        config.ForwardTime * (isDiagonal ? Math.SQRT2 : 1) * consecutiveSteps,
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
        time: (config.TurnTime * steps) / 2,
      });
      currentDirection = nextDir;
    }

    // Update current position
    const [dx, dy] = DIRECTION_VECTORS[currentDir];
    currentPosition = {
      x: currentPosition.x + dx * consecutiveSteps,
      y: currentPosition.y + dy * consecutiveSteps,
    };
  }

  // Add final turn to face shelf, if needed
  if (shelfPosition) {
    const dx = shelfPosition.x - currentPosition.x;
    const dy = shelfPosition.y - currentPosition.y;
    const shelfDir = getDirectionFromDelta(dx, dy);

    if (shelfDir && shelfDir !== currentDirection) {
      const { direction, steps } = rotationSteps(currentDirection, shelfDir);
      instructions.push({
        action: "TURN",
        direction,
        time: (config.TurnTime * steps) / 2,
      });
    }
  }

  return instructions;
}
