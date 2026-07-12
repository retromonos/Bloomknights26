import type { CustomDeviceRequest, DeviceRequest } from "./device"
import type { TimeBlock } from "./timeBlock"

export type SchedulingStrategyType = 'cost' | 'environmental' | 'balanced'

export type ScheduleRequest = {
  devices: (DeviceRequest | CustomDeviceRequest)[]
  timeBlocks: Omit<TimeBlock, "id" | "userId">[]
  strategy?: SchedulingStrategyType
}