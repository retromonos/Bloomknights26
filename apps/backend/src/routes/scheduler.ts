import type { Request, Response } from "express";
import type { CustomDeviceRequest, DeviceInstance, DeviceRequest, PopulatedDeviceInstance, PowerItem, ScheduleRequest, TimeBlock } from "@bloomknights/types"
import { auth } from "../app";
import { createDeviceInstance, getDeviceByStockName, populateDeviceInstance } from "../repository/deviceRepository";
import { createTimeBlock } from "../repository/timeBlockRepository";
import { getUtilityRatesForUser } from "../repository/utilityRepository";
import { generateWeeklySchedule } from "../lib/scheduler";

export async function handleSchedulerRequest(req: Request, res: Response) {
    try {
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
        let deviceNames: Record<string, string> = {};
        try {
            const populatedDeviceInstances = await Promise.all([...nonCustomPromises, ...customPromises]);
            powerItems = populatedDeviceInstances.map(convertPopulatedDeviceInstanceToPowerItem);
            deviceNames = Object.fromEntries(
                populatedDeviceInstances
                    .filter((d): d is PopulatedDeviceInstance & { device: { id: string } } => !!d.device.id)
                    .map((d) => [d.device.id!, d.device.name])
            );
        } catch (err) {
            return res.status(500).json({ message: "Error processing device instances", err });
        }

        let timeBlockPromises: Promise<TimeBlock | null>[] = [];
        for (const timeBlock of body.timeBlocks) {
            timeBlockPromises.push(createTimeBlock({ ...timeBlock, userId: session.user.id }));
        }

        const persistedTimeBlocks = await Promise.all(timeBlockPromises);

        const schedulerTimeBlocks = persistedTimeBlocks
            .filter((tb): tb is TimeBlock => tb !== null)
            .map((tb) => ({
                ...tb,
                userId: session.user.id,
            }));

        const utilityRates = await getUtilityRatesForUser(session.user.id);

        const weeklySchedule = generateWeeklySchedule({
            userId: session.user.id,
            powerItems,
            timeBlocks: schedulerTimeBlocks,
            utilityRates,
            strategy: { type: 'cost' },
            options: { deviceNames },
        });


        return res.json({
            scheduleItems: weeklySchedule.scheduleItems,
            warnings: weeklySchedule.warnings,
        });
    } catch (err: any) {
        res.status(err.status || 500).json({ message: "An error occurred", error: err.message });
    }
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