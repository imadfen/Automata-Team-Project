import { Direction, Instruction } from "../types/RobotGeometry";
import { logger } from "../utils/logger";
import getShortestPath from "../utils/getShortestPath";
import generateInstructions from "../utils/generateRobotInstructions";
import { sendNavigationInstructions } from "./deviceService";
import mqtt from "mqtt";

const WAREHOUSE_GRID = Array(15)
  .fill(null)
  .map(
    () => Array(15).fill(".") // 15x15 grid for test shelves
  );

// Add test shelves to the grid
export function addTestShelves() {
  // Define shelf positions and create slots
  const shelves = [
    { id: "shelf1", x: 5, y: 3 },
    { id: "shelf2", x: 5, y: 6 },
    { id: "shelf3", x: 10, y: 3 },
  ];

  const slots: Record<string, string> = {};

  // Create slots for each shelf (2 levels, 2 positions per level, front and back sides)
  shelves.forEach((shelf) => {
    WAREHOUSE_GRID[shelf.y][shelf.x] = "X"; // Mark shelf in grid

    // Create slots for each shelf with proper ID format: slot_shelfId_level_position_side
    for (let level = 0; level < 2; level++) {
      for (let position = 0; position < 2; position++) {
        slots[
          `${shelf.id}_front_${level}_${position}`
        ] = `slot_${shelf.id}_${level}_${position}_FRONT`;
        slots[
          `${shelf.id}_back_${level}_${position}`
        ] = `slot_${shelf.id}_${level}_${position}_BACK`;
      }
    }
  });

  logger.info("Test shelves and slots added to warehouse grid");
  return slots;
}

// Keep track of current MqttClient instance
let mqttClient: mqtt.MqttClient;

export function setMqttClient(client: mqtt.MqttClient) {
  mqttClient = client;
}

export async function handleNavigationRequest(
  robotId: string,
  targetSlotId: string
): Promise<{ directions: Direction[]; instructions: Instruction[] }> {
  try {
    logger.info(
      `Processing navigation request for robot ${robotId} to slot ${targetSlotId}`
    ); // Extract components from slotId (format: slot_shelfId_level_position_side)
    const [_, shelfIdFull, level, position, side] = targetSlotId.split("_");

    // Extract shelf number to get coordinates
    const shelfNum = parseInt(shelfIdFull.replace("shelf", ""));
    let targetX, targetY;

    // Map shelf IDs to their coordinates
    switch (shelfNum) {
      case 1:
        targetX = 5;
        targetY = 3;
        break;
      case 2:
        targetX = 5;
        targetY = 6;
        break;
      case 3:
        targetX = 10;
        targetY = 3;
        break;
      default:
        throw new Error(`Invalid shelf ID: ${shelfIdFull}`);
    }

    // Adjust Y coordinate based on which side we're accessing (FRONT/BACK)
    if (side === "FRONT") {
      targetY -= 1; // Access from front (one cell up)
    } else {
      targetY += 1; // Access from back (one cell down)
    }

    // Calculate path from (0,0) to target
    const directions = getShortestPath(
      WAREHOUSE_GRID,
      [0, 0],
      [targetY, targetX]
    );

    if (!directions) {
      throw new Error(`No valid path found to slot ${targetSlotId}`);
    }

    // Generate robot movement instructions
    const instructions = generateInstructions(directions);

    // Send instructions to robot via MQTT
    if (mqttClient) {
      sendNavigationInstructions(mqttClient, robotId, instructions);
    } else {
      logger.warn(
        "MQTT client not available, navigation instructions not sent"
      );
    }

    logger.info(`Navigation path calculated for robot ${robotId}`);
    return { directions, instructions };
  } catch (error) {
    logger.error(`Failed to process navigation request:`, error);
    throw error;
  }
}
