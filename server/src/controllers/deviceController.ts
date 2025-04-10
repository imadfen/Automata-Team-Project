import { Request, Response } from "express";
import {
  createDevice,
  getAllDevices,
  getDeviceById,
  getDeviceByName,
  updateDevice,
  deleteDevice,
  updateDeviceStates,
  getActiveDevices,
  updateDeviceRfidTag,
  logCheckpoint,
  reportEvent,
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
    const device = await updateDeviceStates(
      req.params.id,
      status,
      batteryLevel,
      location,
    );
    if (!device) {
      return res.status(404).json({ error: "Device not found" });
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
