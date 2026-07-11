import type { Request, Response } from "express";
import type { DeviceInstance, PopulatedDeviceInstance, ScheduleRequest } from "@bloomknights/types"
import { auth } from "../app";
import { createDevice, createDeviceInstance, populateDeviceInstance } from "../repository/deviceRepository";

export async function handleSchedulerRequest(req: Request, res: Response) {
    const body = req.body as ScheduleRequest;

    const session = await auth.api.getSession({
        headers: req.headers as Record<string, string>
    });

    // if (!session) {
    //     return res.status(401).json({ message: "User session not found"});
    // }


    const customDeviceRequests = body.devices.filter(device => device.isCustom);
    const nonCustomDeviceRequests = body.devices.filter(device => !device.isCustom);
    
    const nonCustomPromises: Promise<PopulatedDeviceInstance>[] = nonCustomDeviceRequests.map(request => convertDeviceRequestToDeviceInstance(request, session ? session.user.id : "unknown"));
    const customPromises: Promise<PopulatedDeviceInstance>[] = customDeviceRequests.map(request => convertCustomDeviceRequestToDeviceInstance(request, session ? session.user.id : "unknown"));
    
    try {
        const populatedDeviceInstances = await Promise.all(nonCustomPromises);
        const populatedCustomDeviceInstances = await Promise.all(customPromises);

        return res.json({
            devices: populatedDeviceInstances,
            customDevices: populatedCustomDeviceInstances,
        })
    } catch {
        return res.status(500).json({ message: "Error processing device instances" });
    }
}

function convertCustomDeviceRequestToDeviceInstance(request: ScheduleRequest["devices"][number], userId: string): Promise<PopulatedDeviceInstance> {
    if (!request.isCustom) {
        throw new Error("Request is not a custom device request");
    }

    return createDevice({
        stockName: "custom",
        powerDraw: request.powerDraw,
        name: request.name,
    }).then(device => {
        const deviceInstance: DeviceInstance = {
            id: crypto.randomUUID(),
            deviceId: device.id,
            frequency: request.frequency,
            duration: request.duration,
            userId,
        };

        return populateDeviceInstance(deviceInstance);
    })
}

async function convertDeviceRequestToDeviceInstance(request: ScheduleRequest["devices"][number], userId: string): Promise<PopulatedDeviceInstance> {
    if (request.isCustom) {
        throw new Error("Request is not a non-custom device request");
    }
    
    const deviceInstance: DeviceInstance = await createDeviceInstance({
        deviceId: request.deviceId,
        frequency: request.frequency,
        duration: request.duration,
        userId,
    });

    return populateDeviceInstance(deviceInstance);

}