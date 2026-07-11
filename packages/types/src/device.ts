export type Device = {
  id?: string;
  name: string;
  powerDraw: number;
  stockName: string;
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
    device: Device;
  };

export type DeviceRequest = {
  stockName: string;
  frequency: number;
  duration: number;
  isCustom: false;
}

export type CustomDeviceRequest = {
  deviceId: string;
  frequency: number;
  duration: number;
  isCustom: true;
}