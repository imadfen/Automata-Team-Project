import { Server, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import {
  updateDeviceBatteryLevel,
  updateDeviceStatus,
} from "../services/deviceService.ts";
import { Device } from "../models/Device.js";
import { deviceStatus } from "../types/device.ts";

export class SocketService {
  private io: Server;
  private mqttServer: Socket | null = null;

  constructor(server: HTTPServer) {
    this.io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    this.setupSocketHandlers();
  }
  public async getAllDeviceIds(): Promise<Array<{ id: string }>> {
    try {
      const devices = await Device.find({}, "_id");
      return devices.map((d: any) => ({
        id: d._id.toString(),
      }));
    } catch (error) {
      console.error("Error fetching device IDs:", error);
      return [];
    }
  }

  public notifyDeviceListUpdate(devices: Array<{ id: string }>): void {
    if (this.mqttServer) {
      this.mqttServer.emit("devices:list", devices);
    }
  }

  public emitToMqttServer(event: string, data: any, callback?: Function): void {
    if (this.mqttServer) {
      this.mqttServer.emit(event, data, callback);
    } else {
      console.error("MQTT Server is not connected");
      callback?.({ success: false, error: "MQTT Server is not connected" });
    }
  }

  private setupSocketHandlers(): void {
    this.io.on("connection", async (socket: Socket) => {
      socket.on("register:mqtt_server", async () => {
        console.log("MQTT Server connected");
        this.mqttServer = socket;

        // Send initial device list
        const devices = await this.getAllDeviceIds();
        socket.emit("devices:list", devices);

        // Acknowledge MQTT server registration
        socket.emit("mqtt:registered");
        console.log("MQTT Server registration acknowledged");
      });

      // Handle device list requests
      socket.on("devices:list:request", async () => {
        if (socket === this.mqttServer) {
          const devices = await this.getAllDeviceIds();
          socket.emit("devices:list", devices);
        }
      });

      // Handle device errors from MQTT server
      socket.on(
        "device:error",
        async (data: {
          deviceId: string;
          error: string;
          context: string;
          timestamp: Date;
        }) => {
          if (socket === this.mqttServer) {
            // Update device status to error
            await updateDeviceStatus(data.deviceId, "error");
            // Broadcast error to all clients
            this.io.emit("device:error:reported", data);
          }
        },
      );

      // Handle device disconnections from MQTT server
      socket.on(
        "device:disconnected",
        async (data: { deviceId: string; reason: string; timestamp: Date }) => {
          if (socket === this.mqttServer) {
            // Update device status to offline in database
            await updateDeviceStatus(data.deviceId, "offline");
            // Broadcast disconnection to all clients
            this.io.emit("device:disconnected", data);
          }
        },
      );

      socket.on("disconnect", () => {
        if (socket === this.mqttServer) {
          console.warn("MQTT Server disconnected");
          this.mqttServer = null;
        }
      });

      // Handle device battery level updates from MQTT server
      socket.on(
        "device:battery",
        async (data: { deviceId: string; batteryLevel: number }) => {
          if (socket === this.mqttServer) {
            console.log("Battery level update received:", data);
            // Update device status to idle in database
            await updateDeviceBatteryLevel(data.deviceId, data.batteryLevel);
            // Broadcast battery level to all clients
            this.io.emit("device:battery", data);
          }
        },
      );

      // Handle device status updates from MQTT server
      socket.on(
        "device:status",
        async (data: { deviceId: string; status: deviceStatus }) => {
          if (socket === this.mqttServer) {
            // Update device status in database
            console.log("Device status update received:", data);
            await updateDeviceStatus(data.deviceId, data.status);
            // Broadcast status to all clients
            this.io.emit("device:status", data);
          }
        },
      );
    });
  }

  public requestBatteryLevel(deviceId: string): void {
    if (this.mqttServer) {
      this.mqttServer.emit("device:battery:request", deviceId);
    }
  }

  public requestDeviceStatus(deviceId: string): void {
    if (this.mqttServer) {
      this.mqttServer.emit("device:status:request", deviceId);
    }
  }

  public emitDeviceCommand(
    deviceId: string,
    command: Record<string, unknown>,
  ): void {
    if (this.mqttServer) {
      this.mqttServer.emit("device:command", { deviceId, ...command });
    }
  }
}
