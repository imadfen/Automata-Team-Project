import { Device, IDevice } from "../models/Device.js";

export const createDevice = async (
  deviceData: Omit<IDevice, keyof Document>,
) => {
  const device = new Device(deviceData);
  return await device.save();
};

export const getAllDevices = async () => {
  return await Device.find({});
};

export const getDeviceById = async (id: string) => {
  return await Device.findById(id);
};

export const getDeviceByName = async (deviceName: string) => {
  return await Device.findOne({ deviceName });
};

export const updateDevice = async (
  id: string,
  deviceData: Partial<IDevice>,
) => {
  return await Device.findByIdAndUpdate(
    id,
    { ...deviceData, lastSeen: new Date() },
    { new: true },
  );
};

export const deleteDevice = async (id: string) => {
  return await Device.findByIdAndDelete(id);
};

export const updateDeviceBatteryLevel = async (
  id: string,
  batteryLevel: number,
) => {
  return await Device.findByIdAndUpdate(
    id,
    {
      batteryLevel,
      lastSeen: new Date(),
    },
    { new: true },
  );
};

export const updateDeviceStatus = async (
  id: string,
  status: "idle" | "busy" | "offline" | "error",
) => {
  return await Device.findByIdAndUpdate(
    id,
    {
      status,
      lastSeen: new Date(),
    },
    { new: true },
  );
};

export const updateDeviceLocation = async (id: string, location: string) => {
  return await Device.findByIdAndUpdate(
    id,
    {
      location,
      lastSeen: new Date(),
    },
    { new: true },
  );
};

export const getActiveDevices = async () => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return await Device.find({
    lastSeen: { $gte: fiveMinutesAgo },
    status: { $ne: "offline" },
  });
};

export const updateDeviceRfidTag = async (
  id: string,
  rfidTag: string | null,
) => {
  return await Device.findByIdAndUpdate(
    id,
    {
      rfidTag,
      lastSeen: new Date(),
    },
    { new: true },
  );
};

export const logCheckpoint = async (
  deviceId: string,
  checkpoint: { id: string; x: number; y: number },
  timestamp: string,
) => {
  const device = await Device.findById(deviceId);
  if (!device) {
    throw new Error("Device not found");
  }

  // Update device's last known checkpoint and timestamp
  device.lastSeen = new Date(timestamp);
  device.location = checkpoint.id;
  return await device.save();
};

export const reportEvent = async (
  deviceId: string,
  eventType: string,
  details: any,
) => {
  const device = await Device.findById(deviceId);
  if (!device) {
    throw new Error("Device not found");
  }

  // Update device status based on event type
  if (eventType === "disconnection") {
    device.status = "offline";
  } else if (eventType === "timeout") {
    device.status = "error";
  }

  device.lastSeen = new Date(details.timestamp);
  return await device.save();
};
