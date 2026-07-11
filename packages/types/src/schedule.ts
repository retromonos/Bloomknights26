import type { CustomDeviceRequest, DeviceRequest } from "./device"
import type { TimeBlock } from "./timeBlock"

export type ScheduleRequest = {
  devices: DeviceRequest[]
  timeBlocks: TimeBlock[]
}