import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import DeviceFormModal from "@/components/devices/DeviceFormModal";
import DeleteDeviceDialog from "@/components/devices/DeleteDeviceDialog";
import SendToShelfDialog from "@/components/devices/SendToShelfDialog";
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

const statusColors = {
  idle: "default",
  busy: "secondary",
  offline: "outline",
  error: "destructive",
} as const;

export default function DevicesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editDevice, setEditDevice] = useState<Device | undefined>(undefined);
  const [deleteDevice, setDeleteDevice] = useState<Device | undefined>(
    undefined
  );
  const [sendToShelfDevice, setSendToShelfDevice] = useState<
    Device | undefined
  >(undefined);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDevices = async () => {
    try {
      const { data } = await deviceApi.getAllDevices();
      setDevices(data);
    } catch (error) {
      console.error("Failed to fetch devices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleEdit = (device: Device) => {
    setEditDevice(device);
    setModalOpen(true);
  };

  const handleAddNew = () => {
    setEditDevice(undefined);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditDevice(undefined);
  };

  const handleDelete = async () => {
    if (!deleteDevice) return;

    setIsDeleting(true);
    try {
      await deviceApi.deleteDevice(deleteDevice._id);
      fetchDevices();
    } catch (error) {
      console.error("Failed to delete device:", error);
    } finally {
      setIsDeleting(false);
      setDeleteDevice(undefined);
    }
  };

  const handleDeleteClick = (device: Device) => {
    setDeleteDevice(device);
  };

  const handleSendToShelf = (device: Device) => {
    setSendToShelfDevice(device);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredDevices = devices.filter((device) => {
    const matchesSearch = device.deviceName
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus = !statusFilter || device.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Device Management
        </h1>
        <Button onClick={handleAddNew}>Add Device</Button>
      </div>
      <DeviceFormModal
        open={modalOpen}
        onClose={handleModalClose}
        onSuccess={fetchDevices}
        editDevice={editDevice}
      />
      <DeleteDeviceDialog
        open={!!deleteDevice}
        onClose={() => setDeleteDevice(undefined)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title={`Delete ${deleteDevice?.deviceName}`}
        description="Are you sure you want to delete this device? This action cannot be undone."
      />
      <SendToShelfDialog
        open={!!sendToShelfDevice}
        onClose={() => setSendToShelfDevice(undefined)}
        deviceId={sendToShelfDevice?._id}
      />
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search devices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">{statusFilter || "All Status"}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuItem onClick={() => setStatusFilter(null)}>
              All Status
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("idle")}>
              Idle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("busy")}>
              Busy
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("offline")}>
              Offline
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("error")}>
              Error
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Battery</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>RFID Tag</TableHead>
              <TableHead>Last Seen</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-slate-500"
                >
                  Loading devices...
                </TableCell>
              </TableRow>
            ) : filteredDevices.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-slate-500"
                >
                  No devices found
                </TableCell>
              </TableRow>
            ) : (
              filteredDevices.map((device) => (
                <TableRow key={device._id}>
                  <TableCell className="font-medium">
                    {device.deviceName}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[device.status]}>
                      {device.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          device.batteryLevel > 20
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      />
                      {device.batteryLevel}%
                    </div>
                  </TableCell>
                  <TableCell>{device.location || "-"}</TableCell>
                  <TableCell>{device.rfidTag || "-"}</TableCell>
                  <TableCell>{formatDate(device.lastSeen)}</TableCell>{" "}
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleSendToShelf(device)}
                      disabled={device.status !== "idle"}
                    >
                      Send to Shelf
                    </Button>
                    <Button size="sm" onClick={() => handleEdit(device)}>
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(device)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
