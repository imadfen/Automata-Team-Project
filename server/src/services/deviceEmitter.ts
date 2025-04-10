import { io } from "../index.js";

export const notifyDeviceChange = async () => {
  try {
    if (io) {
      const devices = await io.getAllDeviceIds();
      io.notifyDeviceListUpdate(devices);
    }
  } catch (error) {
    console.error("Error notifying device change:", error);
  }
};
