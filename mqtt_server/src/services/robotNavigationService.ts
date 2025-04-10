import { MQTTHandler } from "./mqttHandler";
import { SocketService } from "./socketService";
import { WarehouseService } from "./warehouseService";
import { Direction, Instruction } from "../types/RobotGeometry";
import { logger } from "../utils/logger";
import generateInstructions from "../utils/generateRobotInstructions";

interface NavigationRequest {
  slotId: string;
  robotId: string;
}

export class RobotNavigationService {
  constructor(
    private mqttHandler: MQTTHandler,
    private warehouseService: WarehouseService,
    private socketService: SocketService
  ) {
    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    this.socketService.on(
      "robot:navigate",
      (data: NavigationRequest, callback?: Function) => {
        try {
          this.handleNavigationRequest(data.robotId, data.slotId)
            .then(() => callback?.({ success: true }))
            .catch((error) => {
              logger.error("Navigation request failed:", error);
              callback?.({ success: false, error: error.message });
            });
        } catch (error) {
          logger.error("Failed to process navigation request:", error);
          callback?.({ success: false, error: "Internal navigation error" });
        }
      }
    );
  }

  public async handleNavigationRequest(
    robotId: string,
    slotId: string
  ): Promise<{ directions: Direction[]; instructions: Instruction[] }> {
    const directions = this.warehouseService.findPathToSlot(slotId);

    if (!directions) {
      throw new Error(`No valid path found to slot ${slotId}`);
    }

    // Convert directions to robot instructions
    const instructions = generateInstructions(directions);

    // Send instructions to robot
    await this.sendNavigationInstructions(robotId, instructions);

    logger.info(
      `Sent navigation instructions to robot ${robotId} for slot ${slotId}`
    );

    return { directions, instructions };
  }

  private async sendNavigationInstructions(
    robotId: string,
    instructions: Instruction[]
  ): Promise<void> {
    const topic = `device/${robotId}/navigation/instructions`;
    const message = JSON.stringify({
      instructions,
      timestamp: new Date().toISOString(),
    });

    this.mqttHandler.publish(topic, message);
  }

  private sendNavigationError(robotId: string, error: string): void {
    const topic = `device/${robotId}/navigation/error`;
    const message = JSON.stringify({
      error,
      timestamp: new Date().toISOString(),
    });

    this.mqttHandler.publish(topic, message);
  }
}
