import { prisma } from "../app";
import type { Device, DeviceInstance, PopulatedDeviceInstance } from "@bloomknights/types"

export async function getDeviceById(id: string): Promise<Device | null> {
  const result = await prisma.device.findUnique({
    where: {
      id: id
    }
  });

  if (!result) return null;

  return {
    id: result.id,
    powerDraw: result.powerDraw,
    stockName: result.stockName,
    name: result.name,
  }
}

export async function populateDeviceInstance(deviceInstance: DeviceInstance): Promise<PopulatedDeviceInstance> {
    const device = await getDeviceById(deviceInstance.deviceId);

    if (!device) {
      throw new Error(`Device with ID ${deviceInstance.deviceId} not found`);
    }

    return {
      id: deviceInstance.id,
      frequency: deviceInstance.frequency,
      duration: deviceInstance.duration,
      device: device,
      userId: deviceInstance.userId,
    };
}

export async function createDevice(device: Omit<Device, "id">): Promise<Device> {
  const result = await prisma.device.create({
    data: {
      name: device.name,
      powerDraw: device.powerDraw,
      stockName: device.stockName,
    }
  });

  return {
    id: result.id,
    name: result.name,
    powerDraw: result.powerDraw,
    stockName: result.stockName,
  }
}

export async function createDeviceInstance(deviceInstance: Omit<DeviceInstance, "id">): Promise<DeviceInstance> {
    const result = await prisma.deviceInstance.create({
        data: {
            deviceId: deviceInstance.deviceId,
            frequency: deviceInstance.frequency,
            duration: deviceInstance.duration,
            userId: deviceInstance.userId,
        }
    });

    return {
        id: result.id,
        deviceId: result.deviceId,
        frequency: result.frequency,
        duration: result.duration,
        userId: result.userId,
    }
}

export async function getDeviceByStockName(stockName: string): Promise<Device | null> {
    const result = await prisma.device.findFirst({
        where: {
            stockName: stockName,
        }
    });


    if (!result) return null;

    return {
        id: result.id,
        powerDraw: result.powerDraw,
        stockName: result.stockName,
        name: result.name,
    }
}