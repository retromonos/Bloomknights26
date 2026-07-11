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
}