export type Device = {
  id: string;
  name: string;
  draw: number;
}

export type DeviceInstance = {
  id: string;
  deviceId: string;
  frequency: number;
  duration: number;
}