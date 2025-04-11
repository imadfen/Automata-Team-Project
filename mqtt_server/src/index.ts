import { MQTTHandler } from "./services/mqttHandler";
import { DeviceController } from "./services/deviceController";
import { WarehouseService } from "./services/warehouseService";
import { RobotNavigationService } from "./services/robotNavigationService";
import { SocketService } from "./services/socketService";
import { logger } from "./utils/logger";

async function main() {
  try {
    // Initialize services
    const mqttHandler = new MQTTHandler();
    const warehouseService = new WarehouseService();

    // Initialize warehouse layout with shelves
    const shelf1 = warehouseService.addShelf({
      x: 5,
      y: 3,
      orientation: "HORIZONTAL",
    });

    const shelf2 = warehouseService.addShelf({
      x: 5,
      y: 6,
      orientation: "HORIZONTAL",
    });

    const shelf3 = warehouseService.addShelf({
      x: 10,
      y: 3,
      orientation: "HORIZONTAL",
    });

    // available shelves
    console.table({
      shelf1,
      shelf2,
      shelf3,
    });

    // // Log warehouse layout for debugging
    // logger.info("\nWarehouse Layout:");
    // logger.info("Legend: H=Home, █=Shelf, ·=Aisle, .=Empty, X=Obstacle");
    // logger.info("-".repeat(50));
    // logger.info(warehouseService.getGridVisualization());
    // logger.info("-".repeat(50));

    const socketService = new SocketService();
    const controller = new DeviceController(mqttHandler);

    // Initialize navigation service
    const navigationService = new RobotNavigationService(
      mqttHandler,
      warehouseService,
      socketService
    );

    // Initialize socket service with navigation service
    socketService.initializeNavigationService(navigationService);

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

    logger.info("MQTT Server initialized successfully");
  } catch (error) {
    logger.error("Failed to initialize MQTT server:", error);
    process.exit(1);
  }
}

main();
