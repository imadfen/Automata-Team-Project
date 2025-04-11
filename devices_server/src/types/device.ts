export interface Device {
  id: string;
  deviceName: string;
  status: "idle" | "busy" | "offline" | "error";
  batteryLevel: number;
  lastSeen: Date;
  location?: string;
  rfidTag?: string | null;
}

export interface DeviceStatus {
  deviceId: string;
  status: "idle" | "busy" | "offline" | "error";
  batteryLevel: number;
  lastSeen: Date;
}
