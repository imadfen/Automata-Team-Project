import { MQTTHandler } from "./mqttHandler";
import { SocketService } from "./socketService";
import { logger } from "../utils/logger";
import { DeviceStatus, MQTTMessage } from "../types";
import type { Socket } from "socket.io-client";

export class DeviceController {
  private devices: Map<string, DeviceStatus>;
  private mqttHandler: MQTTHandler;
  private socketService: SocketService;

  constructor(mqttHandler: MQTTHandler) {
    this.devices = new Map();
    this.mqttHandler = mqttHandler;
    this.socketService = new SocketService();

    this.setupMessageHandlers();
    this.setupSocketHandlers();
  }

  private setupMessageHandlers(): void {
    this.mqttHandler.addMessageHandler(this.handleMQTTMessage.bind(this));
  }

  private setupSocketHandlers(): void {
    // Handle device commands from the main server
    this.socketService.on(
      "device:command",
      this.handleServerCommand.bind(this)
    );

    // Listen for device list updates
    this.socketService.on(
      "devices:list",
      (devices: Array<{ id: string; type: string }>) => {
        this.updateDeviceSubscriptions(devices);
      }
    );

    // Handle device errors
    this.mqttHandler.addMessageHandler((message: MQTTMessage) => {
      if (message.topic.endsWith("/error")) {
        try {
          const errorData = JSON.parse(message.payload);
          this.socketService.emit("device:error", errorData, () => {
            logger.debug("Error message sent to main server");
          });
        } catch (error) {
          logger.error("Failed to parse error message:", error);
        }
      }
    });

    // Request initial device list after connection
    this.socketService.on("connect", () => {
      this.socketService.emit("devices:list:request", {});
    });
  }

  private async updateDeviceSubscriptions(
    devices: Array<{ id: string; type: string }>
  ): Promise<void> {
    // Remove subscriptions for devices that no longer exist
    const newDeviceIds = devices.map((d) => d.id);
    for (const [deviceId] of this.devices) {
      if (!newDeviceIds.includes(deviceId)) {
        this.mqttHandler.removeDevice(deviceId);
        this.devices.delete(deviceId);
        logger.info(`Removed device ${deviceId} subscriptions`);
      }
    }

    // Add new devices
    for (const device of devices) {
      if (!this.devices.has(device.id)) {
        this.mqttHandler.addDevice(device.id);
        this.devices.set(device.id, {
          id: device.id,
          isOnline: false,
          batteryLevel: 100,
          lastSeen: new Date(),
        });
      }
    }
  }

  private async handleMQTTMessage(message: MQTTMessage): Promise<void> {
    try {
      const { topic, payload } = message;
      const parts = topic.split("/");
      const deviceId = parts[2];
      const messageData = JSON.parse(payload);

      if (!deviceId || !this.devices.has(deviceId)) return;

      const device = this.devices.get(deviceId)!;

      // Handle battery updates
      if (
        topic.includes("/battery") &&
        typeof messageData.batteryLevel === "number"
      ) {
        this.handleBatteryUpdate(deviceId, messageData.batteryLevel);
        return;
      }

      // Handle status updates
      if (topic.includes("/status") && messageData.status) {
        this.handleStatusUpdate(deviceId, messageData.status);
        return;
      }
    } catch (error) {
      logger.error("Error handling MQTT message:", error);
    }
  }

  private handleBatteryUpdate(deviceId: string, batteryLevel: number): void {
    try {
      if (batteryLevel < 0 || batteryLevel > 100) {
        throw new Error("Battery level must be between 0 and 100");
      }

      const device = this.devices.get(deviceId);
      if (!device) return;

      device.batteryLevel = batteryLevel;
      device.lastSeen = new Date();
      this.devices.set(deviceId, device);

      // Emit battery update to main server
      this.socketService.updateBatteryLevel(deviceId, batteryLevel);
    } catch (error) {
      logger.error(
        `Error handling battery update for device ${deviceId}:`,
        error
      );
    }
  }

  private handleStatusUpdate(
    deviceId: string,
    status: "idle" | "busy" | "offline" | "error"
  ): void {
    try {
      const device = this.devices.get(deviceId);
      if (!device) return;

      device.isOnline = status !== "offline";
      device.lastSeen = new Date();
      this.devices.set(deviceId, device);

      // Emit status update to main server
      this.socketService.updateDeviceStatus({
        id: deviceId,
        status,
        batteryLevel: device.batteryLevel,
        lastSeen: device.lastSeen,
      });
    } catch (error) {
      logger.error(
        `Error handling status update for device ${deviceId}:`,
        error
      );
    }
  }

  private handleServerCommand(command: any): void {
    const { deviceId, type, data } = command;

    // Publish command to device via MQTT
    this.mqttHandler.publish(
      `device/${deviceId}/command`,
      JSON.stringify({ type, data })
    );
  }

  public cleanup(): void {
    // Clean up device subscriptions
    this.devices.forEach((_, deviceId) => {
      this.mqttHandler.removeDevice(deviceId);
    });
    this.devices.clear();

    // Close socket connection
    this.socketService.disconnect();
  }

  public async initialize(): Promise<void> {
    try {
      logger.info("Device controller initializing...");

      // Setup cleanup handlers
      process.on("SIGTERM", () => this.cleanup());
      process.on("SIGINT", () => this.cleanup());

      // Request initial device list
      this.socketService.emit("devices:list:request", {}, () => {
        logger.debug("Device list request sent");
      });

      logger.info("Device controller initialized");
    } catch (error) {
      logger.error("Failed to initialize device controller:", error);
      throw error;
    }
  }

  public shutdown(): void {
    this.socketService.disconnect();
  }

  public isConnected(): boolean {
    return this.socketService.isConnected();
  }
}
