export interface deviceStatus {
  id: string;
  status: "idle" | "busy" | "offline" | "error";
  batteryLevel: number;
  lastSeen: Date;
}

export interface Device {
  id: string;
  deviceName: string;
  status: "idle" | "busy" | "offline" | "error";
  batteryLevel: number;
  lastSeen: Date;
  location?: string;
  rfidTag?: string | null;
}
