import { Direction, DirectionWithOfset, Point } from "../types/RobotGeometry.ts";

const DIRECTIONS: DirectionWithOfset[] = [
  { name: "UP", offset: [-1, 0] },
  { name: "DOWN", offset: [1, 0] },
  { name: "LEFT", offset: [0, -1] },
  { name: "RIGHT", offset: [0, 1] },
  { name: "UP_LEFT", offset: [-1, -1] },
  { name: "UP_RIGHT", offset: [-1, 1] },
  { name: "DOWN_LEFT", offset: [1, -1] },
  { name: "DOWN_RIGHT", offset: [1, 1] },
];

function heuristic(a: Point, b: Point): number {
  return Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1])); // Chebyshev
}

function pointToString(p: Point): string {
  return `${p[0]},${p[1]}`;
}

function reconstructPath(
  cameFrom: Map<string, { from: Point; direction: Direction }>,
  current: Point,
): Direction[] {
  const path: Direction[] = [];
  while (cameFrom.has(pointToString(current))) {
    const entry = cameFrom.get(pointToString(current))!;
    path.push(entry.direction);
    current = entry.from;
  }
  return path.reverse(); // from start to target
}

export default function getShortestPath(
  grid: string[][],
  start: Point,
  target: Point,
): Direction[] | null {
  const rows = grid.length;
  const cols = grid[0].length;

  const openSet: [number, number, Point][] = [];
  openSet.push([0, 0, start]);

  const gScore: Map<string, number> = new Map();
  gScore.set(pointToString(start), 0);

  const cameFrom: Map<string, { from: Point; direction: Direction }> = new Map();

  const visited: Set<string> = new Set();

  while (openSet.length > 0) {
    openSet.sort((a, b) => a[0] - b[0]); // Sort by fScore
    const [_, steps, current] = openSet.shift()!;
    const currentKey = pointToString(current);

    if (current[0] === target[0] && current[1] === target[1]) {
      return reconstructPath(cameFrom, current);
    }

    if (visited.has(currentKey)) continue;
    visited.add(currentKey);

    for (const { name, offset } of DIRECTIONS) {
      const nr = current[0] + offset[0];
      const nc = current[1] + offset[1];
      const neighbor: Point = [nr, nc];
      const neighborKey = pointToString(neighbor);

      if (
        nr >= 0 &&
        nr < rows &&
        nc >= 0 &&
        nc < cols &&
        grid[nr][nc] !== "X"
      ) {
        const tentativeG = (gScore.get(currentKey) ?? Infinity) + 1;
        if (tentativeG < (gScore.get(neighborKey) ?? Infinity)) {
          cameFrom.set(neighborKey, { from: current, direction: name as Direction });
          gScore.set(neighborKey, tentativeG);
          const fScore = tentativeG + heuristic(neighbor, target);
          openSet.push([fScore, tentativeG, neighbor]);
        }
      }
    }
  }

  return null; // No path found
}
