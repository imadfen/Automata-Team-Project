import { io, Socket } from "socket.io-client";
import { logger } from "../utils/logger";
import { Device } from "../types/device";
import { handleNavigationRequest } from "./deviceNavigationService";

let socket: Socket;

export function initializeSocket(serverUrl: string = "http://localhost:5000") {
  socket = io(serverUrl, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });

  setupSocketListeners();
  return socket;
}

function setupSocketListeners() {
  socket.on("connect", () => {
    logger.info("Connected to main server");
    registerAsMqttServer();
  });

  socket.on("disconnect", () => {
    logger.warn("Disconnected from main server");
  });

  socket.on("error", (error: any) => {
    logger.error("Socket connection error:", error);
  });

  // Handle robot navigation requests from main server
  socket.on(
    "robot:navigate",
    async (data: { robotId: string; slotId: string }, callback) => {
      try {
        const result = await handleNavigationRequest(data.robotId, data.slotId);
        callback({
          success: true,
          path: result.directions,
          instructions: result.instructions,
        });
      } catch (error: any) {
        logger.error("Navigation request failed:", error);
        callback({ success: false, error: error.message });
      }
    }
  );

  // Handle device list requests
  socket.on("devices:list:request", () => {
    // Import dynamically to avoid circular dependency
    const { getAllDevices } = require("./deviceService");
    const devices = getAllDevices();
    socket.emit(
      "devices:list",
      devices.map((d: any) => ({ id: d.id, type: "device" }))
    );
  });

  socket.on("mqtt:registered", () => {
    logger.info("MQTT server registration acknowledged");
  });
}

function registerAsMqttServer() {
  socket.emit("register:mqtt_server");
  logger.info("Sent MQTT server registration");
}

export function socketEmit(event: string, data: any, callback?: Function) {
  if (socket && socket.connected) {
    socket.emit(event, data, callback);
    logger.debug(`Emitted ${event}:`, data);
  } else {
    logger.warn(`Failed to emit ${event}: Socket not connected`);
  }
}

export function isSocketConnected(): boolean {
  return socket?.connected || false;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    logger.info("Socket disconnected");
  }
}
