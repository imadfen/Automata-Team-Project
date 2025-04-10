import { MQTTHandler } from "./services/mqttHandler";
import { DeviceController } from "./services/deviceController";
import { logger } from "./utils/logger";

async function main() {
  try {
    // Initialize services
    const mqttHandler = new MQTTHandler();
    const controller = new DeviceController(mqttHandler);

    // Check socket connection status periodically
    setInterval(() => {
      logger.info(
        `Socket connection status: ${
          controller.isConnected() ? "connected" : "disconnected"
        }`
      );
    }, 30000); // Check every 30 seconds

    // Handle graceful shutdown
    process.on("SIGINT", async () => {
      logger.info("Shutting down...");
      mqttHandler.disconnect();
      controller.shutdown();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      logger.info("Shutting down...");
      mqttHandler.disconnect();
      controller.shutdown();
      process.exit(0);
    });

    // Initialize controller
    await controller.initialize();

    logger.info("MQTT Device Control Server started");
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

main();
