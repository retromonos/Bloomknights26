const API = 'http://localhost:3001'

function authHeaders() {
  const token = localStorage.getItem('bearer_token') || ''
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }
}

type DeviceRequest = {
  stockName: string
  frequency: number
  duration: number
  isCustom: false
}

type CustomDeviceRequest = {
  deviceId: string
  frequency: number
  duration: number
  isCustom: true
}

type TimeBlockInput = {
  startTime: string
  endTime: string
  startDayOfWeek: number
  endDayOfWeek: number
  type: string
}

export type ScheduleRequest = {
  devices: (DeviceRequest | CustomDeviceRequest)[]
  timeBlocks: TimeBlockInput[]
  strategy?: 'cost' | 'environmental' | 'balanced'
}

export type GeneratedScheduleItem = {
  id: string
  name: string
  userId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  deviceId: string
  kwh: number
}

export type SchedulingWarning = {
  deviceId: string
  message: string
}

export type ScheduleResult = {
  scheduleItems: GeneratedScheduleItem[]
  warnings: SchedulingWarning[]
}

export async function generateSchedule(request: ScheduleRequest): Promise<ScheduleResult> {
  const res = await fetch(`${API}/api/schedule`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(request),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || `Schedule request failed (${res.status})`)
  }
  return res.json()
}
