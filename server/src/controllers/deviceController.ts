import { Request, Response } from "express";
import { io } from "../index.js";
import {
  createDevice,
  getAllDevices,
  getDeviceById,
  getDeviceByName,
  updateDevice,
  deleteDevice,
  getActiveDevices,
  updateDeviceRfidTag,
  logCheckpoint,
  reportEvent,
  updateDeviceBatteryLevel,
  updateDeviceStatus,
  updateDeviceLocation,
} from "../services/deviceService.js";
import { notifyDeviceChange } from "../services/deviceEmitter.js";

export const createDeviceController = async (req: Request, res: Response) => {
  try {
    const device = await createDevice(req.body);
    await notifyDeviceChange();
    res.status(201).json(device);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ error: "Device name or RFID tag already exists" });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

export const getAllDevicesController = async (req: Request, res: Response) => {
  try {
    const devices = await getAllDevices();
    res.json(devices);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getDeviceByIdController = async (req: Request, res: Response) => {
  try {
    const device = await getDeviceById(req.params.id);
    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }
    res.json(device);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getDeviceByNameController = async (
  req: Request,
  res: Response,
) => {
  try {
    const device = await getDeviceByName(req.params.name);
    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }
    res.json(device);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDeviceController = async (req: Request, res: Response) => {
  try {
    const device = await updateDevice(req.params.id, req.body);
    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }
    await notifyDeviceChange();
    res.json(device);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ error: "Device name or RFID tag already exists" });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

export const deleteDeviceController = async (req: Request, res: Response) => {
  try {
    const device = await deleteDevice(req.params.id);
    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }
    await notifyDeviceChange();
    res.json({ message: "Device deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDeviceStatusController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { status, batteryLevel, location } = req.body;
    let device;

    // Only update fields that are provided in the request
    if (batteryLevel !== undefined) {
      device = await updateDeviceBatteryLevel(req.params.id, batteryLevel);
      if (!device) {
        return res.status(404).json({ error: "Device not found" });
      }
    }

    if (status !== undefined) {
      device = await updateDeviceStatus(req.params.id, status);
      if (!device) {
        return res.status(404).json({ error: "Device not found" });
      }
    }

    if (location !== undefined) {
      device = await updateDeviceLocation(req.params.id, location);
      if (!device) {
        return res.status(404).json({ error: "Device not found" });
      }
    }

    // If no fields were provided to update
    if (!device) {
      device = await getDeviceById(req.params.id);
      if (!device) {
        return res.status(404).json({ error: "Device not found" });
      }
    }

    res.json(device);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getActiveDevicesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const devices = await getActiveDevices();
    res.json(devices);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDeviceRfidTagController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { rfidTag } = req.body;
    const device = await updateDeviceRfidTag(req.params.id, rfidTag);
    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }
    res.json(device);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ error: "RFID tag already exists" });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

export const logCheckpointController = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const { checkpoint, timestamp } = req.body;
    const device = await logCheckpoint(deviceId, checkpoint, timestamp);
    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }
    res.json(device);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const reportEventController = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const { eventType, details } = req.body;
    const device = await reportEvent(deviceId, eventType, details);
    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }
    res.json(device);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const navigateDeviceController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { slotId } = req.body;

    if (!slotId) {
      return res.status(400).json({ error: "slotId is required" });
    }

    const device = await getDeviceById(id);
    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }
    console.log(`Navigating device ${id} to slot ${slotId}`);

    // Use io to emit navigation request to MQTT server
    const response = await new Promise((resolve) => {
      io.emitToMqttServer(
        "robot:navigate",
        { robotId: id, slotId },
        (response: any) => {
          resolve(response);
        },
      );
    });

    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
