const API = 'http://localhost:3001'

function authHeaders() {
  const token = localStorage.getItem('bearer_token') || ''
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }
}

export async function getDevices() {
  const res = await fetch(`${API}/api/device`, { headers: authHeaders() })
  return res.json()
}

export async function createDevice(data: { name: string; powerDraw: number }) {
  const res = await fetch(`${API}/api/device/create`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function createDeviceInstance(data: { deviceId: string; frequency: number; duration: number }) {
  const res = await fetch(`${API}/api/device/instance/create`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function getDeviceInstances() {
  const res = await fetch(`${API}/api/device/instance`, { headers: authHeaders() })
  return res.json()
}

export function frequencyToNumber(freq: string) {
  if (!freq) return 7
  const lower = freq.toLowerCase()
  if (lower.includes('daily')) return 7
  const match = lower.match(/(\d+)/)
  if (match) return Number(match[1])
  return 1
}

export function minutesToHours(minutes: number) {
  return Math.round((minutes / 60) * 100) / 100
}
