import type { CustomDeviceRequest, DeviceRequest } from "./device"
import type { TimeBlock } from "./timeBlock"

export type ScheduleRequest = {
  devices: (DeviceRequest | CustomDeviceRequest)[]
  timeBlocks: TimeBlock[]
}