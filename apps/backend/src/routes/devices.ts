import type { Device } from "@bloomknights/types";
import { auth, prisma } from "../app";
import type { Request, Response } from "express";

export function populateDevices() {
  const devices = [
    {
      name: "Laundry",
      //averages usage of washer and dryer combined
      // https://www.energysage.com/electricity/house-watts/how-many-watts-does-a-washing-machine-use/
      // https://www.energysage.com/electricity/house-watts/how-many-watts-does-a-clothes-dryer-use/
      powerDraw: 1.8,
      stockName: "laundry"
    },
    {
      name: "Dishwasher",
      // https://blog.se.com/sustainability/2023/01/24/how-much-electricity-does-a-refrigerator-dishwasher-and-an-electric-car-use-we-did-the-math/
      powerDraw: 1.8,
      stockName: "dishwasher"
    },
    {
        name: "PC Gaming",
        // https://www.energysage.com/electricity/house-watts/how-many-watts-does-a-computer-use/
        powerDraw: 0.4,
        stockName: "pc-gaming"
    },
    {
        name: "Light Browsing",
        // https://www.energysage.com/electricity/house-watts/how-many-watts-does-a-computer-use/
        powerDraw: 0.05,
        stockName: "pc-light"
    },
    {
        name: "EV Charging (Wall Outlet)",
        // https://www.transportation.gov/rural/ev/toolkit/ev-basics/charging-speeds
        powerDraw: 1,
        stockName: "ev-charging-wall"
    },
    {
        name: "EV Charging (External Charger)",
        // https://www.transportation.gov/rural/ev/toolkit/ev-basics/charging-speeds
        powerDraw: 8,
        stockName: "ev-charging-external"
    },
  ];

  devices.forEach(async (device) => {
    const existingDevice = await prisma.device.findFirst({
      where: {
        stockName: device.stockName
      }
    });

    if (!existingDevice) {
      await prisma.device.create({
        data: device
      });
    }
  });

  return
}

export async function createDevice(req: Request, res: Response) {

    const session = await auth.api.getSession({
        headers: req.headers as any
    });

    if(!session) {
        res.status(401).json({ message: "Unauthorized" });
        return
    }

    const data = req.body as Device

    res.json(await prisma.device.create({
        data: {
            name: data.name,
            powerDraw: data.powerDraw,
            isCustom: true
        }
    }));
}

export async function getDevices(req: Request, res: Response) {

    const session = await auth.api.getSession({
        headers: req.headers as any
    });

    if(!session) {
        res.status(401).json({ message: "Unauthorized" });
        return
    }

    const devices = await prisma.device.findMany();

    res.json(devices);
}

export async function getDeviceInstances(req: Request, res: Response) {

    const session = await auth.api.getSession({
        headers: req.headers as any
    });

    if(!session) {
        res.status(401).json({ message: "Unauthorized" });
        return
    }

    const deviceInstances = await prisma.deviceInstance.findMany({
        where: {
            userId: session.user.id
        },
        include: {
            device: true
        }
    });

    res.json(deviceInstances);
}

export async function createDeviceInstance(req: Request, res: Response) {

    const session = await auth.api.getSession({
        headers: req.headers as any
    });

    if(!session) {
        res.status(401).json({ message: "Unauthorized" });
        return
    }

    const data = req.body as any

    res.json(await prisma.deviceInstance.create({
        data: {
            deviceId: data.deviceId,
            frequency: data.frequency,
            duration: data.duration,
            userId: session.user.id
        }
    }));
}

export async function deleteDeviceInstance(req: Request, res: Response) {

    const session = await auth.api.getSession({
        headers: req.headers as any
    });

    if(!session) {
        res.status(401).json({ message: "Unauthorized" });
        return
    }

    const data = req.body as any

    const deviceInstance = await prisma.deviceInstance.findUnique({
        where: {
            id: data.id
        }
    });

    if(!deviceInstance) {
        res.status(404).json({ message: "Device instance not found" });
        return
    }

    if(deviceInstance.userId !== session.user.id) {
        res.status(403).json({ message: "Forbidden" });
        return
    }

    res.json(await prisma.deviceInstance.delete({
        where: {
            id: data.id
        }
    }));
}

export async function updateDeviceInstance(req: Request, res: Response) {

    const session = await auth.api.getSession({
        headers: req.headers as any
    });

    if(!session) {
        res.status(401).json({ message: "Unauthorized" });
        return
    }

    const data = req.body as any

    const deviceInstance = await prisma.deviceInstance.findUnique({
        where: {
            id: data.id
        }
    });

    if(!deviceInstance) {
        res.status(404).json({ message: "Device instance not found" });
        return
    }

    if(deviceInstance.userId !== session.user.id) {
        res.status(403).json({ message: "Forbidden" });
        return
    }

    res.json(await prisma.deviceInstance.update({
        where: {
            id: data.id
        },
        data: {
            frequency: data.frequency,
            duration: data.duration
        }
    }));
}