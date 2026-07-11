import type { Request, Response } from "express";
import type { DeviceInstance, DeviceRequest, PopulatedDeviceInstance, ScheduleRequest } from "@bloomknights/types"
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
    
    const nonCustomPromises: Promise<PopulatedDeviceInstance>[] = body.devices.map(device => convertDeviceRequestToDeviceInstance(device, session ? session.user.id : "unknown"));
    
    try {
        const populatedDeviceInstances = await Promise.all(nonCustomPromises);

        return res.json({
            devices: populatedDeviceInstances,
        })
    } catch {
        return res.status(500).json({ message: "Error processing device instances" });
    }
}


async function convertDeviceRequestToDeviceInstance(request: DeviceRequest, userId: string): Promise<PopulatedDeviceInstance> {
    
    const deviceInstance: DeviceInstance = await createDeviceInstance({
        deviceId: request.deviceId,
        frequency: request.frequency,
        duration: request.duration,
        userId,
    });

    return populateDeviceInstance(deviceInstance);

}