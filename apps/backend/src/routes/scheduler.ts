import type { Request, Response } from "express";
import type { CustomDeviceRequest, DeviceInstance, DeviceRequest, PopulatedDeviceInstance, PowerItem, ScheduleRequest } from "@bloomknights/types"
import { auth } from "../app";
import { createDevice, createDeviceInstance, getDeviceByStockName, populateDeviceInstance } from "../repository/deviceRepository";

export async function handleSchedulerRequest(req: Request, res: Response) {
    const body = req.body as ScheduleRequest;

    const session = await auth.api.getSession({
        headers: req.headers as Record<string, string>
    });

    if (!session) {
        return res.status(401).json({ message: "User session not found"});
    }

    const nonCustomPromises: Promise<PopulatedDeviceInstance>[] = body.devices.filter(device => !device.isCustom).map(device => convertDeviceRequestToDeviceInstance(device, session.user.id));
    // const nonCustomPromises: Promise<PopulatedDeviceInstance>[] = [];
    // const customPromises: Promise<PopulatedDeviceInstance>[] = body.devices.filter(device => device.isCustom).map(device => convertCustomDeviceRequestToDeviceInstance(device, session.user.id));
    const customPromises: Promise<PopulatedDeviceInstance>[] = [];


    let powerItems: PowerItem[] = [];
    try {
        const populatedDeviceInstances = await Promise.all([...nonCustomPromises, ...customPromises]);
        powerItems = populatedDeviceInstances.map(convertPopulatedDeviceInstanceToPowerItem);
    } catch (err) {
        return res.status(500).json({ message: "Error processing device instances", err });
    }


    return res.json({
        powerItems: powerItems,
    });
}


async function convertCustomDeviceRequestToDeviceInstance(request: CustomDeviceRequest, userId: string): Promise<PopulatedDeviceInstance> {
    
    const deviceInstance: DeviceInstance = await createDeviceInstance({
        deviceId: request.deviceId,
        frequency: request.frequency,
        duration: request.duration,
        userId,
    });

    return populateDeviceInstance(deviceInstance);

}

async function convertDeviceRequestToDeviceInstance(request: DeviceRequest, userId: string): Promise<PopulatedDeviceInstance> {
    const device = await getDeviceByStockName(request.stockName);
    if (!device || !device.id) {
        throw new Error(`Device with stock name ${request.stockName} not found`);
    }

    const deviceInstance: DeviceInstance = await createDeviceInstance({
        deviceId: device.id,
        frequency: request.frequency,
        duration: request.duration,
        userId,
    });


    return populateDeviceInstance(deviceInstance);
}

function convertPopulatedDeviceInstanceToPowerItem(populatedDeviceInstance: PopulatedDeviceInstance): PowerItem {
    if (!populatedDeviceInstance.device.id) {
        throw new Error("Device ID is missing in populated device instance");
    }

    return {
        deviceId: populatedDeviceInstance.device.id,
        frequency: populatedDeviceInstance.frequency,
        duration: populatedDeviceInstance.duration,
        powerDraw: populatedDeviceInstance.device.powerDraw,
    }
}