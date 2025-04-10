import express, { RequestHandler } from "express";
import { auth } from "../middlewares/auth.js";
import {
  createDeviceController,
  getAllDevicesController,
  getDeviceByIdController,
  getDeviceByNameController,
  updateDeviceController,
  deleteDeviceController,
  updateDeviceStatusController,
  getActiveDevicesController,
  updateDeviceRfidTagController,
  logCheckpointController,
  reportEventController,
} from "../controllers/deviceController.js";

const router = express.Router();

// Protected routes - require authentication
router.post("/", createDeviceController as RequestHandler);
router.get("/", getAllDevicesController as RequestHandler);
router.get("/active", getActiveDevicesController as RequestHandler);
router.get("/name/:name", getDeviceByNameController as RequestHandler);
router.get("/:id", getDeviceByIdController as RequestHandler);
router.put("/:id", updateDeviceController as RequestHandler);
router.delete("/:id", deleteDeviceController as RequestHandler);
router.patch("/:id/status", updateDeviceStatusController as RequestHandler);
router.patch("/:id/rfid", updateDeviceRfidTagController as RequestHandler);

// New routes for MQTT server integration
router.post(
  "/:deviceId/checkpoints",
  logCheckpointController as RequestHandler,
);
router.post("/:deviceId/events", reportEventController as RequestHandler);

export default router;
