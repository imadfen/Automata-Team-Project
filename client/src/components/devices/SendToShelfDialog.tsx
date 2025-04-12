import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deviceApi } from "@/api/device";
import { toast } from "sonner";

// Hardcoded shelf data for now
const SHELF_OPTIONS = [
  { id: "slot_shelf1_0_0_FRONT", label: "Shelf 1 - Front" },
  { id: "slot_shelf1_0_0_BACK", label: "Shelf 1 - Back" },
  { id: "slot_shelf2_0_0_FRONT", label: "Shelf 2 - Front" },
  { id: "slot_shelf2_0_0_BACK", label: "Shelf 2 - Back" },
  { id: "slot_shelf3_0_0_FRONT", label: "Shelf 3 - Front" },
  { id: "slot_shelf3_0_0_BACK", label: "Shelf 3 - Back" },
];

interface SendToShelfDialogProps {
  open: boolean;
  onClose: () => void;
  deviceId?: string;
}

export default function SendToShelfDialog({
  open,
  onClose,
  deviceId,
}: SendToShelfDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendToShelf = async (shelfId: string) => {
    if (!deviceId) return;

    setIsSubmitting(true);
    try {
      await deviceApi.navigateDevice(deviceId, shelfId);
      toast.success("Device started delivering to shelf");
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to start delivery");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send to Shelf</DialogTitle>
          <DialogDescription>
            Select a shelf to send the device to
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          {SHELF_OPTIONS.map((shelf) => (
            <Button
              key={shelf.id}
              onClick={() => handleSendToShelf(shelf.id)}
              disabled={isSubmitting}
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
            >
              <span className="font-medium">{shelf.label}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
