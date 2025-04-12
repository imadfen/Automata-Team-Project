import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { deviceApi } from "@/api/device";

interface Device {
  _id: string;
  deviceName: string;
  batteryLevel: number;
  status: "idle" | "busy" | "offline" | "error";
  rfidTag?: string;
  location?: string;
  lastSeen: Date;
}

interface DeviceFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editDevice?: Device;
}

export default function DeviceFormModal({
  open,
  onClose,
  onSuccess,
  editDevice,
}: DeviceFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    deviceName: "",
    rfidTag: "",
    location: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editDevice) {
      setFormData({
        deviceName: editDevice.deviceName,
        rfidTag: editDevice.rfidTag || "",
        location: editDevice.location || "",
      });
    } else {
      setFormData({
        deviceName: "",
        rfidTag: "",
        location: "",
      });
    }
    setError(null);
  }, [editDevice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (editDevice) {
        await deviceApi.updateDevice(editDevice._id, formData);
      } else {
        await deviceApi.createDevice(formData);
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      setError(error.response?.data?.error || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editDevice ? "Edit Device" : "Add New Device"}
          </DialogTitle>
          <DialogDescription>
            {editDevice
              ? "Update the device details below"
              : "Fill in the device details below"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="deviceName" className="text-sm font-medium">
              Device Name *
            </label>
            <Input
              id="deviceName"
              value={formData.deviceName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  deviceName: e.target.value,
                }))
              }
              placeholder="Enter device name"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="rfidTag" className="text-sm font-medium">
              RFID Tag
            </label>
            <Input
              id="rfidTag"
              value={formData.rfidTag}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  rfidTag: e.target.value,
                }))
              }
              placeholder="Enter RFID tag"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium">
              Location
            </label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  location: e.target.value,
                }))
              }
              placeholder="Enter location"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : editDevice
                ? "Update Device"
                : "Add Device"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
