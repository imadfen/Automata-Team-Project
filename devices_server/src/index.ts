import mqtt from "mqtt";
import dotenv from "dotenv";
import { logger } from "./utils/logger";
import { initializeSocket, disconnectSocket } from "./services/socketService";
import {
  handleBatteryUpdate,
  handleStatusUpdate,
  initializeDevice,
} from "./services/deviceService";
import {
  setMqttClient,
  handleNavigationRequest,
  addTestShelves,
} from "./services/deviceNavigationService";
import { parseMessage } from "./utils/messageParser";

dotenv.config();

const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || "mqtt://localhost:1883";
const SOCKET_SERVER_URL =
  process.env.SOCKET_SERVER_URL || "http://localhost:5000";

function setupMqttClient() {
  const client = mqtt.connect(MQTT_BROKER_URL, {
    clientId: `device_server_${Date.now()}`,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
  });

  client.on("connect", () => {
    logger.info("Connected to MQTT broker");
    // Subscribe to all device messages
    client.subscribe("device/#", (err) => {
      if (err) {
        logger.error("Failed to subscribe to device topics:", err);
      } else {
        logger.info("Subscribed to all device topics");
      }
    });
  });

  client.on("message", (topic, message) => {
    try {
      const payload = message.toString();
      logger.debug(`Received MQTT message on ${topic}: ${payload}`);

      const parts = topic.split("/");
      if (parts.length < 3) return;

      const deviceId = parts[1];
      const messageType = parts[2];

      // Initialize device if not exists
      initializeDevice(deviceId); // Parse the message using our utility

      switch (messageType) {
        case "battery": {
          const result = parseMessage<number>(payload, messageType);
          if (result.success && result.data !== undefined) {
            handleBatteryUpdate(deviceId, result.data);
          } else {
            logger.error(`Battery update failed: ${result.error}`);
          }
          break;
        }

        case "status": {
          const result = parseMessage<"idle" | "busy" | "offline" | "error">(
            payload,
            messageType
          );
          if (result.success && result.data) {
            handleStatusUpdate(deviceId, result.data);
          } else {
            logger.error(`Status update failed: ${result.error}`);
          }
          break;
        }

        default:
          logger.debug(`Unhandled message type: ${messageType}`);
      }
    } catch (error) {
      logger.error("Error processing MQTT message:", error);
    }
  });

  client.on("error", (error) => {
    logger.error("MQTT Error:", error);
  });

  client.on("close", () => {
    logger.warn("MQTT Connection closed");
  });

  return client;
}

async function testNavigation(mqttClient: mqtt.MqttClient) {
  try {
    logger.info("Running navigation test...");

    // Get test shelf slots
    const { addTestShelves } = await import(
      "./services/deviceNavigationService"
    );
    const testShelves = addTestShelves();

    // Log available test shelves
    console.table(testShelves);

    // Test navigation to each shelf
    const testDevice = "test_robot_1";
    for (const [shelfName, slotId] of Object.entries(testShelves)) {
      logger.info(`Testing navigation to ${shelfName}: ${slotId}`);

      const result = await handleNavigationRequest(testDevice, slotId);
      logger.info(`Navigation result for ${shelfName}:`, {
        directions: result.directions,
        instructionsCount: result.instructions.length,
      });
    }

    logger.info("Navigation test completed");
  } catch (error) {
    logger.error("Navigation test failed:", error);
  }
}

async function main() {
  try {
    logger.info("Starting Device Control Server...");

    // Initialize Socket.IO connection to main server
    const socket = initializeSocket(SOCKET_SERVER_URL);

    // Initialize MQTT client
    const mqttClient = setupMqttClient(); // Share MQTT client with navigation service
    setMqttClient(mqttClient);
    // Handle graceful shutdown
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

    function shutdown() {
      logger.info("Shutting down...");
      mqttClient.end();
      disconnectSocket();
      process.exit(0);
    }

    logger.info("Device Control Server initialized successfully");

    // Run navigation test
    // await testNavigation(mqttClient);
    const shelves = addTestShelves(); // Add test shelves to the grid
    console.table(shelves); // Log available shelves
  } catch (error) {
    logger.error("Failed to initialize Device Control Server:", error);
    process.exit(1);
  }
}

main();
