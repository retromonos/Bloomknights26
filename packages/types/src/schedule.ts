import { DeviceInstance } from "./device"
import { TimeBlock } from "./timeBlock"

export type ScheduleRequest = {
  devices: DeviceInstance[]
  timeBlocks: TimeBlock[]
}