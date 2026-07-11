export type Device = {
  id: string;
  powerDraw: number;
  stockName: string;
  name: string;
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
  isCustom: false;
  name: string;
}

export type CustomDeviceRequest = {
  name: string;
  frequency: number;
  duration: number;
  powerDraw: number;
  isCustom: true;
}