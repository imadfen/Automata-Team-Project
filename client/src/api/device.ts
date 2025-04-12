import { api } from "./config";

const deviceApi = {
  getAllDevices: () => api.get("/devices"),
  getDeviceById: (id: string) => api.get(`/devices/${id}`),
  createDevice: (data: any) => api.post("/devices", data),
  updateDevice: (id: string, data: any) => api.put(`/devices/${id}`, data),
  deleteDevice: (id: string) => api.delete(`/devices/${id}`),
  updateDeviceStatus: (id: string, data: any) =>
    api.patch(`/devices/${id}/status`, data),
  getActiveDevices: () => api.get("/devices/active"),
  navigateDevice: (deviceId: string, slotId: string) =>
    api.post(`/devices/${deviceId}/navigate`, { slotId }),
};

export { deviceApi };
