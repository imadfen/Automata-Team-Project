import mqtt, { MqttClient } from "mqtt";
import dotenv from "dotenv";
import { logger } from "../utils/logger";
import { MQTTMessage, DeviceTopics } from "../types";

dotenv.config();

export class MQTTHandler {
  private client: MqttClient;
  private messageHandlers: Map<string, (message: MQTTMessage) => void>;
  private deviceTopics: Map<string, DeviceTopics>;

  constructor() {
    this.messageHandlers = new Map();
    this.deviceTopics = new Map();
    this.client = mqtt.connect(
      process.env.MQTT_BROKER_URL || "mqtt://localhost:1883",
      {
        clientId: `mqtt_handler_${Date.now()}`,
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 1000,
      }
    );

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on("connect", () => {
      logger.info("Connected to MQTT broker");
      // Subscribe to wildcard topic to catch all device messages
      this.subscribe("device/#");
      logger.info("Subscribed to wildcard topic device/#");
      this.resubscribeToDeviceTopics();
    });

    this.client.on("message", async (topic: string, message: Buffer) => {
      const payload = message.toString();
      logger.info(
        `Raw MQTT message received - Topic: ${topic}, Payload: ${payload}`
      );
      const deviceId = this.extractDeviceId(topic);

      if (!deviceId) {
        logger.warn(`Invalid topic format: ${topic}`);
        return;
      }

      try {
        const messageType = topic.split("/").pop() || "";
        if (!this.validateMessageType(messageType)) {
          this.handleMessageError(
            deviceId,
            new Error(`Invalid message type: ${messageType}`),
            "message validation"
          );
          return;
        }

        const messageData = this.parseMessage(topic, payload, deviceId);
        if (messageData) {
          this.messageHandlers.forEach((handler) => {
            handler({
              topic,
              payload: JSON.stringify(messageData),
            });
          });
        }
      } catch (error) {
        this.handleMessageError(
          deviceId,
          error instanceof Error ? error : new Error(String(error)),
          "message parsing"
        );
      }
    });

    this.client.on("error", (error) => {
      logger.error("MQTT Error:", error);
    });

    this.client.on("close", () => {
      logger.warn("MQTT Connection closed");
    });
  }

  private parseMessage(topic: string, payload: string, deviceId: string): any {
    const messageType = topic.split("/").pop();

    const baseData = {
      deviceId,
      timestamp: new Date(),
    };

    if (messageType === "battery") {
      const batteryLevel = Number(payload);
      if (isNaN(batteryLevel) || batteryLevel < 0 || batteryLevel > 100) {
        throw new Error("Invalid battery level. Must be between 0 and 100");
      }
      return {
        ...baseData,
        batteryLevel,
      };
    }

    if (messageType === "status") {
      const status = payload as "idle" | "busy" | "offline" | "error";
      if (!["idle", "busy", "offline", "error"].includes(status)) {
        throw new Error(
          "Invalid status. Must be one of: idle, busy, offline, error"
        );
      }
      return {
        ...baseData,
        status,
      };
    }

    return null;
  }

  private validateMessageType(messageType: string): boolean {
    const validMessageTypes = ["battery", "status"];
    return validMessageTypes.includes(messageType);
  }

  private extractDeviceId(topic: string): string | null {
    const parts = topic.split("/");
    return parts.length >= 3 ? parts[1] : null;
  }

  private handleMessageError(
    deviceId: string,
    error: Error,
    context: string
  ): void {
    logger.error(`Error handling ${context} for device ${deviceId}:`, error);
    this.publish(
      `device/${deviceId}/error`,
      JSON.stringify({
        error: error.message,
        context,
        timestamp: new Date(),
      })
    );
  }

  public addDevice(deviceId: string): void {
    if (!this.deviceTopics.has(deviceId)) {
      const topics: DeviceTopics = {
        battery: `device/${deviceId}/battery`,
        status: `device/${deviceId}/status`,
        command: `device/${deviceId}/command`,
      };

      this.deviceTopics.set(deviceId, topics);

      // Subscribe to device-specific topics except command topics
      Object.entries(topics).forEach(([key, topicValue]) => {
        if (!topicValue.endsWith("/command")) {
          this.subscribe(topicValue);
        }
      });
    }
  }

  public removeDevice(deviceId: string): void {
    const topics = this.deviceTopics.get(deviceId);
    if (topics) {
      Object.values(topics).forEach((topicValue) => {
        this.unsubscribe(topicValue);
      });
      this.deviceTopics.delete(deviceId);
    }
  }

  private resubscribeToDeviceTopics(): void {
    this.deviceTopics.forEach((topics) => {
      Object.values(topics).forEach((topicValue) => {
        if (!topicValue.endsWith("/command")) {
          this.subscribe(topicValue);
        }
      });
    });
  }

  public subscribe(topic: string): void {
    this.client.subscribe(topic, (err) => {
      if (err) {
        logger.error(`Error subscribing to ${topic}:`, err);
      }
    });
    logger.info(`Subscribed to ${topic}`);
  }

  public unsubscribe(topic: string): void {
    this.client.unsubscribe(topic, (err) => {
      if (err) {
        logger.error(`Error unsubscribing from ${topic}:`, err);
      }
    });
  }

  public publish(topic: string, message: string): void {
    this.client.publish(topic, message, { qos: 1 }, (err) => {
      if (err) {
        logger.error(`Error publishing to ${topic}:`, err);
      } else {
        logger.debug(`Published to ${topic}: ${message}`);
      }
    });
  }

  public addMessageHandler(handler: (message: MQTTMessage) => void): void {
    this.messageHandlers.set(handler.name, handler);
  }

  public removeMessageHandler(handler: (message: MQTTMessage) => void): void {
    this.messageHandlers.delete(handler.name);
  }

  public disconnect(): void {
    this.client.end();
  }
}
