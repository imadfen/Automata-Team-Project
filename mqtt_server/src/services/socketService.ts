import { io, Socket } from "socket.io-client";
import dotenv from "dotenv";
import { logger } from "../utils/logger";
import { deviceStatus } from "../types/device";
import { RobotNavigationService } from "../services/robotNavigationService";

dotenv.config();

interface ISocketService {
  on(event: string, handler: Function): void;
  emit(event: string, data: any, callback?: Function): void;
  updateDeviceStatus(deviceStatus: deviceStatus): void;
  updateBatteryLevel(deviceId: string, batteryLevel: number): void;
  isConnected(): boolean;
  disconnect(): void;
}

export class SocketService implements ISocketService {
  private socket: Socket;
  private eventHandlers: Map<string, Function>;
  private navigationService: RobotNavigationService | null = null;
  constructor() {
    this.eventHandlers = new Map();
    this.socket = io(process.env.SOCKET_SERVER_URL || "http://localhost:5000", {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });
    this.setupSocketListeners();
  }
  private setupSocketListeners(): void {
    this.socket.on("connect", () => {
      logger.info("Connected to socket server");
      // Register as MQTT server
      this.socket.emit("register:mqtt_server");
      logger.info("Sent MQTT server registration");
    });

    this.socket.on("disconnect", () => {
      logger.warn("Disconnected from socket server");
    });

    this.socket.on("error", (error: any) => {
      logger.error("Socket error:", error);
    });

    // Handle device list updates from main server
    this.socket.on(
      "devices:list",
      (devices: Array<{ id: string; type: string }>) => {
        logger.info(
          `Received device list update with ${devices.length} devices`
        );
        const handler = this.eventHandlers.get("devices:list");
        if (handler) {
          handler(devices);
        }
      }
    );

    // Handle acknowledgment of MQTT server registration
    this.socket.on("mqtt:registered", () => {
      logger.info("MQTT server registration acknowledged");
    });

    // Handle robot navigation requests
    this.socket.on(
      "robot:navigate",
      async (data: { robotId: string; slotId: string }, callback: Function) => {
        try {
          const result = await this.navigationService?.handleNavigationRequest(
            data.robotId,
            data.slotId
          );
          callback({
            success: true,
            path: result?.directions,
            instructions: result?.instructions,
          });
        } catch (error: any) {
          callback({ success: false, error: error.message });
        }
      }
    );
  }

  public on(event: string, handler: Function): void {
    this.eventHandlers.set(event, handler);
  }
  public emit(event: string, data: any, callback?: Function): void {
    this.socket.emit(event, data, callback);
    logger.debug(`Emitted ${event}:`, data);
  }

  public updateDeviceStatus(deviceStatus: deviceStatus): void {
    this.emit("device:status", deviceStatus);
  }

  public updateBatteryLevel(deviceId: string, batteryLevel: number): void {
    this.emit("device:battery", { deviceId, batteryLevel });
  }

  public initializeNavigationService(
    navigationService: RobotNavigationService
  ): void {
    this.navigationService = navigationService;
    logger.info("Navigation service initialized");
  }

  public isConnected(): boolean {
    return this.socket.connected;
  }

  public disconnect(): void {
    this.socket.disconnect();
  }
}
