import { MqttClient } from "mqtt";
import { logger } from "../utils/logger";
import { Device, DeviceStatus } from "../types/device";
import { socketEmit } from "./socketService";

const devices = new Map<string, Device>();

// Device topic patterns
const DEVICE_TOPICS = {
  battery: (id: string) => `device/${id}/battery`,
  status: (id: string) => `device/${id}/status`,
  navigation: (id: string) => `device/${id}/navigation/instructions`,
};

export function initializeDevice(deviceId: string) {
  if (!devices.has(deviceId)) {
    devices.set(deviceId, {
      id: deviceId,
      deviceName: deviceId,
      status: "offline",
      batteryLevel: 100,
      lastSeen: new Date(),
    });
  }
}

export function handleBatteryUpdate(deviceId: string, batteryLevel: number) {
  try {
    if (batteryLevel < 0 || batteryLevel > 100) {
      throw new Error("Battery level must be between 0 and 100");
    }

    const device = devices.get(deviceId);
    if (!device) {
      logger.warn(`Received battery update for unknown device ${deviceId}`);
      return;
    }

    device.batteryLevel = batteryLevel;
    device.lastSeen = new Date();
    devices.set(deviceId, device);

    logger.info(`Battery update for device ${deviceId}: ${batteryLevel}%`);

    // Emit to main server
    socketEmit("device:battery", {
      deviceId,
      batteryLevel,
    });
  } catch (error) {
    logger.error(
      `Error handling battery update for device ${deviceId}:`,
      error
    );
  }
}

export function handleStatusUpdate(
  deviceId: string,
  status: "idle" | "busy" | "offline" | "error"
) {
  try {
    const device = devices.get(deviceId);
    if (!device) {
      logger.warn(`Received status update for unknown device ${deviceId}`);
      return;
    }

    device.status = status;
    device.lastSeen = new Date();
    devices.set(deviceId, device);

    logger.info(`Status update for device ${deviceId}: ${status}`);

    // Emit to main server
    socketEmit("device:status", {
      deviceId,
      status,
    });
  } catch (error) {
    logger.error(`Error handling status update for device ${deviceId}:`, error);
  }
}

export function subscribeToDeviceTopics(
  mqttClient: MqttClient,
  deviceId: string
) {
  const topics = [
    DEVICE_TOPICS.battery(deviceId),
    DEVICE_TOPICS.status(deviceId),
  ];

  topics.forEach((topic) => {
    mqttClient.subscribe(topic, (err) => {
      if (err) {
        logger.error(`Failed to subscribe to ${topic}:`, err);
      } else {
        logger.info(`Subscribed to ${topic}`);
      }
    });
  });
}

export function unsubscribeFromDeviceTopics(
  mqttClient: MqttClient,
  deviceId: string
) {
  const topics = [
    DEVICE_TOPICS.battery(deviceId),
    DEVICE_TOPICS.status(deviceId),
  ];

  topics.forEach((topic) => {
    mqttClient.unsubscribe(topic, (err) => {
      if (err) {
        logger.error(`Failed to unsubscribe from ${topic}:`, err);
      } else {
        logger.info(`Unsubscribed from ${topic}`);
      }
    });
  });

  devices.delete(deviceId);
}

export function sendNavigationInstructions(
  mqttClient: MqttClient,
  deviceId: string,
  instructions: any
) {
  const topic = DEVICE_TOPICS.navigation(deviceId);
  mqttClient.publish(
    topic,
    JSON.stringify({
      instructions,
      timestamp: new Date().toISOString(),
    }),
    { qos: 1 },
    (err) => {
      if (err) {
        logger.error(
          `Failed to send navigation instructions to device ${deviceId}:`,
          err
        );
      } else {
        logger.info(`Navigation instructions sent to device ${deviceId}`);
      }
    }
  );
}

export function getAllDevices(): Device[] {
  return Array.from(devices.values());
}
