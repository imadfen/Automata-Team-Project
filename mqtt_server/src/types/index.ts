export interface DeviceTopics {
  battery: string;
  status: string;
  command: string;
}

export interface MQTTMessage {
  topic: string;
  payload: string;
}

export interface DeviceStatus {
  id: string;
  isOnline: boolean;
  batteryLevel: number;
  lastSeen: Date;
}
