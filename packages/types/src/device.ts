export type Device = {
  id?: string;
  name: string;
  powerDraw: number;
}

export type DeviceInstance = {
  id: string;
  deviceId: string;
  frequency: number;
  duration: number;
  userId: string;
}

export type PopulatedDeviceInstance =
  Omit<DeviceInstance, "deviceId"> & {
    device: Device | null;
  };

export type DeviceRequest = {
  deviceId: string;
  stockName: string;
  frequency: number;
  duration: number;
  name: string;
}